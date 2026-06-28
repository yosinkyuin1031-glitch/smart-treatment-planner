import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

type AiModel = 'claude' | 'chatgpt' | 'gemini';

interface GenerateBody {
  transcript: string;
  model?: AiModel;
  customPrompt?: string; // user-defined system prompt (full text)
  menuItems?: { name: string; category: string; price: number; unit: string; description?: string }[];
  planSets?: { id: string; name: string; plans: { name: string; totalPrice: number; isRecommended?: boolean }[] }[];
}

const DEFAULT_SYSTEM_PROMPT = `あなたは大口神経整体院の院長が患者前で話した口頭メモから、患者向け「初回施術ご提案書」の素材を構造化するアシスタントです。

メモから以下のフィールドを抽出して、必ずJSONのみで返してください。会話文・前置き・解説・コードブロック記号は一切付けないでください。英語表記は使わない（提案書は日本語のみ）。50代女性向けに簡潔で温かみのある日本語で書く。

【出力スキーマ】
{
  "patientName": "患者名（メモに含まれていれば。なければ空文字）",
  "patientAge": 年齢の数値（メモに含まれていれば。なければ null）,
  "patientGender": "男性 | 女性 | 回答しない（メモに含まれていれば。なければ null）",
  "symptomCategory": "腰痛 | 膝痛 | 坐骨神経痛 | 脊柱管狭窄症 | 自律神経失調症 | 頭痛 | 睡眠障害 | 五十肩 | 肩こり | その他",
  "severity": "軽度 | 中度 | 重度",
  "chiefComplaint": "主訴",
  "background": "症状の背景",
  "observation": "現状の評価・所見",
  "specialNotes": "特記事項。なければ空文字",
  "recommendedPlanSetId": "提供された候補プランセットの中から最も適したものの id。該当無しなら空文字",
  "sections": [
    {"title": "1. 主訴", "body": "..."},
    {"title": "2. 症状の背景", "body": "..."},
    {"title": "3. 現状の評価・所見", "body": "..."},
    {"title": "4. 今後のリスク", "body": "❶❷❸❹❺ 5項目・内科的含む・1項目ごと2〜3文の詳細"},
    {"title": "5. 施術方針", "body": "神経／頭蓋／内臓／歩行／栄養／セルフケアの複合（ボリューム多め）"},
    {"title": "6. 期待できる変化", "body": "❶❷❸❹❺ 5項目・内科的含む・1項目ごと2〜3文の詳細"},
    {"title": "7. 寛解・治癒までのスケジュール", "body": "寛解期2〜3ヶ月／治癒初期4〜6ヶ月／治癒安定期6ヶ月以降。回復を早めるポジティブ要素も明記"},
    {"title": "8. 必要な取り組み", "body": "セルフケア／生活習慣／サプリメント／記録の習慣"},
    {"title": "9. プラン提案", "body": "短期1ヶ月／中期2〜3ヶ月／長期4ヶ月以降"}
  ]
}

【ルール】
- 必ずJSONのみ。説明文・前置き・後置き・コードブロック記号は禁止。
- メモが整っていなくても、無理に推測せず、メモから読み取れる範囲のみで埋める。`;

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY が未設定です');
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
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Claude API エラー: ${err}`);
  }
  const data = (await r.json()) as { content: { type: string; text: string }[] };
  return data.content.find((c) => c.type === 'text')?.text || '';
}

async function callChatGPT(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY が未設定です');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 6000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`OpenAI API エラー: ${err}`);
  }
  const data = (await r.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content || '';
}

async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY が未設定です');
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          maxOutputTokens: 6000,
          responseMimeType: 'application/json',
        },
      }),
    }
  );
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Gemini API エラー: ${err}`);
  }
  const data = (await r.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;
    if (!body.transcript || !body.transcript.trim()) {
      return NextResponse.json({ error: 'transcript が空です' }, { status: 400 });
    }

    const model: AiModel = body.model || 'claude';
    const systemPrompt = (body.customPrompt && body.customPrompt.trim()) || DEFAULT_SYSTEM_PROMPT;

    const userMessage = [
      `【院長の口頭メモ】\n${body.transcript}`,
      body.menuItems && body.menuItems.length > 0
        ? `\n\n【院のメニュー一覧（参考）】\n${JSON.stringify(body.menuItems, null, 2)}`
        : '',
      body.planSets && body.planSets.length > 0
        ? `\n\n【院の松竹梅プラン候補】\n${JSON.stringify(body.planSets, null, 2)}`
        : '',
    ].join('');

    let rawText = '';
    if (model === 'chatgpt') {
      rawText = await callChatGPT(systemPrompt, userMessage);
    } else if (model === 'gemini') {
      rawText = await callGemini(systemPrompt, userMessage);
    } else {
      rawText = await callClaude(systemPrompt, userMessage);
    }

    const parsed = extractJson(rawText);
    if (!parsed) {
      return NextResponse.json({ error: 'JSON出力が抽出できませんでした', raw: rawText, model }, { status: 502 });
    }

    return NextResponse.json({ result: parsed, raw: rawText, model });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
