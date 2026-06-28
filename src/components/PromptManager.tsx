'use client';

import { useState, useEffect, useCallback } from 'react';
import { Prompt, AiModel } from '@/lib/types';
import { getPromptsFromDB, savePromptToDB, deletePromptFromDB, setDefaultPrompt } from '@/lib/storage';

const MODELS: { value: AiModel; label: string }[] = [
  { value: 'claude', label: 'Claude（Anthropic）' },
  { value: 'chatgpt', label: 'ChatGPT（OpenAI）' },
  { value: 'gemini', label: 'Gemini（Google）' },
];

const STARTER_PROMPT = `あなたは大口神経整体院の院長が患者前で話した口頭メモから、患者向け「初回施術ご提案書」の素材を構造化するアシスタントです。

【提案書の構成】
1. 主訴
2. 症状の背景
3. 現状の評価・所見
4. 今後のリスク（❶❷❸❹❺ 5項目・内科的含む・1項目ごと詳細）
5. 施術方針（神経／頭蓋／内臓／歩行／栄養／セルフケアの複合）
6. 期待できる変化（❶❷❸❹❺ 5項目・内科的含む・1項目ごと詳細）
7. 寛解・治癒までのスケジュール（寛解期2-3ヶ月／治癒初期4-6ヶ月／治癒安定期6ヶ月以降）
8. 必要な取り組み（セルフケア・生活習慣・サプリ）
9. プラン提案（短期1ヶ月／中期2-3ヶ月／長期4ヶ月以降）

【ルール】
- 必ずJSONのみで返す（前置き・後置き・コードブロック禁止）
- 50代女性向けに簡潔で温かみのある日本語
- 英語表記は使わない`;

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

export default function PromptManager({ showToast }: Props) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Prompt | null>(null);

  const reload = useCallback(async () => {
    try {
      const list = await getPromptsFromDB();
      setPrompts(list);
    } catch {
      showToast('プロンプトの読み込みに失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  const startNew = () => {
    const now = new Date().toISOString();
    setEditing({
      id: '',
      title: '新規プロンプト',
      body: STARTER_PROMPT,
      model: 'claude',
      isDefault: prompts.length === 0,
      sortOrder: prompts.length,
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      showToast('タイトルを入力してください', 'warning');
      return;
    }
    if (!editing.body.trim()) {
      showToast('プロンプト本文を入力してください', 'warning');
      return;
    }
    try {
      await savePromptToDB(editing);
      showToast('保存しました', 'success');
      setEditing(null);
      await reload();
    } catch {
      showToast('保存に失敗しました', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このプロンプトを削除しますか？')) return;
    try {
      await deletePromptFromDB(id);
      showToast('削除しました', 'success');
      await reload();
    } catch {
      showToast('削除に失敗しました', 'error');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPrompt(id);
      showToast('デフォルトに設定しました', 'success');
      await reload();
    } catch {
      showToast('変更に失敗しました', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">読み込み中...</div>;
  }

  if (editing) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold text-slate-800">プロンプト編集</h2>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">タイトル *</label>
            <input
              type="text"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="例: 50代女性 腰痛用"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">送信先AIモデル</label>
            <select
              value={editing.model}
              onChange={(e) => setEditing({ ...editing, model: e.target.value as AiModel })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">※ 現状はClaudeのみ実装済。ChatGPT／Geminiは順次対応予定</p>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">プロンプト本文 *</label>
            <textarea
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              rows={20}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed"
              placeholder="AIに送る指示文を書いてください"
            />
            <p className="text-[10px] text-slate-400 mt-1">変数：{`{transcript}`} に音声メモ、{`{menuItems}`}に院のメニュー、{`{planSets}`}に松竹梅プランが置換されます。</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={editing.isDefault}
              onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })}
            />
            このプロンプトをデフォルトとして使う
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition"
          >
            保存
          </button>
          <button
            onClick={() => setEditing(null)}
            className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">プロンプト管理</h2>
          <p className="text-xs text-slate-500 mt-1">提案書を音声・Claudeで生成する際のプロンプトを複数保存・切替できます。</p>
        </div>
        <button
          onClick={startNew}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow"
        >
          + 新規プロンプト
        </button>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500 mb-2">まだプロンプトが登録されていません</p>
          <p className="text-xs text-slate-400">「+ 新規プロンプト」ボタンから、陽平のChatGPT用プロンプトをそのまま貼り付けて保存できます。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-800 truncate">{p.title}</h3>
                    {p.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">デフォルト</span>}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{MODELS.find((m) => m.value === p.model)?.label || p.model}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 whitespace-pre-line">{p.body.slice(0, 200)}</p>
                  <p className="text-[10px] text-slate-400 mt-2">更新: {new Date(p.updatedAt).toLocaleString('ja-JP')}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => setEditing(p)} className="text-xs text-slate-600 hover:text-slate-800 px-3 py-1 bg-slate-100 rounded-lg font-bold">編集</button>
                  {!p.isDefault && (
                    <button onClick={() => handleSetDefault(p.id)} className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-lg font-bold">既定にする</button>
                  )}
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-rose-600 hover:text-rose-800 px-3 py-1 bg-rose-50 rounded-lg font-bold">削除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
