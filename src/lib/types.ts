export type MenuItemCategory = '施術系' | '物販系' | 'オプション系';

export interface MenuItem {
  id: string;
  category: MenuItemCategory;
  name: string;
  price: number;
  originalPrice?: number;
  duration?: number;
  unit: string;
  description?: string;
  recommended: boolean;
  isNew: boolean;
  courseMonths?: number;
  coursePrice?: number;
  order: number;
}

export interface PlanItem {
  menuItemId: string;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface Plan {
  id: string;
  name: string;
  label: string;
  items: PlanItem[];
  totalPrice: number;
  isRecommended?: boolean;
}

export interface PlanSet {
  id: string;
  name: string;
  plans: Plan[];
  createdAt: string;
}

export const CATEGORIES: { value: MenuItemCategory; label: string; color: string; bg: string }[] = [
  { value: '施術系', label: '施術系', color: 'text-blue-700', bg: 'bg-blue-100' },
  { value: '物販系', label: '物販系', color: 'text-green-700', bg: 'bg-green-100' },
  { value: 'オプション系', label: 'オプション系', color: 'text-purple-700', bg: 'bg-purple-100' },
];

// ====== Proposal (9セクション症状別提案書) ======

export type SymptomCategory =
  | '腰痛'
  | '膝痛'
  | '坐骨神経痛'
  | '脊柱管狭窄症'
  | '自律神経失調症'
  | '頭痛'
  | '睡眠障害'
  | '五十肩'
  | '肩こり'
  | 'その他';

export type Severity = '軽度' | '中度' | '重度';
export type Gender = '男性' | '女性' | '回答しない';

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  '腰痛', '膝痛', '坐骨神経痛', '脊柱管狭窄症', '自律神経失調症',
  '頭痛', '睡眠障害', '五十肩', '肩こり', 'その他',
];

export const SEVERITIES: Severity[] = ['軽度', '中度', '重度'];

export interface ProposalSection {
  title: string;
  body: string;
}

export interface Proposal {
  id: string;
  patientName: string;
  patientAge?: number;
  patientGender?: Gender;
  symptomCategory: SymptomCategory;
  severity: Severity;
  chiefComplaint: string;
  background: string;
  observation: string;
  specialNotes?: string;
  planSetId?: string;
  sections: ProposalSection[];
  createdAt: string;
  updatedAt: string;
}
