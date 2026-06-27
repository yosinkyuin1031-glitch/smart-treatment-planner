import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GenerateBody {
  transcript: string;
  menuItems?: { name: string; category: string; price: number; unit: string; description?: string }[];
  planSets?: { id: string; name: string; plans: { name: string; totalPrice: number; isRecommended?: boolean }[] }[];
}

const SYSTEM_PROMPT = `あなたは治療院（整体院・鍼灸院）の院長が患者前で話した口頭メモから、患者向け「初回施術ご提案書」の素材を構造化するアシスタントです。

メモから以下のフィールドを抽出して、必ずJSONのみで返してください。会話文・前置き・解説・コードブロック記号は一切付けないでください。

【出力スキーマ】
{
  "patientName": "患者名（メモに含まれていれば。なければ空文字）",
  "patientAge": 年齢の数値（メモに含まれていれば。なければ null）,
  "patientGender": "男性 | 女性 | 回答しない（メモに含まれていれば。なければ null）",
  "symptomCategory": "腰痛 | 膝痛 | 坐骨神経痛 | 脊柱管狭窄症 | 自律神経失調症 | 頭痛 | 睡眠障害 | 五十肩 | 肩こり | その他（メモから最も適切なものを1つ）",
  "severity": "軽度 | 中度 | 重度（メモから判断）",
  "chiefComplaint": "主訴。患者本人の言葉に近い形で、簡潔に。",
  "background": "症状の背景。発症経緯・生活背景・既往など、メモから読み取れる範囲。",
  "observation": "現状の評価・所見。検査・触診・観察した内容。",
  "specialNotes": "特記事項。服薬・家族要望・院長の判断メモなど。なければ空文字。",
  "recommendedPlanSetId": "提供された候補プランセットの中から最も適したものの id。該当無しなら空文字。"
}

【ルール】
- メモが整っていなくても、無理に推測せず、メモから読み取れる範囲のみで埋める
- 「分からない」「不明」と書かず、その項目は空文字 or null で返す
- chiefComplaint・background・observation は患者目線で読みやすい日本語にリライトしてOK
- 必ずJSONのみ。説明文・前置き・後置きは禁止。`;

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
        max_tokens: 2048,
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
