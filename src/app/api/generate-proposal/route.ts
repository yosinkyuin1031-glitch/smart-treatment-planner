import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GenerateBody {
  transcript: string;
  menuItems?: { name: string; category: string; price: number; unit: string; description?: string }[];
  planSets?: { id: string; name: string; plans: { name: string; totalPrice: number; isRecommended?: boolean }[] }[];
}

const SYSTEM_PROMPT = `あなたは大口神経整体院の院長が患者前で話した口頭メモから、患者向け「初回施術ご提案書」の素材を構造化するアシスタントです。

メモから以下のフィールドを抽出して、必ずJSONのみで返してください。会話文・前置き・解説・コードブロック記号は一切付けないでください。英語表記は使わない（提案書は日本語のみ）。50代女性向けに簡潔で温かみのある日本語で書く。

【出力スキーマ】
{
  "patientName": "患者名（メモに含まれていれば。なければ空文字）",
  "patientAge": 年齢の数値（メモに含まれていれば。なければ null）,
  "patientGender": "男性 | 女性 | 回答しない（メモに含まれていれば。なければ null）",
  "symptomCategory": "腰痛 | 膝痛 | 坐骨神経痛 | 脊柱管狭窄症 | 自律神経失調症 | 頭痛 | 睡眠障害 | 五十肩 | 肩こり | その他（メモから最も適切なものを1つ）",
  "severity": "軽度 | 中度 | 重度（メモから判断）",
  "chiefComplaint": "主訴。患者本人の言葉に近い形で、簡潔に。",
  "background": "症状の背景。発症経緯・生活背景・既往など、メモから読み取れる範囲を、温かみのある日本語でリライト。",
  "observation": "現状の評価・所見。検査・触診・観察した内容を整理。",
  "specialNotes": "特記事項。服薬・家族要望・院長の判断メモなど。なければ空文字。",
  "recommendedPlanSetId": "提供された候補プランセットの中から最も適したものの id。該当無しなら空文字。",
  "sections": [
    {"title": "1. 主訴", "body": "患者目線で主訴を温かく簡潔にまとめる"},
    {"title": "2. 症状の背景", "body": "発症メカニズム（内臓ストレス→自律神経→筋緊張左右差→痛み）を踏まえて背景を解説"},
    {"title": "3. 現状の評価・所見", "body": "神経学的検査・触診・姿勢評価の所見をまとめる"},
    {"title": "4. 今後のリスク", "body": "❶❷❸❹❺の番号表記で5項目。内科的リスクも必ず1〜2項目含める。1項目ごとに2〜3文の詳細"},
    {"title": "5. 施術方針", "body": "ボリューム多め。神経調整／頭蓋治療（脳機能・自律神経・ホルモン・内臓調整・ストレス反応改善）／内臓調整／歩行指導／栄養素／セルフケアの複合アプローチを具体的に。筋骨格系治療方針の7つの考え方を反映"},
    {"title": "6. 期待できる変化", "body": "❶❷❸❹❺の番号表記で5項目。内科的変化（消化・睡眠・代謝・自律神経等）を必ず1〜2項目含める。1項目ごとに2〜3文の詳細"},
    {"title": "7. 寛解・治癒までのスケジュール", "body": "寛解期（2〜3ヶ月）／治癒初期（4〜6ヶ月）／治癒安定期（6ヶ月以降）の各期間の目標と取り組み内容を詳しく。回復を早めるポジティブ要素も明記。A4 1枚に収まる詳細さ"},
    {"title": "8. 必要な取り組み", "body": "セルフケア（具体的な内容）／生活習慣（睡眠・食事・運動）／サプリメント／記録の習慣を具体的に"},
    {"title": "9. プラン提案", "body": "短期（1ヶ月）／中期（2〜3ヶ月）／長期（4ヶ月目以降）の3段階で、何にどう取り組むかを示す。松竹梅プランが添付される場合は『別紙の松竹梅プランをご参照ください』と一言添える"}
  ]
}

【提案書の前提（重要）】
作成する提案書本体は以下のルールに従って構築されます。あなたが返すJSONは、その本体を組み立てる土台になります。
- 提案書は9セクション構成（主訴／症状の背景／現状の評価・所見／今後のリスク／施術方針／期待できる変化／寛解・治癒までのスケジュール／必要な取り組み／プラン提案）
- 「今後のリスク」「期待できる変化」は必ず5項目ずつ、❶❷❸❹❺の番号表記で、内科的リスク・変化も含めて詳しく書く
- 「施術方針」はボリュームを多めに：神経調整・頭蓋治療（脳機能・自律神経・ホルモン・内臓調整・ストレス反応の改善目的で必須）・内臓調整・歩行指導・栄養素・セルフケアの複合アプローチ
- 寛解・治癒スケジュールの目安：寛解期=2〜3ヶ月、治癒初期=4〜6ヶ月、治癒安定期=6ヶ月以降。回復を早めるポジティブ要素も書く
- A4 1枚に収まるボリューム感

【筋骨格系症状に対する治療方針（参照する考え方）】
1. 症状は「結果」であり、原因は神経・代謝・内臓・感覚など"上流"にある
2. 発症メカニズム：内臓ストレス → 自律神経の乱れ → 筋緊張の左右差 → 痛み・歪み
3. 不調の4大因子：神経伝達／自律神経／血流不全／栄養不足
4. 段階的アプローチ：【構造】【機能】【行動】の3軸
5. 介入手法：神経／頭蓋・内臓／ミトコンドリア活性／歩行分析／感覚統合
6. 痛みの理解モデル：ゲートコントロール理論／筋紡錘の防御反射／運動制御モデル
7. 歩行分析と再教育：姿勢・動作のクセからの再発予防と治療定着を重視

【ルール】
- メモが整っていなくても、無理に推測せず、メモから読み取れる範囲のみで埋める
- 「分からない」「不明」と書かず、その項目は空文字 or null で返す
- chiefComplaint・background・observation は患者目線で読みやすい日本語にリライトしてOK
- 必ずJSONのみ。説明文・前置き・後置き・コードブロック記号は禁止。`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY が未設定です' }, { status: 500 });
    }

    const body = (await req.json()) as GenerateBody;
    if (!body.transcript || !body.transcript.trim()) {
      return NextResponse.json({ error: 'transcript が空です' }, { status: 400 });
    }

    const userMessage = [
      `【院長の口頭メモ】\n${body.transcript}`,
      body.menuItems && body.menuItems.length > 0
        ? `\n\n【院のメニュー一覧（参考）】\n${JSON.stringify(body.menuItems, null, 2)}`
        : '',
      body.planSets && body.planSets.length > 0
        ? `\n\n【院の松竹梅プラン候補】\n${JSON.stringify(body.planSets, null, 2)}`
        : '',
    ].join('');

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json({ error: `Claude API エラー: ${errText}` }, { status: 502 });
    }

    const data = (await r.json()) as { content: { type: string; text: string }[] };
    const rawText = data.content.find((c) => c.type === 'text')?.text || '';

    // JSON抽出（コードブロック等が混入していても対応）
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'JSON出力が抽出できませんでした', raw: rawText }, { status: 502 });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: 'JSONパース失敗', raw: jsonMatch[0] }, { status: 502 });
    }

    return NextResponse.json({ result: parsed, raw: rawText });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
