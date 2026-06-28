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
  sections: ProposalSection[]; // 互換: 旧形式（A4 1枚版）
  slides?: ProposalSlide[]; // 新形式（13枚スライド）
  themeKey?: ThemeKey; // 配色テーマ。未指定なら症状カテゴリから自動決定
  createdAt: string;
  updatedAt: string;
}

// ====== 13スライド構造 ======

export type SlideLayout =
  | 'cover'         // 1. 表紙
  | 'overview'      // 2. お悩みと状態
  | 'iceberg'       // 3. 結果と原因（水面下70%）
  | 'mechanism3'    // 4. 悪循環3段階
  | 'risks-grid'    // 5. リスク4象限
  | 'positives'     // 6. 好条件
  | 'policy-3'      // 7. 施術方針3つの柱
  | 'approach-4'    // 8. 具体アプローチ4象限
  | 'changes-list'  // 9. 期待できる変化
  | 'schedule'      // 10. スケジュール3段階
  | 'selfcare-4'    // 11. ご自宅での取り組み4象限
  | 'plan-3'        // 12. 松竹梅プラン
  | 'closing';      // 13. 締め

export interface SlideBlock {
  title?: string;
  subtitle?: string;
  body?: string;
  icon?: string;       // 絵文字
  illustration?: string; // 画像URL or base64（将来用）
  bullets?: string[];
}

export interface ProposalSlide {
  no: number;          // 1-13
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  blocks: SlideBlock[]; // 配置するブロック群
  meta?: Record<string, string>; // フリースロット
}

// ====== 配色テーマ（症状カテゴリに応じて自動切替） ======

export type ThemeKey = 'blue' | 'purple' | 'orange' | 'pink' | 'green' | 'gray';

export interface Theme {
  key: ThemeKey;
  label: string;
  primaryBg: string;
  primaryText: string;
  accentBg: string;
  accentText: string;
  surfaceBg: string;
  borderColor: string;
}

export const THEMES: Record<ThemeKey, Theme> = {
  blue:   { key: 'blue',   label: 'ブルー（腰痛・膝痛・骨格系）', primaryBg: 'bg-blue-700',    primaryText: 'text-blue-700',    accentBg: 'bg-blue-100',    accentText: 'text-blue-800',    surfaceBg: 'bg-blue-50',    borderColor: 'border-blue-200'   },
  purple: { key: 'purple', label: 'パープル（自律神経・頭痛・睡眠）', primaryBg: 'bg-purple-700',  primaryText: 'text-purple-700',  accentBg: 'bg-purple-100',  accentText: 'text-purple-800',  surfaceBg: 'bg-purple-50',  borderColor: 'border-purple-200' },
  orange: { key: 'orange', label: 'オレンジ（痛み・神経痛系）',    primaryBg: 'bg-orange-600',  primaryText: 'text-orange-700',  accentBg: 'bg-orange-100',  accentText: 'text-orange-800',  surfaceBg: 'bg-orange-50',  borderColor: 'border-orange-200' },
  pink:   { key: 'pink',   label: 'ピンク（女性向け・五十肩・肩こり）', primaryBg: 'bg-pink-600',    primaryText: 'text-pink-700',    accentBg: 'bg-pink-100',    accentText: 'text-pink-800',    surfaceBg: 'bg-pink-50',    borderColor: 'border-pink-200'   },
  green:  { key: 'green',  label: 'グリーン（栄養・サプリ・物販強調）', primaryBg: 'bg-emerald-700', primaryText: 'text-emerald-700', accentBg: 'bg-emerald-100', accentText: 'text-emerald-800', surfaceBg: 'bg-emerald-50', borderColor: 'border-emerald-200'},
  gray:   { key: 'gray',   label: 'グレー（その他・落ち着いた印象）', primaryBg: 'bg-slate-700',   primaryText: 'text-slate-700',   accentBg: 'bg-slate-100',   accentText: 'text-slate-800',   surfaceBg: 'bg-slate-50',   borderColor: 'border-slate-200'  },
};

export function themeForSymptom(c: SymptomCategory): ThemeKey {
  switch (c) {
    case '腰痛':
    case '膝痛':
    case '脊柱管狭窄症':
      return 'blue';
    case '自律神経失調症':
    case '睡眠障害':
      return 'purple';
    case '頭痛':
    case '坐骨神経痛':
      return 'orange';
    case '五十肩':
    case '肩こり':
      return 'pink';
    default:
      return 'gray';
  }
}
