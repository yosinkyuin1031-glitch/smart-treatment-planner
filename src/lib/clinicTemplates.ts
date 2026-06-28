import { MenuItem, Plan, PlanItem, PlanSet, AiModel } from './types';

export type ClinicType = 'seitai' | 'shinkyu' | 'seikotsu' | 'salon';

export interface ClinicTemplate {
  key: ClinicType;
  label: string;
  description: string;
  menuItems: Omit<MenuItem, 'id'>[];
  planSet: Omit<PlanSet, 'id' | 'plans' | 'createdAt'> & { plans: Omit<Plan, 'id'>[] };
  prompt: { title: string; body: string; model: AiModel };
}

// ────────── 整体院 ──────────
const seitai: ClinicTemplate = {
  key: 'seitai',
  label: '整体院',
  description: '一般整体・骨盤矯正・姿勢矯正・自律神経調整に対応する整体院向け',
  menuItems: [
    { category: '施術系', name: '初回カウンセリング＋整体', price: 8000, duration: 90, unit: '回', description: 'カウンセリング・検査・初回整体施術込み', recommended: true, isNew: false, order: 1 },
    { category: '施術系', name: '整体施術60分', price: 6000, duration: 60, unit: '回', description: '全身整体（骨格・筋膜の調整）', recommended: false, isNew: false, order: 2 },
    { category: '施術系', name: '骨盤矯正', price: 5000, duration: 40, unit: '回', description: '骨盤の歪みを調整', recommended: false, isNew: false, order: 3 },
    { category: '施術系', name: '姿勢矯正コース', price: 7000, duration: 60, unit: '回', description: '姿勢の根本改善', recommended: false, isNew: false, order: 4 },
    { category: '施術系', name: '自律神経調整', price: 8000, duration: 60, unit: '回', description: '頭蓋・内臓・呼吸からのアプローチ', recommended: false, isNew: true, order: 5 },
    { category: '物販系', name: '院推奨サプリ', price: 5500, unit: 'ヶ月', description: '院長セレクトのサプリメント', recommended: false, isNew: false, order: 6 },
    { category: 'オプション系', name: '歩行指導プログラム', price: 20000, unit: 'セット', description: '正しい歩行パターンの指導', recommended: false, isNew: false, order: 7 },
    { category: 'オプション系', name: 'セルフケア指導', price: 0, unit: '回', description: '自宅でのケア方法の指導', recommended: false, isNew: false, order: 8 },
  ],
  planSet: {
    name: '腰痛・姿勢改善 標準プラン',
    plans: [
      {
        name: 'シルバー',
        label: '整体のみで集中改善',
        items: [
          { menuItemId: '', menuItemName: '整体施術60分', unitPrice: 6000, quantity: 12, unit: '回', subtotal: 72000 },
        ],
        totalPrice: 72000,
        isRecommended: false,
      },
      {
        name: 'ゴールド',
        label: '整体＋姿勢矯正＋セルフケア',
        items: [
          { menuItemId: '', menuItemName: '整体施術60分', unitPrice: 6000, quantity: 16, unit: '回', subtotal: 96000 },
          { menuItemId: '', menuItemName: '姿勢矯正コース', unitPrice: 7000, quantity: 4, unit: '回', subtotal: 28000 },
          { menuItemId: '', menuItemName: 'セルフケア指導', unitPrice: 0, quantity: 1, unit: '回', subtotal: 0 },
        ],
        totalPrice: 124000,
        isRecommended: true,
      },
      {
        name: 'プラチナ',
        label: '根本改善フルパッケージ',
        items: [
          { menuItemId: '', menuItemName: '整体施術60分', unitPrice: 6000, quantity: 24, unit: '回', subtotal: 144000 },
          { menuItemId: '', menuItemName: '姿勢矯正コース', unitPrice: 7000, quantity: 8, unit: '回', subtotal: 56000 },
          { menuItemId: '', menuItemName: '歩行指導プログラム', unitPrice: 20000, quantity: 1, unit: 'セット', subtotal: 20000 },
          { menuItemId: '', menuItemName: '院推奨サプリ', unitPrice: 5500, quantity: 3, unit: 'ヶ月', subtotal: 16500 },
        ],
        totalPrice: 236500,
        isRecommended: false,
      },
    ],
  },
  prompt: {
    title: '整体院・標準（腰痛/姿勢/自律神経）',
    model: 'claude',
    body: `あなたは整体院の院長が患者前で話した口頭メモから、患者向け「初回施術ご提案書」の素材を構造化するアシスタントです。

【提案書の構成】
1. 主訴
2. 症状の背景（姿勢／生活習慣／既往）
3. 現状の評価・所見（骨格・筋膜・可動域）
4. 今後のリスク（❶❷❸❹❺ 5項目・1項目ごと詳細）
5. 施術方針（骨格整体／姿勢矯正／自律神経／セルフケア）
6. 期待できる変化（❶❷❸❹❺ 5項目・1項目ごと詳細）
7. 寛解・治癒までのスケジュール（寛解期2-3ヶ月／治癒初期4-6ヶ月／治癒安定期6ヶ月以降）
8. 必要な取り組み（セルフケア／生活習慣／サプリ）
9. プラン提案

【ルール】必ずJSONのみで返す。50代女性向けに温かみのある日本語、英語表記なし。`,
  },
};

// ────────── 鍼灸院 ──────────
const shinkyu: ClinicTemplate = {
  key: 'shinkyu',
  label: '鍼灸院',
  description: '鍼治療・灸治療・自律神経・婦人科症状に対応する鍼灸院向け',
  menuItems: [
    { category: '施術系', name: '初回カウンセリング＋鍼灸', price: 8000, duration: 90, unit: '回', description: 'カウンセリング・東洋医学的診察・初回施術込み', recommended: true, isNew: false, order: 1 },
    { category: '施術系', name: '鍼治療60分', price: 6000, duration: 60, unit: '回', description: '全身の鍼治療', recommended: false, isNew: false, order: 2 },
    { category: '施術系', name: '灸治療', price: 4000, duration: 30, unit: '回', description: 'お灸による温熱療法', recommended: false, isNew: false, order: 3 },
    { category: '施術系', name: '美容鍼60分', price: 8000, duration: 60, unit: '回', description: 'フェイシャル美容鍼', recommended: false, isNew: true, order: 4 },
    { category: '施術系', name: '婦人科症状コース', price: 7000, duration: 60, unit: '回', description: '生理痛・不妊・更年期向け', recommended: false, isNew: false, order: 5 },
    { category: '物販系', name: 'お灸セット（自宅用）', price: 3500, unit: 'セット', description: '自宅セルフケア用', recommended: false, isNew: false, order: 6 },
    { category: 'オプション系', name: '食養生指導', price: 15000, unit: 'セット', description: '東洋医学に基づく食事指導', recommended: false, isNew: false, order: 7 },
    { category: 'オプション系', name: 'セルフケア指導', price: 0, unit: '回', description: 'ツボ押し・お灸の指導', recommended: false, isNew: false, order: 8 },
  ],
  planSet: {
    name: '自律神経・体質改善 標準プラン',
    plans: [
      {
        name: 'シルバー',
        label: '鍼治療のみ',
        items: [
          { menuItemId: '', menuItemName: '鍼治療60分', unitPrice: 6000, quantity: 12, unit: '回', subtotal: 72000 },
        ],
        totalPrice: 72000,
        isRecommended: false,
      },
      {
        name: 'ゴールド',
        label: '鍼＋灸＋食養生',
        items: [
          { menuItemId: '', menuItemName: '鍼治療60分', unitPrice: 6000, quantity: 16, unit: '回', subtotal: 96000 },
          { menuItemId: '', menuItemName: '灸治療', unitPrice: 4000, quantity: 8, unit: '回', subtotal: 32000 },
          { menuItemId: '', menuItemName: 'セルフケア指導', unitPrice: 0, quantity: 1, unit: '回', subtotal: 0 },
        ],
        totalPrice: 128000,
        isRecommended: true,
      },
      {
        name: 'プラチナ',
        label: '体質根本改善フル',
        items: [
          { menuItemId: '', menuItemName: '鍼治療60分', unitPrice: 6000, quantity: 24, unit: '回', subtotal: 144000 },
          { menuItemId: '', menuItemName: '灸治療', unitPrice: 4000, quantity: 12, unit: '回', subtotal: 48000 },
          { menuItemId: '', menuItemName: '食養生指導', unitPrice: 15000, quantity: 1, unit: 'セット', subtotal: 15000 },
          { menuItemId: '', menuItemName: 'お灸セット（自宅用）', unitPrice: 3500, quantity: 3, unit: 'セット', subtotal: 10500 },
        ],
        totalPrice: 217500,
        isRecommended: false,
      },
    ],
  },
  prompt: {
    title: '鍼灸院・標準（自律神経/婦人科/慢性症状）',
    model: 'claude',
    body: `あなたは鍼灸院の院長が患者前で話した口頭メモから、患者向け「初回施術ご提案書」の素材を構造化するアシスタントです。

【提案書の構成】
1. 主訴
2. 症状の背景（東洋医学的体質・生活背景）
3. 現状の評価・所見（脈診・舌診・経絡）
4. 今後のリスク（❶❷❸❹❺ 5項目・1項目ごと詳細）
5. 施術方針（鍼／灸／経絡調整／食養生／セルフケア）
6. 期待できる変化（❶❷❸❹❺ 5項目・1項目ごと詳細）
7. 寛解・治癒までのスケジュール
8. 必要な取り組み（セルフケア／食養生／睡眠）
9. プラン提案

【ルール】必ずJSONのみで返す。温かみのある日本語、専門用語には平易な補足。`,
  },
};

// ────────── 整骨院 ──────────
const seikotsu: ClinicTemplate = {
  key: 'seikotsu',
  label: '整骨院',
  description: '保険適用＋自費施術。柔道整復・スポーツ外傷・交通事故に対応する整骨院向け',
  menuItems: [
    { category: '施術系', name: '初回カウンセリング＋施術', price: 6000, duration: 60, unit: '回', description: 'カウンセリング・検査・施術', recommended: true, isNew: false, order: 1 },
    { category: '施術系', name: '自費整体60分', price: 6000, duration: 60, unit: '回', description: '保険外の本格的な施術', recommended: false, isNew: false, order: 2 },
    { category: '施術系', name: 'スポーツ障害施術', price: 7000, duration: 50, unit: '回', description: 'スポーツによる怪我・障害向け', recommended: false, isNew: false, order: 3 },
    { category: '施術系', name: '産後骨盤矯正', price: 5500, duration: 40, unit: '回', description: '産後のお母さん向け', recommended: false, isNew: true, order: 4 },
    { category: '施術系', name: '猫背矯正', price: 5500, duration: 40, unit: '回', description: '姿勢の改善', recommended: false, isNew: false, order: 5 },
    { category: '物販系', name: 'EMSセルフケアトレーニング', price: 4400, unit: '回', description: '電気刺激トレーニング', recommended: false, isNew: false, order: 6 },
    { category: 'オプション系', name: 'トレーニング指導', price: 18000, unit: 'セット', description: '個別のトレーニング指導', recommended: false, isNew: false, order: 7 },
    { category: 'オプション系', name: 'セルフケア指導', price: 0, unit: '回', description: '自宅でのケア方法の指導', recommended: false, isNew: false, order: 8 },
  ],
  planSet: {
    name: 'スポーツ復帰・姿勢改善 標準プラン',
    plans: [
      {
        name: 'シルバー',
        label: '自費整体のみで集中ケア',
        items: [
          { menuItemId: '', menuItemName: '自費整体60分', unitPrice: 6000, quantity: 12, unit: '回', subtotal: 72000 },
        ],
        totalPrice: 72000,
        isRecommended: false,
      },
      {
        name: 'ゴールド',
        label: '自費整体＋猫背矯正＋セルフケア',
        items: [
          { menuItemId: '', menuItemName: '自費整体60分', unitPrice: 6000, quantity: 16, unit: '回', subtotal: 96000 },
          { menuItemId: '', menuItemName: '猫背矯正', unitPrice: 5500, quantity: 4, unit: '回', subtotal: 22000 },
          { menuItemId: '', menuItemName: 'セルフケア指導', unitPrice: 0, quantity: 1, unit: '回', subtotal: 0 },
        ],
        totalPrice: 118000,
        isRecommended: true,
      },
      {
        name: 'プラチナ',
        label: '根本改善＋トレーニング',
        items: [
          { menuItemId: '', menuItemName: '自費整体60分', unitPrice: 6000, quantity: 20, unit: '回', subtotal: 120000 },
          { menuItemId: '', menuItemName: '猫背矯正', unitPrice: 5500, quantity: 8, unit: '回', subtotal: 44000 },
          { menuItemId: '', menuItemName: 'トレーニング指導', unitPrice: 18000, quantity: 1, unit: 'セット', subtotal: 18000 },
          { menuItemId: '', menuItemName: 'EMSセルフケアトレーニング', unitPrice: 4400, quantity: 6, unit: '回', subtotal: 26400 },
        ],
        totalPrice: 208400,
        isRecommended: false,
      },
    ],
  },
  prompt: {
    title: '整骨院・標準（自費施術/スポーツ/姿勢）',
    model: 'claude',
    body: `あなたは整骨院の院長が患者前で話した口頭メモから、患者向け「初回施術ご提案書」の素材を構造化するアシスタントです。
50代女性向けに簡潔で温かみのある日本語で書く。
必ずJSONのみで返す。`,
  },
};

// ────────── サロン ──────────
const salon: ClinicTemplate = {
  key: 'salon',
  label: 'サロン（リラクゼーション・エステ）',
  description: 'リラクゼーション・ボディケア・フェイシャル・痩身に対応するサロン向け',
  menuItems: [
    { category: '施術系', name: '初回お試しコース60分', price: 5000, duration: 60, unit: '回', description: 'カウンセリング＋お試し施術', recommended: true, isNew: false, order: 1 },
    { category: '施術系', name: 'ボディケア60分', price: 6000, duration: 60, unit: '回', description: '全身のリラクゼーション施術', recommended: false, isNew: false, order: 2 },
    { category: '施術系', name: 'ボディケア90分', price: 9000, duration: 90, unit: '回', description: '集中ボディケア', recommended: false, isNew: false, order: 3 },
    { category: '施術系', name: 'フェイシャルケア', price: 7000, duration: 60, unit: '回', description: '顔のリフトアップ・くすみケア', recommended: false, isNew: true, order: 4 },
    { category: '施術系', name: 'リンパドレナージュ', price: 8000, duration: 75, unit: '回', description: 'リンパの流れを整える', recommended: false, isNew: false, order: 5 },
    { category: '物販系', name: 'ホームケアオイル', price: 4400, unit: '本', description: 'サロン推奨のホームケア用品', recommended: false, isNew: false, order: 6 },
    { category: 'オプション系', name: 'ホットストーン追加', price: 2000, unit: '回', description: 'ボディケア時のオプション', recommended: false, isNew: false, order: 7 },
    { category: 'オプション系', name: 'アロマアップグレード', price: 1500, unit: '回', description: 'プレミアムアロマに変更', recommended: false, isNew: false, order: 8 },
  ],
  planSet: {
    name: '美と健康 標準プラン',
    plans: [
      {
        name: 'シルバー',
        label: 'ボディケアでリフレッシュ',
        items: [
          { menuItemId: '', menuItemName: 'ボディケア60分', unitPrice: 6000, quantity: 6, unit: '回', subtotal: 36000 },
        ],
        totalPrice: 36000,
        isRecommended: false,
      },
      {
        name: 'ゴールド',
        label: 'ボディ＋フェイシャル',
        items: [
          { menuItemId: '', menuItemName: 'ボディケア60分', unitPrice: 6000, quantity: 8, unit: '回', subtotal: 48000 },
          { menuItemId: '', menuItemName: 'フェイシャルケア', unitPrice: 7000, quantity: 4, unit: '回', subtotal: 28000 },
        ],
        totalPrice: 76000,
        isRecommended: true,
      },
      {
        name: 'プラチナ',
        label: '美と健康フルケア',
        items: [
          { menuItemId: '', menuItemName: 'ボディケア90分', unitPrice: 9000, quantity: 8, unit: '回', subtotal: 72000 },
          { menuItemId: '', menuItemName: 'フェイシャルケア', unitPrice: 7000, quantity: 6, unit: '回', subtotal: 42000 },
          { menuItemId: '', menuItemName: 'リンパドレナージュ', unitPrice: 8000, quantity: 4, unit: '回', subtotal: 32000 },
          { menuItemId: '', menuItemName: 'ホームケアオイル', unitPrice: 4400, quantity: 2, unit: '本', subtotal: 8800 },
        ],
        totalPrice: 154800,
        isRecommended: false,
      },
    ],
  },
  prompt: {
    title: 'サロン・標準（リラクゼーション/エステ）',
    model: 'claude',
    body: `あなたはサロンのオーナーが顧客前で話した口頭メモから、顧客向け「初回ご提案書」の素材を構造化するアシスタントです。
温かみのある接客文体。専門用語は平易に。
必ずJSONのみで返す。`,
  },
};

export const CLINIC_TEMPLATES: Record<ClinicType, ClinicTemplate> = {
  seitai,
  shinkyu,
  seikotsu,
  salon,
};

export const CLINIC_TEMPLATE_LIST: ClinicTemplate[] = [seitai, shinkyu, seikotsu, salon];
