import { ProposalSection, SymptomCategory, Severity, Proposal } from './types';

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
    '【寛解期（〜1ヶ月）】症状の50%程度の改善を目指します。週1〜2回ペースで集中的に整え、痛みのピークを抑えます。\n' +
    '【治癒初期（1〜3ヶ月）】症状が出にくい身体づくり。週1回ペースで継続し、生活の中で再発トリガーを見直します。\n' +
    '【治癒安定期（3〜6ヶ月）】症状が出ない状態の維持。2〜4週に1回のメンテナンスで「戻らない身体」を仕上げます。\n' +
    '【ポジティブ要素】軽度の段階で取り組むほど、改善期間は短く・再発しにくい結果に繋がります。',
  中度:
    '【寛解期（〜2ヶ月）】症状の30〜50%改善を目指す期間。週2回ペースで神経の過敏化を鎮め、根本原因に手をつけます。\n' +
    '【治癒初期（2〜5ヶ月）】症状が落ち着いた状態の固定化。週1回ペースで継続し、再発トリガーを取り除きます。\n' +
    '【治癒安定期（5〜10ヶ月）】メンテナンス期。2〜4週に1回で「戻らない身体」を維持します。\n' +
    '【ポジティブ要素】中度のうちに正しい方向で施術を入れれば、長く付き合ってきた症状から抜け出せます。',
  重度:
    '【寛解期（〜3ヶ月）】まずは痛み・しびれのピークを抑える期間。週2回ペースで神経・血流・筋膜を整え、休まる夜を取り戻します。\n' +
    '【治癒初期（3〜6ヶ月）】症状の波を小さくしていく期間。週1回ペースで継続し、生活の質を底上げします。\n' +
    '【治癒安定期（6〜12ヶ月）】症状が出にくい身体の維持。2〜4週に1回で再発予防のメンテナンスを行います。\n' +
    '【ポジティブ要素】重度でも、神経・自律神経・栄養を同時に整えれば確実に変わります。焦らず一緒に取り組みましょう。',
};

// ====== 共通文 ======

const TREATMENT_POLICY =
  '【神経調整】症状の根本にある神経の過敏化を鎮め、自律神経のバランスを整えます。\n' +
  '【頭蓋・脳脊髄液調整】頭蓋の動きを整え、脳脊髄液の循環を改善し、回復力の基盤を作ります。\n' +
  '【内臓調整】内臓機能の低下が症状の背景にある場合は、内臓の位置・動き・血流を整えます。\n' +
  '【歩行・姿勢指導】日常の動きの質を上げ、症状の再発を防ぎます。\n' +
  '【栄養素サポート】細胞レベルの回復を後押しする栄養（ビタミン・ミネラル・腸内環境）を提案します。\n' +
  '【セルフケア指導】ご自宅で5分でできるストレッチ・呼吸法をお伝えします。';

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
