import { ProposalSection, SymptomCategory, Severity, Proposal, ProposalSlide } from './types';

// ====== 症状別×重症度プリセット ======

type SymptomPreset = {
  background: string; // 症状の背景
  observation: string; // 評価所見の補足
  risks: string[]; // 今後のリスク（最大5項目）
  expectations: string[]; // 期待できる変化（最大5項目）
};

const SYMPTOM_PRESETS: Record<SymptomCategory, SymptomPreset> = {
  腰痛: {
    background:
      '長年の姿勢の崩れ・筋膜の癒着・神経の過敏化が複合的に重なって、腰部の慢性的な痛みを引き起こしている状態と考えられます。',
    observation:
      '腰椎周辺の筋緊張、骨盤の左右差、股関節の可動域制限が見られます。神経学的検査では関連神経の感覚低下／反射の変化を確認しました。',
    risks: [
      '❶ 椎間板や椎間関節への負担蓄積による症状の悪化',
      '❷ 神経根症状（しびれ・脚の脱力）への進行',
      '❸ 内臓機能（特に消化器・泌尿器）への影響',
      '❹ 睡眠の質低下による自律神経の乱れ',
      '❺ 動かない期間が続くことによる筋力低下・転倒リスク',
    ],
    expectations: [
      '❶ 慢性的な痛みの軽減と再発しにくい身体へ',
      '❷ 朝の起き上がり・立ち上がり動作の改善',
      '❸ 長時間座っても疲れにくい姿勢の獲得',
      '❹ 内臓機能の改善（便通・代謝）',
      '❺ 心理的なストレスの軽減と睡眠の質向上',
    ],
  },
  膝痛: {
    background:
      '関節の変性に加え、股関節・足部の連動性低下、神経の過敏化、軟部組織の硬化が組み合わさって膝の痛みを引き起こしています。',
    observation:
      '膝関節の可動域制限、大腿四頭筋の機能低下、足部アーチの崩れ、関連神経の過敏化が認められます。',
    risks: [
      '❶ 軟骨のすり減りが進行し、変形性膝関節症の進展',
      '❷ 反対側の膝・股関節・腰への代償負担',
      '❸ 歩行量の低下による全身の筋力・代謝低下',
      '❹ 転倒・骨折のリスク増加',
      '❺ 日常生活動作の制限による生活の質低下',
    ],
    expectations: [
      '❶ 階段昇降・歩行時の痛みの軽減',
      '❷ 膝の可動域の改善と動作のスムーズさ',
      '❸ 全身の動きの連動性向上',
      '❹ 趣味活動（旅行・散歩等）への復帰',
      '❺ 反対側の関節への負担減',
    ],
  },
  坐骨神経痛: {
    background:
      '腰部から下肢へ走る神経の通り道（椎間孔・梨状筋・腸腰筋など）が圧迫・刺激されることで、痛み・しびれが続いている状態です。',
    observation:
      '腰椎の柔軟性低下、梨状筋・腸腰筋の硬さ、神経学的検査でデルマトームに沿った感覚低下が確認できます。',
    risks: [
      '❶ しびれ範囲の拡大・脚の筋力低下',
      '❷ 排尿・排便機能への影響（重症例）',
      '❸ 神経の慢性過敏化による「治りにくい身体」化',
      '❹ 痛みを避ける姿勢から二次的な不調を併発',
      '❺ 心理的不安・睡眠障害の併発',
    ],
    expectations: [
      '❶ しびれ・痛みの軽減と範囲縮小',
      '❷ 歩行距離・立ち仕事時間の延長',
      '❸ 神経の過敏化の沈静化',
      '❹ 夜間の痛みの軽減と熟睡感',
      '❺ 不安感の軽減・前向きな日常生活へ',
    ],
  },
  脊柱管狭窄症: {
    background:
      '加齢に伴う椎間板の変性・靭帯の肥厚により脊柱管が狭くなり、神経の血流が阻害される状態。間欠性跛行を典型症状とします。',
    observation:
      '腰椎の前弯減少、後屈で症状悪化、馬尾／神経根症状の有無を確認。歩行テストで跛行距離を計測しています。',
    risks: [
      '❶ 連続歩行距離の更なる短縮',
      '❷ 下肢の脱力・足の上がりにくさ',
      '❸ 排尿障害（重症化のサイン）',
      '❹ 外出機会の減少による認知機能・社会性の低下',
      '❺ 手術適応への進行',
    ],
    expectations: [
      '❶ 歩行可能距離の延長',
      '❷ しびれ・足の重だるさの軽減',
      '❸ 神経の血流・自律神経機能の改善',
      '❹ 外出・運動への意欲回復',
      '❺ 手術回避の可能性向上',
    ],
  },
  自律神経失調症: {
    background:
      '生活リズム・ストレス・首から頭蓋にかけての循環不全により、交感神経と副交感神経のバランスが崩れている状態です。',
    observation:
      '頸椎上部・後頭部の緊張、呼吸の浅さ、瞳孔反応、心拍変動など、自律神経の評価所見を確認しました。',
    risks: [
      '❶ 慢性疲労・倦怠感の固定化',
      '❷ うつ・不安症状への進行',
      '❸ 消化器（IBS・胃もたれ）・循環器症状の併発',
      '❹ 不眠による回復力低下',
      '❺ 仕事・家庭での役割遂行の困難',
    ],
    expectations: [
      '❶ 朝の目覚め・日中の活力の改善',
      '❷ 動悸・めまい・耳鳴り等の軽減',
      '❸ 消化機能の回復と体重の安定',
      '❹ 不安感・気分の落ち込みの軽減',
      '❺ 「自分のペースが戻る」感覚の回復',
    ],
  },
  頭痛: {
    background:
      '頸椎上部の緊張、頭蓋の動きの制限、脳脊髄液の循環不良、自律神経の偏りが組み合わさり、慢性頭痛を引き起こしています。',
    observation:
      '後頭下筋群の硬さ、頭蓋の動きの左右差、頸椎の可動域、トリガーポイントを確認しています。',
    risks: [
      '❶ 鎮痛薬の常用による薬物乱用頭痛',
      '❷ 仕事・家事の集中力低下',
      '❸ 睡眠の質低下・気分の落ち込み',
      '❹ 自律神経症状（めまい・吐き気）の併発',
      '❺ 慢性化による予防の難しい状態への移行',
    ],
    expectations: [
      '❶ 頭痛頻度・強度の軽減',
      '❷ 薬の使用頻度の減少',
      '❸ 首・肩の張りの軽減',
      '❹ 集中力・気分の回復',
      '❺ 睡眠の質向上',
    ],
  },
  睡眠障害: {
    background:
      '自律神経の乱れ・脳の興奮状態・身体的不調が重なり、入眠困難／中途覚醒／熟眠感の低下が起きている状態です。',
    observation:
      '頸椎上部の緊張、呼吸パターン、生活リズム、寝具環境を含めて評価しています。',
    risks: [
      '❶ 慢性疲労・免疫力低下',
      '❷ 集中力・判断力の低下',
      '❸ うつ・不安症状の併発',
      '❹ 生活習慣病（高血圧・糖代謝異常）のリスク',
      '❺ 家族や仕事への影響の拡大',
    ],
    expectations: [
      '❶ 入眠までの時間短縮',
      '❷ 夜中の覚醒回数の減少',
      '❸ 朝の目覚めのスッキリ感',
      '❹ 日中の眠気・倦怠感の軽減',
      '❺ 気分・集中力の改善',
    ],
  },
  五十肩: {
    background:
      '肩関節周囲の組織の癒着・炎症、頸椎・胸郭の動きの低下、自律神経の関与が重なって肩の可動域制限と痛みを引き起こしています。',
    observation:
      '肩関節各方向の可動域、肩甲骨・胸郭の動き、関連筋の硬さを確認しています。',
    risks: [
      '❶ 拘縮の進行による更なる可動域制限',
      '❷ 着替え・洗髪等の日常動作の支障',
      '❸ 反対側の肩・首の代償による不調',
      '❹ 慢性化による回復期間の長期化',
      '❺ 睡眠時痛による不眠',
    ],
    expectations: [
      '❶ 肩の痛みの軽減と可動域の改善',
      '❷ 着替え・洗髪などの動作改善',
      '❸ 夜間痛の軽減と熟睡感',
      '❹ 姿勢の改善',
      '❺ 趣味活動・仕事動作への復帰',
    ],
  },
  肩こり: {
    background:
      '長時間の前傾姿勢・PC作業・ストレスにより、頸肩部の筋緊張と自律神経の偏りが続いている状態です。',
    observation:
      '僧帽筋上部・肩甲挙筋・後頭下筋群の硬さ、肩甲骨の動き、頸椎の可動域を確認しています。',
    risks: [
      '❶ 慢性化と頭痛・めまいの併発',
      '❷ 集中力・作業効率の低下',
      '❸ 自律神経症状（不眠・倦怠感）の併発',
      '❹ 姿勢の崩れによる腰痛・膝痛の併発',
      '❺ メンタル不調への波及',
    ],
    expectations: [
      '❶ 肩の重だるさ・痛みの軽減',
      '❷ 頭痛・眼精疲労の改善',
      '❸ 姿勢の改善',
      '❹ 集中力・仕事の効率向上',
      '❺ 睡眠の質向上',
    ],
  },
  その他: {
    background:
      '複数の要因（姿勢・神経・自律神経・生活習慣）が組み合わさって慢性化している状態と考えられます。',
    observation:
      '全身の姿勢評価、神経学的検査、自律神経評価を踏まえた所見をまとめています。',
    risks: [
      '❶ 症状の慢性化・固定化',
      '❷ 他部位への代償による不調の連鎖',
      '❸ 日常生活動作の制限',
      '❹ 自律神経・睡眠への影響',
      '❺ 心理的負担の増大',
    ],
    expectations: [
      '❶ 主訴の軽減',
      '❷ 動作のしやすさの改善',
      '❸ 全身バランスの整い',
      '❹ 自律神経・睡眠の改善',
      '❺ 前向きな日常生活への回復',
    ],
  },
};

// ====== 重症度別スケジュール ======

const SEVERITY_SCHEDULES: Record<Severity, string> = {
  軽度:
    '【寛解期（2〜3ヶ月）】症状のピークを抑え、神経の過敏化を鎮める期間。週1〜2回ペースで集中的に整え、痛みの波を小さくしていきます。\n' +
    '【治癒初期（4〜6ヶ月）】症状が出にくい身体づくりの期間。週1回ペースで継続し、生活習慣・栄養・歩行のクセを整えて再発トリガーを取り除きます。\n' +
    '【治癒安定期（6ヶ月以降）】症状が出ない状態の維持。2〜4週に1回のメンテナンスで「戻らない身体」を仕上げ、自律神経・睡眠・内臓機能まで底上げします。\n' +
    '【回復を早めるポジティブ要素】軽度の段階で取り組むほど、改善期間は短く・再発しにくい結果に繋がります。セルフケアの継続率が高い方は治癒初期を3ヶ月以内に短縮するケースもあります。',
  中度:
    '【寛解期（2〜3ヶ月）】神経の過敏化を鎮め、痛み・しびれのピークを抑える期間。週2回ペースで神経・血流・筋膜・頭蓋・内臓を整え、症状の波を小さくしていきます。\n' +
    '【治癒初期（4〜6ヶ月）】症状が落ち着いた状態の固定化。週1回ペースで継続し、生活習慣・栄養・歩行のクセを整えて再発トリガーを取り除きます。\n' +
    '【治癒安定期（6ヶ月以降）】メンテナンス期。2〜4週に1回で「戻らない身体」を維持し、自律神経・睡眠・内臓機能まで安定させます。\n' +
    '【回復を早めるポジティブ要素】中度のうちに正しい方向で施術と栄養・セルフケアを揃えれば、長く付き合ってきた症状から確実に抜け出せます。歩行・呼吸・睡眠のリズムが整うほど、寛解期は予定より早く終わります。',
  重度:
    '【寛解期（2〜3ヶ月）】まずは痛み・しびれのピークを抑える期間。週2回ペースで神経・血流・筋膜・頭蓋を整え、休まる夜を取り戻します。\n' +
    '【治癒初期（4〜6ヶ月）】症状の波を小さくしていく期間。週1回ペースで継続し、生活の質を底上げします。栄養・歩行・自律神経の整えに本格着手します。\n' +
    '【治癒安定期（6ヶ月以降）】症状が出にくい身体の維持。2〜4週に1回で再発予防のメンテナンスを行い、自律神経・睡眠・内臓機能まで安定させます。\n' +
    '【回復を早めるポジティブ要素】重度でも、神経・自律神経・栄養・頭蓋を同時に整えれば確実に変わります。患者様自身がセルフケアと生活習慣に取り組まれるほど、想定より早い段階で寛解に向かうケースが多くあります。',
};

// ====== 共通文 ======

const TREATMENT_POLICY =
  '症状は「結果」であり、原因は神経・代謝・内臓・感覚といった"上流"にあります。発症メカニズム（内臓ストレス→自律神経の乱れ→筋緊張の左右差→痛み・歪み）と、不調の4大因子（神経伝達／自律神経／血流不全／栄養不足）を踏まえ、複数の角度から同時に整えます。\n\n' +
  '【神経調整】症状の根本にある神経の過敏化を鎮め、自律神経のバランスを整えます。痛みのゲートコントロール・筋紡錘の防御反射・運動制御モデルを踏まえた手技で、痛みのループを断ち切ります。\n' +
  '【頭蓋治療】頭蓋の動きを整え、脳機能・自律神経・ホルモン・内臓調整・ストレス反応の改善を狙います。脳脊髄液の循環を回復させ、身体全体の回復力の土台を作ります。\n' +
  '【内臓調整】内臓ストレスが症状の上流にある場合は、内臓の位置・動き・血流を整えます。これにより自律神経の乱れの起点を解消します。\n' +
  '【歩行指導】姿勢・動作のクセを分析し、再発予防と治療定着のために歩行パターンを再教育します。【構造】【機能】【行動】の3軸でアプローチします。\n' +
  '【栄養素サポート】細胞レベルの回復を後押しする栄養（ビタミン・ミネラル・腸内環境・ミトコンドリア活性）を提案します。\n' +
  '【セルフケア指導】ご自宅で5分でできるストレッチ・呼吸法・感覚統合トレーニングをお伝えし、施術の効果を日常に定着させます。';

const COMMON_ACTIONS =
  '【セルフケア】1日5分の指定ストレッチ・呼吸法を続けてください。\n' +
  '【生活習慣】就寝・起床時刻を一定に保ち、入浴は就寝90分前を目安にしてください。\n' +
  '【栄養】血糖の急変動を避ける食事リズム、たんぱく質量、水分量を意識してください。\n' +
  '【記録】症状の波・睡眠・体調を簡単にメモすると、施術の効果が見えやすくなります。';

// ====== セクション生成 ======

export function generateProposalSections(input: {
  patientName: string;
  symptomCategory: SymptomCategory;
  severity: Severity;
  chiefComplaint: string;
  background: string;
  observation: string;
  specialNotes?: string;
}): ProposalSection[] {
  const preset = SYMPTOM_PRESETS[input.symptomCategory] || SYMPTOM_PRESETS['その他'];

  const sections: ProposalSection[] = [];

  sections.push({
    title: '1. 主訴',
    body: input.chiefComplaint.trim() || '（主訴を入力してください）',
  });

  sections.push({
    title: '2. 症状の背景',
    body: [input.background.trim(), preset.background].filter(Boolean).join('\n\n'),
  });

  sections.push({
    title: '3. 現状の評価・所見',
    body: [input.observation.trim(), preset.observation].filter(Boolean).join('\n\n'),
  });

  sections.push({
    title: '4. 今後のリスク',
    body: preset.risks.join('\n'),
  });

  sections.push({
    title: '5. 施術方針',
    body: TREATMENT_POLICY,
  });

  sections.push({
    title: '6. 期待できる変化',
    body: preset.expectations.join('\n'),
  });

  sections.push({
    title: '7. 寛解・治癒までのスケジュール',
    body: SEVERITY_SCHEDULES[input.severity] || SEVERITY_SCHEDULES['中度'],
  });

  sections.push({
    title: '8. 必要な取り組み',
    body: COMMON_ACTIONS,
  });

  sections.push({
    title: '9. プラン提案',
    body: '別タブの「プランビルダー」で松竹梅プランをご用意しております。プランセットを紐付けることで、本提案書と一緒に提示できます。',
  });

  if (input.specialNotes && input.specialNotes.trim()) {
    sections.push({
      title: '特記事項',
      body: input.specialNotes.trim(),
    });
  }

  return sections;
}

// ====== Proposalオブジェクト全体の整形 ======

export function buildProposalFromInput(args: {
  patientName: string;
  patientAge?: number;
  patientGender?: Proposal['patientGender'];
  symptomCategory: SymptomCategory;
  severity: Severity;
  chiefComplaint: string;
  background: string;
  observation: string;
  specialNotes?: string;
  planSetId?: string;
}): Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    patientName: args.patientName,
    patientAge: args.patientAge,
    patientGender: args.patientGender,
    symptomCategory: args.symptomCategory,
    severity: args.severity,
    chiefComplaint: args.chiefComplaint,
    background: args.background,
    observation: args.observation,
    specialNotes: args.specialNotes,
    planSetId: args.planSetId,
    sections: generateProposalSections(args),
  };
}

// ====== 13スライド静的生成（フォールバック） ======

export function generateProposalSlides(input: {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  symptomCategory: SymptomCategory;
  severity: Severity;
  chiefComplaint: string;
  background: string;
  observation: string;
  specialNotes?: string;
}): ProposalSlide[] {
  const preset = SYMPTOM_PRESETS[input.symptomCategory] || SYMPTOM_PRESETS['その他'];
  const today = new Date().toLocaleDateString('ja-JP');

  const slides: ProposalSlide[] = [];

  // 1. 表紙
  slides.push({
    no: 1,
    layout: 'cover',
    title: '初回施術 ご提案書',
    subtitle: `${input.patientName || '患者'} 様`,
    blocks: [
      { title: '主訴', body: input.chiefComplaint || '（主訴を入力してください）' },
      { title: '目標', body: '〜 痛みなく日常を過ごし、再発を防ぐために自分の体を理解してセルフケアができるようになりたい のために 〜' },
      { title: '日付', body: today },
    ],
    meta: { clinic: '大口神経整体院' },
  });

  // 2. 現在のお悩みと状態
  slides.push({
    no: 2,
    layout: 'overview',
    title: '現在のお悩みと状態',
    blocks: [
      { title: '主な症状', body: input.chiefComplaint || preset.background },
      { title: '背景', body: input.background || preset.background },
      { title: '体のイラスト', body: '', illustration: '' },
    ],
  });

  // 3. 結果と原因
  slides.push({
    no: 3,
    layout: 'iceberg',
    title: '痛みの「結果」と「原因」は違います',
    subtitle: '水面上 30% は局所の痛み・コリ／水面下 70% が真の原因',
    blocks: [
      { title: '結果（30%）', body: '局所の痛み・コリ', icon: '💢' },
      { title: '原因（70%）', body: '神経伝達・自律神経・血流不全・栄養不足・骨盤と体幹の連動', icon: '🧠' },
      { body: '痛み止めで一時的に抑えるのではなく、水面下の「70%の原因」を整えることが大切です。' },
    ],
  });

  // 4. 悪循環3段階
  slides.push({
    no: 4,
    layout: 'mechanism3',
    title: '体の中で起きている「悪循環」',
    blocks: [
      { title: '第一段階：筋肉の過剰な緊張', body: '姿勢を支えるため、筋肉が極度に固まる。', icon: '💪' },
      { title: '第二段階：血流低下と自律神経の乱れ', body: '内臓に負荷がかかり、血流が大きく低下する。', icon: '🩸' },
      { title: '第三段階：神経の疲弊と骨格の歪み', body: '栄養不足になった神経が症状を発信。可動域が狭まる。', icon: '⚡' },
    ],
  });

  // 5. 放置するとどうなるか
  slides.push({
    no: 5,
    layout: 'risks-grid',
    title: 'このまま放置するとどうなるか？（今後の危険性）',
    blocks: preset.risks.slice(0, 5).map((r, i) => ({
      title: r.replace(/^[❶❷❸❹❺]\s*/, ''),
      icon: ['⚠', '🦴', '📉', '❄', '🌀'][i] || '⚠',
      body: '',
    })),
  });

  // 6. 改善に向けた好条件
  slides.push({
    no: 6,
    layout: 'positives',
    title: '改善に向けた「非常に強力な」好条件',
    blocks: [
      { title: '力強い事実', body: '毎日のセルフエクササイズの継続が最も重要です。「少しずつでも動かす」という姿勢が回復を大幅に加速させます。お風呂上がりのストレッチが特に効果的です。', icon: '✨' },
      { title: '結論', body: '正しいバランスさえ取り戻せば、劇的に改善しやすい状態です。', icon: '🌱' },
    ],
  });

  // 7. 施術方針 3つの柱
  slides.push({
    no: 7,
    layout: 'policy-3',
    title: '当院の施術方針（3つの柱で根本から整える）',
    subtitle: '目標：再発しない体',
    blocks: [
      { title: '構造', subtitle: '姿勢の調整', body: '骨盤の歪みと関節の位置を修正', icon: '🦴' },
      { title: '機能', subtitle: '神経と血流の回復', body: '内臓と頭蓋の調整で自然治癒力を高める', icon: '🧠' },
      { title: '行動', subtitle: '歩行・体の使い方の改善', body: '正しい動き方の再教育', icon: '🚶' },
    ],
  });

  // 8. 具体的なアプローチ 4象限
  slides.push({
    no: 8,
    layout: 'approach-4',
    title: '具体的なアプローチ',
    blocks: [
      { title: '神経の調整', body: '症状の根本にある神経の過敏化を鎮め、自律神経のバランスを整えます。痛みのゲートコントロール理論を踏まえた手技で、痛みのループを断ち切ります。', icon: '⚡' },
      { title: '頭蓋・自律神経の調整', body: '頭蓋仙骨療法により、硬膜テンションのバランスを調整。痛みによる交感神経の亢進をリセットし、自然治癒力を最大化します。', icon: '🧠' },
      { title: '内臓の調整', body: '内臓ストレスが症状の上流にある場合、内臓の位置・動き・血流を整え、自律神経の乱れの起点を解消します。', icon: '🫁' },
      { title: '歩行・姿勢の改善', body: '腕を振る正しい歩行を指導し、自然な可動域訓練を日常に組み込みます。【構造】【機能】【行動】の3軸で再発予防。', icon: '🚶' },
    ],
  });

  // 9. 期待できる変化
  slides.push({
    no: 9,
    layout: 'changes-list',
    title: '施術で期待できるお体の変化',
    blocks: preset.expectations.slice(0, 5).map((e) => ({
      body: e.replace(/^[❶❷❸❹❺]\s*/, ''),
      icon: '✓',
    })),
  });

  // 10. 改善スケジュール
  slides.push({
    no: 10,
    layout: 'schedule',
    title: '改善への具体的なスケジュール',
    blocks: [
      { title: '寛解期（2〜3ヶ月）', body: '週2回の施術で、痛みの軽減と神経の過敏化の沈静化を最優先に行います。' },
      { title: '治癒初期（4〜6ヶ月）', body: '週1〜2回の施術に移行し、可動域の拡大・筋力の回復・生活習慣の修正を図ります。' },
      { title: '治癒安定期（6ヶ月以降）', body: '月2〜4回のメンテナンスに移行。再発しない体を維持します。' },
      { body: '【回復を早めるポジティブ要素】セルフケアと生活習慣を整えれば、想定より早い段階で寛解に向かうケースが多くあります。' },
    ],
  });

  // 11. ご自宅での取り組み
  slides.push({
    no: 11,
    layout: 'selfcare-4',
    title: '改善をさらに早める「ご自宅での取り組み」',
    blocks: [
      { title: '毎日のエクササイズ', body: '患部に応じたストレッチ・呼吸法を1日5分。お風呂上がりが特に効果的。', icon: '🧘' },
      { title: '歩行習慣', body: '腕を大きく振って歩く。1日5,000〜6,000歩を目標に。', icon: '🚶' },
      { title: '生活習慣', body: '患側を下にして寝ない。重い物を持たない。睡眠リズムを一定に。', icon: '🌙' },
      { title: '栄養・サプリ', body: 'コラーゲンペプチド／ビタミンC／オメガ3／腸内環境サプリ等を必要に応じて。', icon: '💊' },
    ],
  });

  // 12. プラン提案
  slides.push({
    no: 12,
    layout: 'plan-3',
    title: `${input.patientName || ''} 様へのプランのご提案`,
    blocks: [
      { body: '別タブの「プランビルダー」で作成した松竹梅プランを紐付けると、ここに自動表示されます。' },
    ],
  });

  // 13. 締め
  slides.push({
    no: 13,
    layout: 'closing',
    title: '一緒に、不安のない生活を',
    subtitle: '大口神経整体院',
    blocks: [
      { body: '本提案書は患者様の現状所見に基づく治療プランの叩き台です。ご質問・ご相談はいつでもどうぞ。' },
    ],
  });

  return slides;
}

// ── 互換ヘルパー：従来のbuildProposalFromInputに slides も含めて返す
export function buildProposalSlidesFromInput(args: Parameters<typeof generateProposalSlides>[0]): ProposalSlide[] {
  return generateProposalSlides(args);
}

