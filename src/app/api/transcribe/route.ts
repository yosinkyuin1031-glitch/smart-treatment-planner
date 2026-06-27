import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY が未設定です' }, { status: 500 });
    }

    const incoming = await req.formData();
    const audio = incoming.get('audio');
    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: '音声ファイルがありません' }, { status: 400 });
    }

    const openaiForm = new FormData();
    openaiForm.append('file', audio, 'recording.webm');
    openaiForm.append('model', 'whisper-1');
    openaiForm.append('language', 'ja');

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openaiForm,
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json({ error: `Whisper API エラー: ${errText}` }, { status: 502 });
    }

    const data = (await r.json()) as { text: string };
    return NextResponse.json({ text: data.text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
