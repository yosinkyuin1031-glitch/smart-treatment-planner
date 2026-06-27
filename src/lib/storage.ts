import { MenuItem, PlanSet, Plan, PlanItem } from './types';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';

const MENU_KEY = 'menu-proposal-items';
const PLAN_KEY = 'menu-proposal-plans';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Default Data ──

const defaultMenuItems: MenuItem[] = [
  { id: '1', category: '施術系', name: '神経整体施術', price: 10000, duration: 50, unit: '回', description: '自律神経・脳神経にアプローチする根本施術', recommended: true, isNew: false, order: 1 },
  { id: '2', category: '施術系', name: '内臓整体', price: 6600, duration: 30, unit: '回', description: '内臓機能を活性化する手技療法', recommended: false, isNew: false, order: 2 },
  { id: '3', category: '施術系', name: 'メディカルヘッドスパ', price: 6600, duration: 30, unit: '回', description: '頭蓋骨調整を含むリラクゼーション', recommended: false, isNew: true, order: 3 },
  { id: '4', category: '物販系', name: '血流改善サプリ', price: 11000, unit: 'ヶ月', description: '血行促進のための栄養補助食品', recommended: false, isNew: false, order: 4 },
  { id: '5', category: '物販系', name: '腸内環境改善サプリ', price: 4400, unit: 'ヶ月', description: '腸内フローラを整えるサプリメント', recommended: false, isNew: false, order: 5 },
  { id: '6', category: '物販系', name: 'ビタミンB群', price: 5500, unit: 'ヶ月', description: '神経機能サポートのビタミン', recommended: false, isNew: false, order: 6 },
  { id: '7', category: '物販系', name: 'ビタミンC', price: 5500, unit: 'ヶ月', description: '免疫力・回復力アップのサプリ', recommended: false, isNew: false, order: 7 },
  { id: '8', category: 'オプション系', name: '歩行指導プログラム', price: 30000, unit: 'セット', description: '正しい歩行パターンの指導', recommended: false, isNew: false, order: 8 },
  { id: '9', category: 'オプション系', name: '栄養指導', price: 20000, unit: 'セット', description: '食事改善の個別指導プログラム', recommended: false, isNew: false, order: 9 },
  { id: '10', category: 'オプション系', name: 'ブレイントレーニング', price: 30000, unit: 'セット', description: '脳機能向上のトレーニング', recommended: false, isNew: true, order: 10 },
  { id: '11', category: 'オプション系', name: 'セルフケア指導', price: 0, unit: '回', description: '自宅でのケア方法の指導', recommended: false, isNew: false, order: 11 },
  { id: '12', category: 'オプション系', name: 'DNA検査', price: 29800, unit: '回', description: '遺伝子検査による体質分析', recommended: false, isNew: false, order: 12 },
];

// ── Auth ──

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event: string, session: Session | null) => {
      callback(session?.user ?? null);
    }
  );
  return subscription;
}

// ── Helper: DB row <-> App type conversions ──

function dbRowToMenuItem(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    category: row.category as MenuItem['category'],
    name: row.name as string,
    price: row.price as number,
    originalPrice: (row.original_price as number) || undefined,
    duration: (row.duration as number) || undefined,
    unit: (row.unit as string) || '回',
    description: (row.description as string) || undefined,
    recommended: (row.recommended as boolean) || false,
    isNew: (row.is_new as boolean) || false,
    courseMonths: (row.course_months as number) || undefined,
    coursePrice: (row.course_price as number) || undefined,
    order: (row.sort_order as number) || 0,
  };
}

function menuItemToDbRow(item: MenuItem, userId: string) {
  return {
    id: item.id,
    user_id: userId,
    category: item.category,
    name: item.name,
    price: item.price,
    original_price: item.originalPrice || null,
    duration: item.duration || null,
    unit: item.unit,
    description: item.description || null,
    recommended: item.recommended,
    is_new: item.isNew,
    course_months: item.courseMonths || null,
    course_price: item.coursePrice || null,
    sort_order: item.order,
    updated_at: new Date().toISOString(),
  };
}

// ── Menu Items ──

export function getMenuItems(): MenuItem[] {
  if (typeof window === 'undefined') return defaultMenuItems;
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (!raw) return defaultMenuItems;
    return JSON.parse(raw);
  } catch {
    return defaultMenuItems;
  }
}

export async function getMenuItemsFromDB(): Promise<MenuItem[]> {
  const user = await getUser();
  if (!user) return getMenuItems();

  try {
    const { data, error } = await supabase
      .from('mp_menu_items')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return defaultMenuItems;
    return data.map(dbRowToMenuItem);
  } catch {
    return getMenuItems();
  }
}

export function saveMenuItems(items: MenuItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

export async function saveMenuItemsToDB(items: MenuItem[]): Promise<void> {
  const user = await getUser();
  if (!user) {
    saveMenuItems(items);
    return;
  }

  try {
    // Delete existing items for this user
    await supabase
      .from('mp_menu_items')
      .delete()
      .eq('user_id', user.id);

    // Insert all items
    if (items.length > 0) {
      const rows = items.map(item => {
        const row = menuItemToDbRow(item, user.id);
        // Remove the old localStorage id, let DB generate UUID if needed
        // But keep it if it's already a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
        if (!isUUID) {
          const { id: _id, ...rest } = row;
          return rest;
        }
        return row;
      });

      const { error } = await supabase.from('mp_menu_items').insert(rows);
      if (error) throw error;
    }

    // Also keep localStorage in sync as fallback
    saveMenuItems(items);
  } catch (err) {
    console.error('Failed to save menu items to DB:', err);
    saveMenuItems(items);
  }
}

export async function saveMenuItem(item: MenuItem): Promise<void> {
  const user = await getUser();
  if (!user) {
    // localStorage fallback
    const items = getMenuItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    saveMenuItems(items);
    return;
  }

  try {
    const row = menuItemToDbRow(item, user.id);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);

    if (isUUID) {
      const { error } = await supabase.from('mp_menu_items').upsert(row);
      if (error) throw error;
    } else {
      const { id: _id, ...rest } = row;
      const { error } = await supabase.from('mp_menu_items').insert(rest);
      if (error) throw error;
    }
  } catch (err) {
    console.error('Failed to save menu item:', err);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const user = await getUser();
  if (!user) {
    saveMenuItems(getMenuItems().filter(i => i.id !== id));
    return;
  }

  try {
    const { error } = await supabase.from('mp_menu_items').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to delete menu item:', err);
  }
}

// ── Plan Sets ──

export function getPlanSets(): PlanSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePlanSets(sets: PlanSet[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAN_KEY, JSON.stringify(sets));
}

function buildPlanSetFromDBRows(
  setRow: Record<string, unknown>,
  planRows: Record<string, unknown>[],
  itemRows: Record<string, unknown>[]
): PlanSet {
  const plans: Plan[] = planRows
    .filter(p => p.plan_set_id === setRow.id)
    .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
    .map(p => {
      const planItems: PlanItem[] = itemRows
        .filter(i => i.plan_id === p.id)
        .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
        .map(i => ({
          menuItemId: (i.menu_item_id as string) || '',
          menuItemName: i.menu_item_name as string,
          unitPrice: i.unit_price as number,
          quantity: i.quantity as number,
          unit: (i.unit as string) || '回',
          subtotal: (i.unit_price as number) * (i.quantity as number),
        }));

      return {
        id: p.id as string,
        name: p.name as string,
        label: p.label as string,
        items: planItems,
        totalPrice: planItems.reduce((sum, i) => sum + i.subtotal, 0),
        isRecommended: (p.is_recommended as boolean) || false,
      };
    });

  return {
    id: setRow.id as string,
    name: setRow.name as string,
    plans,
    createdAt: (setRow.created_at as string) || new Date().toISOString(),
  };
}

export async function getPlanSetsFromDB(): Promise<PlanSet[]> {
  const user = await getUser();
  if (!user) return getPlanSets();

  try {
    const { data: setRows, error: setErr } = await supabase
      .from('mp_plan_sets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (setErr) throw setErr;
    if (!setRows || setRows.length === 0) return [];

    const setIds = setRows.map(s => s.id);

    const { data: planRows, error: planErr } = await supabase
      .from('mp_plans')
      .select('*')
      .in('plan_set_id', setIds);

    if (planErr) throw planErr;

    const planIds = (planRows || []).map(p => p.id);

    let itemRows: Record<string, unknown>[] = [];
    if (planIds.length > 0) {
      const { data: items, error: itemErr } = await supabase
        .from('mp_plan_items')
        .select('*')
        .in('plan_id', planIds);

      if (itemErr) throw itemErr;
      itemRows = items || [];
    }

    return setRows.map(setRow => buildPlanSetFromDBRows(setRow, planRows || [], itemRows));
  } catch {
    return getPlanSets();
  }
}

export async function savePlanSetToDB(planSet: PlanSet): Promise<void> {
  const user = await getUser();
  if (!user) {
    savePlanSet(planSet);
    return;
  }

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planSet.id);

    // Upsert plan set
    if (isUUID) {
      // Delete existing plans and items for this set first
      const { data: existingPlans } = await supabase
        .from('mp_plans')
        .select('id')
        .eq('plan_set_id', planSet.id);

      if (existingPlans && existingPlans.length > 0) {
        const existingPlanIds = existingPlans.map(p => p.id);
        await supabase.from('mp_plan_items').delete().in('plan_id', existingPlanIds);
        await supabase.from('mp_plans').delete().eq('plan_set_id', planSet.id);
      }

      const { error } = await supabase.from('mp_plan_sets').upsert({
        id: planSet.id,
        user_id: user.id,
        name: planSet.name,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } else {
      // Insert new plan set
      const { data, error } = await supabase.from('mp_plan_sets').insert({
        user_id: user.id,
        name: planSet.name,
      }).select().single();
      if (error) throw error;
      planSet.id = data.id;
    }

    // Insert plans
    for (let i = 0; i < planSet.plans.length; i++) {
      const plan = planSet.plans[i];
      const planIsUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(plan.id);

      const planInsert: Record<string, unknown> = {
        plan_set_id: planSet.id,
        name: plan.name,
        label: plan.label,
        is_recommended: plan.isRecommended || false,
        sort_order: i,
      };
      if (planIsUUID) planInsert.id = plan.id;

      const { data: planData, error: planErr } = await supabase
        .from('mp_plans')
        .insert(planInsert)
        .select()
        .single();
      if (planErr) throw planErr;

      const planDbId = planData.id;

      // Insert plan items
      if (plan.items.length > 0) {
        const planItemRows = plan.items.map((item, idx) => ({
          plan_id: planDbId,
          menu_item_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.menuItemId) ? item.menuItemId : null,
          menu_item_name: item.menuItemName,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          unit: item.unit,
          sort_order: idx,
        }));

        const { error: itemErr } = await supabase.from('mp_plan_items').insert(planItemRows);
        if (itemErr) throw itemErr;
      }
    }

    // Also keep localStorage in sync
    savePlanSet(planSet);
  } catch (err) {
    console.error('Failed to save plan set to DB:', err);
    savePlanSet(planSet);
  }
}

export function savePlanSet(planSet: PlanSet): void {
  const sets = getPlanSets();
  const idx = sets.findIndex(s => s.id === planSet.id);
  if (idx >= 0) {
    sets[idx] = planSet;
  } else {
    sets.push(planSet);
  }
  savePlanSets(sets);
}

export async function deletePlanSetFromDB(id: string): Promise<void> {
  const user = await getUser();
  if (!user) {
    deletePlanSet(id);
    return;
  }

  try {
    // Cascade will handle plans and items
    const { error } = await supabase.from('mp_plan_sets').delete().eq('id', id);
    if (error) throw error;
    deletePlanSet(id);
  } catch (err) {
    console.error('Failed to delete plan set from DB:', err);
    deletePlanSet(id);
  }
}

export function deletePlanSet(id: string): void {
  const sets = getPlanSets().filter(s => s.id !== id);
  savePlanSets(sets);
}

export function getPlanSetById(id: string): PlanSet | undefined {
  return getPlanSets().find(s => s.id === id);
}

export async function getPlanSetByIdFromDB(id: string): Promise<PlanSet | undefined> {
  const user = await getUser();
  if (!user) return getPlanSetById(id);

  try {
    const { data: setRow, error: setErr } = await supabase
      .from('mp_plan_sets')
      .select('*')
      .eq('id', id)
      .single();

    if (setErr || !setRow) return getPlanSetById(id);

    const { data: planRows } = await supabase
      .from('mp_plans')
      .select('*')
      .eq('plan_set_id', id);

    const planIds = (planRows || []).map(p => p.id);
    let itemRows: Record<string, unknown>[] = [];
    if (planIds.length > 0) {
      const { data: items } = await supabase
        .from('mp_plan_items')
        .select('*')
        .in('plan_id', planIds);
      itemRows = items || [];
    }

    return buildPlanSetFromDBRows(setRow, planRows || [], itemRows);
  } catch {
    return getPlanSetById(id);
  }
}

// ── Export / Import ──

export function exportAllData(): string {
  return JSON.stringify({
    menuItems: getMenuItems(),
    planSets: getPlanSets(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export async function exportAllDataFromDB(): Promise<string> {
  const menuItems = await getMenuItemsFromDB();
  const planSets = await getPlanSetsFromDB();
  return JSON.stringify({
    menuItems,
    planSets,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importAllData(json: string): { menuItems: MenuItem[]; planSets: PlanSet[] } {
  const data = JSON.parse(json);
  if (data.menuItems) saveMenuItems(data.menuItems);
  if (data.planSets) savePlanSets(data.planSets);
  return { menuItems: data.menuItems || [], planSets: data.planSets || [] };
}

export async function importAllDataToDB(json: string): Promise<{ menuItems: MenuItem[]; planSets: PlanSet[] }> {
  const data = JSON.parse(json);
  const menuItems: MenuItem[] = data.menuItems || [];
  const planSets: PlanSet[] = data.planSets || [];

  const user = await getUser();
  if (!user) {
    return importAllData(json);
  }

  if (menuItems.length > 0) {
    await saveMenuItemsToDB(menuItems);
  }

  for (const ps of planSets) {
    await savePlanSetToDB(ps);
  }

  return { menuItems, planSets };
}

// ====== Proposals (9セクション症状別提案書) ======

import { Proposal, ProposalSection } from './types';

const PROPOSAL_KEY = 'treatment-planner-proposals';

function mapProposalRow(row: Record<string, unknown>): Proposal {
  return {
    id: row.id as string,
    patientName: (row.patient_name as string) || '',
    patientAge: row.patient_age as number | undefined,
    patientGender: row.patient_gender as Proposal['patientGender'],
    symptomCategory: (row.symptom_category as Proposal['symptomCategory']) || 'その他',
    severity: (row.severity as Proposal['severity']) || '中度',
    chiefComplaint: (row.chief_complaint as string) || '',
    background: (row.background as string) || '',
    observation: (row.observation as string) || '',
    specialNotes: (row.special_notes as string) || '',
    planSetId: (row.plan_set_id as string) || undefined,
    sections: (row.sections as ProposalSection[]) || [],
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

export function getProposalsLocal(): Proposal[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PROPOSAL_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Proposal[];
  } catch {
    return [];
  }
}

export function saveProposalsLocal(list: Proposal[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROPOSAL_KEY, JSON.stringify(list));
}

export async function getProposalsFromDB(): Promise<Proposal[]> {
  const user = await getUser();
  if (!user) return getProposalsLocal();
  const { data, error } = await supabase
    .from('mp_proposals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProposalRow);
}

export async function saveProposalToDB(p: Proposal): Promise<Proposal> {
  const user = await getUser();
  if (!user) {
    const list = getProposalsLocal();
    const idx = list.findIndex((x) => x.id === p.id);
    if (idx >= 0) list[idx] = p;
    else list.push(p);
    saveProposalsLocal(list);
    return p;
  }
  const now = new Date().toISOString();
  const payload = {
    user_id: user.id,
    patient_name: p.patientName,
    patient_age: p.patientAge ?? null,
    patient_gender: p.patientGender ?? null,
    symptom_category: p.symptomCategory,
    severity: p.severity,
    chief_complaint: p.chiefComplaint,
    background: p.background,
    observation: p.observation,
    special_notes: p.specialNotes || '',
    plan_set_id: p.planSetId || null,
    sections: p.sections,
    updated_at: now,
  };
  const isNew = !p.id || p.id.startsWith('local-');
  if (isNew) {
    const { data, error } = await supabase
      .from('mp_proposals')
      .insert({ ...payload, created_at: now })
      .select()
      .single();
    if (error) throw error;
    return mapProposalRow(data);
  } else {
    const { data, error } = await supabase
      .from('mp_proposals')
      .update(payload)
      .eq('id', p.id)
      .select()
      .single();
    if (error) throw error;
    return mapProposalRow(data);
  }
}

export async function deleteProposalFromDB(id: string): Promise<void> {
  const user = await getUser();
  if (!user) {
    const list = getProposalsLocal().filter((x) => x.id !== id);
    saveProposalsLocal(list);
    return;
  }
  const { error } = await supabase.from('mp_proposals').delete().eq('id', id);
  if (error) throw error;
}
