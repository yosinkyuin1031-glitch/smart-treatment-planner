'use client';

import { useState } from 'react';
import { MenuItem, PlanSet, Plan, PlanItem, CATEGORIES } from '@/lib/types';
import { generateId, savePlanSetToDB, deletePlanSetFromDB } from '@/lib/storage';

interface Props {
  items: MenuItem[];
  planSets: PlanSet[];
  onChange: (sets: PlanSet[]) => void;
}

const PLAN_TEMPLATES = [
  { name: 'Silver', label: 'シルバー' },
  { name: 'Gold', label: 'ゴールド' },
  { name: 'Platinum', label: 'プラチナ' },
];

const PLAN_COLORS = [
  'from-slate-100 to-slate-200',
  'from-amber-50 to-amber-100',
  'from-blue-50 to-blue-100',
];

export default function PlanBuilder({ items, planSets, onChange }: Props) {
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<PlanSet | null>(null);
  const [addingToPlanId, setAddingToPlanId] = useState<string | null>(null);

  function createNewSet() {
    const newSet: PlanSet = {
      id: generateId(),
      name: '新しいプランセット',
      plans: PLAN_TEMPLATES.map(t => ({
        id: generateId(),
        name: t.name,
        label: t.label,
        items: [],
        totalPrice: 0,
      })),
      createdAt: new Date().toISOString(),
    };
    setEditingSetId(newSet.id);
    setEditingSet(newSet);
  }

  function startEdit(set: PlanSet) {
    setEditingSetId(set.id);
    setEditingSet(JSON.parse(JSON.stringify(set)));
  }

  async function saveCurrentSet() {
    if (!editingSet) return;
    await savePlanSetToDB(editingSet);
    const updated = planSets.some(s => s.id === editingSet.id)
      ? planSets.map(s => s.id === editingSet.id ? editingSet : s)
      : [...planSets, editingSet];
    onChange(updated);
    setEditingSetId(null);
    setEditingSet(null);
  }

  function cancelEdit() {
    setEditingSetId(null);
    setEditingSet(null);
  }

  async function deleteSet(id: string) {
    if (!confirm('このプランセットを削除しますか？')) return;
    await deletePlanSetFromDB(id);
    onChange(planSets.filter(s => s.id !== id));
  }

  async function duplicateSet(set: PlanSet) {
    const dup: PlanSet = {
      ...JSON.parse(JSON.stringify(set)),
      id: generateId(),
      name: set.name + ' (コピー)',
      createdAt: new Date().toISOString(),
    };
    await savePlanSetToDB(dup);
    onChange([...planSets, dup]);
  }

  function addItemToPlan(planId: string, menuItem: MenuItem) {
    if (!editingSet) return;
    const planIdx = editingSet.plans.findIndex(p => p.id === planId);
    if (planIdx < 0) return;

    const plan = editingSet.plans[planIdx];
    if (plan.items.some(i => i.menuItemId === menuItem.id)) return;

    const newItem: PlanItem = {
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      unitPrice: menuItem.price,
      quantity: 1,
      unit: menuItem.unit,
      subtotal: menuItem.price,
    };

    const updatedPlan = {
      ...plan,
      items: [...plan.items, newItem],
      totalPrice: plan.totalPrice + newItem.subtotal,
    };

    const updatedPlans = [...editingSet.plans];
    updatedPlans[planIdx] = updatedPlan;
    setEditingSet({ ...editingSet, plans: updatedPlans });
    setAddingToPlanId(null);
  }

  function updatePlanItem(planId: string, itemIdx: number, field: 'quantity' | 'unitPrice', value: number) {
    if (!editingSet) return;
    const planIdx = editingSet.plans.findIndex(p => p.id === planId);
    if (planIdx < 0) return;

    const plan = editingSet.plans[planIdx];
    const updatedItems = [...plan.items];
    updatedItems[itemIdx] = {
      ...updatedItems[itemIdx],
      [field]: value,
      subtotal: field === 'quantity' ? value * updatedItems[itemIdx].unitPrice : updatedItems[itemIdx].quantity * value,
    };

    const updatedPlan = {
      ...plan,
      items: updatedItems,
      totalPrice: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
    };

    const updatedPlans = [...editingSet.plans];
    updatedPlans[planIdx] = updatedPlan;
    setEditingSet({ ...editingSet, plans: updatedPlans });
  }

  function removePlanItem(planId: string, itemIdx: number) {
    if (!editingSet) return;
    const planIdx = editingSet.plans.findIndex(p => p.id === planId);
    if (planIdx < 0) return;

    const plan = editingSet.plans[planIdx];
    const updatedItems = plan.items.filter((_, i) => i !== itemIdx);
    const updatedPlan = {
      ...plan,
      items: updatedItems,
      totalPrice: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
    };

    const updatedPlans = [...editingSet.plans];
    updatedPlans[planIdx] = updatedPlan;
    setEditingSet({ ...editingSet, plans: updatedPlans });
  }

  function toggleRecommended(planId: string) {
    if (!editingSet) return;
    const updatedPlans = editingSet.plans.map(p => ({
      ...p,
      isRecommended: p.id === planId ? !p.isRecommended : false,
    }));
    setEditingSet({ ...editingSet, plans: updatedPlans });
  }

  // ── Editing mode ──
  if (editingSet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-700 text-sm">← 戻る</button>
          <input
            value={editingSet.name}
            onChange={e => setEditingSet({ ...editingSet, name: e.target.value })}
            className="text-lg font-bold border-b-2 border-blue-300 bg-transparent px-1 py-0.5 focus:outline-none focus:border-blue-600"
          />
          <button onClick={saveCurrentSet} className="ml-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            保存
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {editingSet.plans.map((plan, planIndex) => (
            <div
              key={plan.id}
              className={`bg-gradient-to-b ${PLAN_COLORS[planIndex] || 'from-slate-50 to-slate-100'} rounded-xl border ${plan.isRecommended ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-200'} overflow-hidden`}
            >
              {/* Plan Header */}
              <div className={`px-4 py-3 ${plan.isRecommended ? 'bg-blue-600 text-white' : 'bg-white/60'}`}>
                <div className="flex items-center justify-between">
                  <input
                    value={plan.label}
                    onChange={e => {
                      const plans = [...editingSet.plans];
                      plans[planIndex] = { ...plan, label: e.target.value };
                      setEditingSet({ ...editingSet, plans });
                    }}
                    className={`font-bold bg-transparent border-b ${plan.isRecommended ? 'border-white/50 text-white placeholder-white/70' : 'border-slate-300'} focus:outline-none text-sm w-24`}
                  />
                  <button
                    onClick={() => toggleRecommended(plan.id)}
                    className={`text-xs px-2 py-0.5 rounded-full ${plan.isRecommended ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 hover:bg-blue-100'}`}
                  >
                    {plan.isRecommended ? '★ おすすめ' : '☆ おすすめ'}
                  </button>
                </div>
                <div className="text-2xl font-bold mt-1">
                  ¥{plan.totalPrice.toLocaleString()}
                  <span className={`text-xs font-normal ${plan.isRecommended ? 'text-white/70' : 'text-slate-500'} ml-1`}>/月</span>
                </div>
              </div>

              {/* Plan Items */}
              <div className="px-4 py-3 space-y-2">
                {plan.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="bg-white rounded-lg p-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 truncate">{item.menuItemName}</span>
                      <button onClick={() => removePlanItem(plan.id, itemIdx)} className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updatePlanItem(plan.id, itemIdx, 'quantity', Math.max(1, Number(e.target.value)))}
                        className="w-12 border rounded px-1.5 py-0.5 text-xs text-center"
                      />
                      <span className="text-xs text-slate-500">{item.unit}</span>
                      <span className="text-xs text-slate-400">×</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={e => updatePlanItem(plan.id, itemIdx, 'unitPrice', Math.max(0, Number(e.target.value)))}
                        className="w-20 border rounded px-1.5 py-0.5 text-xs text-right"
                      />
                      <span className="text-xs text-slate-500 ml-auto font-medium">= ¥{item.subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                ))}

                {/* Add Item Button */}
                {addingToPlanId === plan.id ? (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                    <div className="text-xs font-medium text-slate-500 mb-2">アイテムを選択</div>
                    {CATEGORIES.map(cat => {
                      const catItems = items.filter(i => i.category === cat.value && !plan.items.some(pi => pi.menuItemId === i.id));
                      if (catItems.length === 0) return null;
                      return (
                        <div key={cat.value} className="mb-2">
                          <div className={`text-xs font-medium ${cat.color} mb-1`}>{cat.label}</div>
                          {catItems.map(mi => (
                            <button
                              key={mi.id}
                              onClick={() => addItemToPlan(plan.id, mi)}
                              className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 rounded flex justify-between"
                            >
                              <span>{mi.name}</span>
                              <span className="text-slate-400">¥{mi.price.toLocaleString()}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                    <button onClick={() => setAddingToPlanId(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-1">閉じる</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToPlanId(plan.id)}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 transition"
                  >
                    + アイテムを追加
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── List mode ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">患者への施術プラン提案書を作成・管理</p>
        <button
          onClick={createNewSet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + 新しいプランセット
        </button>
      </div>

      {planSets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center text-slate-400">
          プランセットがありません。「+ 新しいプランセット」で作成してください。
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {planSets.map(set => (
            <div key={set.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800">{set.name}</h3>
                  <span className="text-xs text-slate-400">{new Date(set.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {set.plans.map((plan, i) => (
                    <div
                      key={plan.id}
                      className={`flex-1 bg-gradient-to-b ${PLAN_COLORS[i]} rounded-lg p-2 ${plan.isRecommended ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      <div className="text-xs font-medium text-slate-600">{plan.label}</div>
                      <div className="text-sm font-bold">¥{plan.totalPrice.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">{plan.items.length}件</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t px-4 py-2 bg-slate-50 flex gap-2">
                <button onClick={() => startEdit(set)} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1">編集</button>
                <button onClick={() => duplicateSet(set)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1">複製</button>
                <a href={`/plan/${set.id}`} target="_blank" className="text-xs text-green-600 hover:text-green-800 px-2 py-1">印刷用表示</a>
                <button onClick={() => deleteSet(set.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 ml-auto">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
