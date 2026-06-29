import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GenerateBody {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'natural' | 'vivid';
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY が未設定です' }, { status: 500 });
    }

    const body = (await req.json()) as GenerateBody;
    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json({ error: 'プロンプトが空です' }, { status: 400 });
    }

    // DALL-E 3 で画像生成 → URLで返ってくるので fetch して base64 化
    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: body.prompt,
        size: body.size || '1792x1024',
        style: body.style || 'natural',
        quality: 'standard',
        n: 1,
        response_format: 'b64_json',
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json({ error: `画像生成エラー: ${errText}` }, { status: 502 });
    }

    const data = (await r.json()) as { data: { b64_json: string; revised_prompt?: string }[] };
    const img = data.data[0];
    if (!img?.b64_json) {
      return NextResponse.json({ error: '画像が返されませんでした' }, { status: 502 });
    }
    return NextResponse.json({
      image: `data:image/png;base64,${img.b64_json}`,
      revisedPrompt: img.revised_prompt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
