'use client';

import { useState, useMemo, useRef } from 'react';
import { Proposal, SymptomCategory, Severity, Gender, SYMPTOM_CATEGORIES, SEVERITIES, PlanSet, MenuItem, ProposalSlide, themeForSymptom } from '@/lib/types';
import { generateProposalSections, generateProposalSlides, buildProposalFromInput } from '@/lib/proposalPresets';
import SlideRenderer from './SlideRenderer';

type Mode = 'list' | 'edit' | 'preview';

const GENDERS: Gender[] = ['男性', '女性', '回答しない'];

function makeId() {
  return 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function emptyProposal(): Proposal {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    patientName: '',
    patientAge: undefined,
    patientGender: undefined,
    symptomCategory: '腰痛',
    severity: '中度',
    chiefComplaint: '',
    background: '',
    observation: '',
    specialNotes: '',
    planSetId: undefined,
    sections: [],
    slides: [],
    themeKey: 'blue',
    createdAt: now,
    updatedAt: now,
  };
}

interface Props {
  proposals: Proposal[];
  planSets: PlanSet[];
  menuItems: MenuItem[];
  onSave: (p: Proposal) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

export default function ProposalManager({ proposals, planSets, menuItems, onSave, onDelete, showToast }: Props) {
  const [mode, setMode] = useState<Mode>('list');
  const [draft, setDraft] = useState<Proposal | null>(null);

  const startNew = () => {
    setDraft(emptyProposal());
    setMode('edit');
  };

  const startEdit = (p: Proposal) => {
    setDraft({ ...p });
    setMode('edit');
  };

  const startPreview = (p: Proposal) => {
    setDraft(p);
    setMode('preview');
  };

  const cancel = () => {
    setDraft(null);
    setMode('list');
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.patientName.trim()) {
      showToast('患者名を入力してください', 'warning');
      return;
    }
    if (!draft.chiefComplaint.trim()) {
      showToast('主訴を入力してください', 'warning');
      return;
    }
    const sections = draft.sections && draft.sections.length > 0
      ? draft.sections
      : generateProposalSections({
          patientName: draft.patientName,
          symptomCategory: draft.symptomCategory,
          severity: draft.severity,
          chiefComplaint: draft.chiefComplaint,
          background: draft.background,
          observation: draft.observation,
          specialNotes: draft.specialNotes,
        });
    const slides = draft.slides && draft.slides.length > 0
      ? draft.slides
      : generateProposalSlides({
          patientName: draft.patientName,
          patientAge: draft.patientAge,
          patientGender: draft.patientGender,
          symptomCategory: draft.symptomCategory,
          severity: draft.severity,
          chiefComplaint: draft.chiefComplaint,
          background: draft.background,
          observation: draft.observation,
          specialNotes: draft.specialNotes,
        });
    const themeKey = draft.themeKey || themeForSymptom(draft.symptomCategory);
    const toSave: Proposal = { ...draft, sections, slides, themeKey, updatedAt: new Date().toISOString() };
    try {
      await onSave(toSave);
      showToast('提案書を保存しました', 'success');
      setDraft(null);
      setMode('list');
    } catch {
      showToast('保存に失敗しました', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この提案書を削除しますか？')) return;
    try {
      await onDelete(id);
      showToast('削除しました', 'success');
    } catch {
      showToast('削除に失敗しました', 'error');
    }
  };

  if (mode === 'edit' && draft) {
    return (
      <ProposalForm
        draft={draft}
        setDraft={setDraft}
        planSets={planSets}
        menuItems={menuItems}
        showToast={showToast}
        onSave={handleSave}
        onCancel={cancel}
        onPreview={() => {
          const sections = generateProposalSections({
            patientName: draft.patientName,
            symptomCategory: draft.symptomCategory,
            severity: draft.severity,
            chiefComplaint: draft.chiefComplaint,
            background: draft.background,
            observation: draft.observation,
            specialNotes: draft.specialNotes,
          });
          const slides = generateProposalSlides({
            patientName: draft.patientName,
            patientAge: draft.patientAge,
            patientGender: draft.patientGender,
            symptomCategory: draft.symptomCategory,
            severity: draft.severity,
            chiefComplaint: draft.chiefComplaint,
            background: draft.background,
            observation: draft.observation,
            specialNotes: draft.specialNotes,
          });
          setDraft({ ...draft, sections, slides, themeKey: draft.themeKey || themeForSymptom(draft.symptomCategory) });
          setMode('preview');
        }}
      />
    );
  }

  if (mode === 'preview' && draft) {
    return (
      <ProposalPreview
        proposal={draft}
        planSets={planSets}
        onBack={() => setMode(draft.id.startsWith('local-') ? 'edit' : 'list')}
        onPrint={() => window.print()}
      />
    );
  }

  return (
    <ProposalList
      proposals={proposals}
      onNew={startNew}
      onEdit={startEdit}
      onPreview={startPreview}
      onDelete={handleDelete}
    />
  );
}

// ────────── List ──────────

function ProposalList({
  proposals,
  onNew,
  onEdit,
  onPreview,
  onDelete,
}: {
  proposals: Proposal[];
  onNew: () => void;
  onEdit: (p: Proposal) => void;
  onPreview: (p: Proposal) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <button
        onClick={onNew}
        className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow"
      >
        + 新しい提案書を作成
      </button>

      {proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>提案書がありません</p>
          <p className="text-sm mt-1">「+ 新しい提案書を作成」から、患者ごとの提案書を作成できます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-800 truncate">{p.patientName || '（患者名未入力）'}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{p.symptomCategory}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{p.severity}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{p.chiefComplaint || '主訴未入力'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    更新: {new Date(p.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => onPreview(p)} className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1 bg-slate-100 rounded-lg font-bold">プレビュー</button>
                  <button onClick={() => onEdit(p)} className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1 bg-slate-100 rounded-lg font-bold">編集</button>
                  <button onClick={() => onDelete(p.id)} className="text-sm text-red-600 hover:text-red-800 px-3 py-1 bg-red-50 rounded-lg font-bold">削除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ────────── Form ──────────

function ProposalForm({
  draft,
  setDraft,
  planSets,
  menuItems,
  showToast,
  onSave,
  onCancel,
  onPreview,
}: {
  draft: Proposal;
  setDraft: (p: Proposal) => void;
  planSets: PlanSet[];
  menuItems: MenuItem[];
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
}) {
  const update = <K extends keyof Proposal>(key: K, value: Proposal[K]) => {
    setDraft({ ...draft, [key]: value });
  };

  return (
    <div className="space-y-5">
      <VoiceCapture
        draft={draft}
        setDraft={setDraft}
        menuItems={menuItems}
        planSets={planSets}
        showToast={showToast}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-4">提案書の作成・編集</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              患者名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.patientName}
              onChange={(e) => update('patientName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="例: 山田 太郎"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">年齢</label>
            <input
              type="number"
              min={0}
              max={120}
              value={draft.patientAge ?? ''}
              onChange={(e) => update('patientAge', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="例: 58"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">性別</label>
            <select
              value={draft.patientGender || ''}
              onChange={(e) => update('patientGender', (e.target.value || undefined) as Gender | undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">未選択</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              症状カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={draft.symptomCategory}
              onChange={(e) => update('symptomCategory', e.target.value as SymptomCategory)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              {SYMPTOM_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              重症度 <span className="text-red-500">*</span>
            </label>
            <select
              value={draft.severity}
              onChange={(e) => update('severity', e.target.value as Severity)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            主訴 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={draft.chiefComplaint}
            onChange={(e) => update('chiefComplaint', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
            placeholder="例: 朝起きた瞬間に腰が固まって動けない。仕事中の前傾でも痛みが走る。"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">症状の背景（自由記入・プリセットに追記されます）</label>
          <textarea
            value={draft.background}
            onChange={(e) => update('background', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
            placeholder="例: 5年前にぎっくり腰を経験。デスクワーク中心で運動習慣なし。"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">所見（自由記入・プリセットに追記されます）</label>
          <textarea
            value={draft.observation}
            onChange={(e) => update('observation', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
            placeholder="例: SLR陽性、腰椎右回旋制限、深部腱反射やや低下。"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">特記事項（任意）</label>
          <textarea
            value={draft.specialNotes || ''}
            onChange={(e) => update('specialNotes', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
            placeholder="例: 服薬中の薬剤・既往歴・本人の希望など"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">プランセットを紐付け（任意）</label>
          <select
            value={draft.planSetId || ''}
            onChange={(e) => update('planSetId', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">未選択</option>
            {planSets.map((ps) => (
              <option key={ps.id} value={ps.id}>{ps.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            「プランビルダー」で作成した松竹梅プランを選択すると、提案書プレビューに料金プランが併記されます。
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={onSave} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow">
          保存
        </button>
        <button onClick={onPreview} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition">
          プレビュー（保存前）
        </button>
        <button onClick={onCancel} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-300 transition">
          キャンセル
        </button>
      </div>
    </div>
  );
}

// ────────── Preview ──────────

function ProposalPreview({
  proposal,
  planSets,
  onBack,
  onPrint,
}: {
  proposal: Proposal;
  planSets: PlanSet[];
  onBack: () => void;
  onPrint: () => void;
}) {
  const planSet = useMemo(() => planSets.find((ps) => ps.id === proposal.planSetId), [planSets, proposal.planSetId]);
  const useSlides = proposal.slides && proposal.slides.length > 0;

  if (useSlides) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 print:hidden">
          <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800">&larr; 戻る</button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{proposal.slides!.length}枚のスライド形式</span>
            <button onClick={onPrint} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
              印刷／PDF出力
            </button>
          </div>
        </div>
        <SlideRenderer proposal={proposal} planSets={planSets} />
        <style jsx global>{`
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body { background: white; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800">&larr; 戻る</button>
        <button onClick={onPrint} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
          印刷／PDF出力
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-0 print:p-0">
        <div className="text-center mb-6 border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">初回施術 ご提案書</h1>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">患者様</p>
            <p className="text-lg font-bold text-slate-800 border-b border-gray-300 pb-1">
              {proposal.patientName || '（患者名）'} 様
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {proposal.patientAge ? `${proposal.patientAge}歳` : ''}
              {proposal.patientGender ? ` / ${proposal.patientGender}` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">作成日</p>
            <p className="text-sm text-slate-700">{new Date(proposal.updatedAt).toLocaleDateString('ja-JP')}</p>
            <p className="text-xs text-gray-500 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mr-1">{proposal.symptomCategory}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{proposal.severity}</span>
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {proposal.sections.map((s, idx) => (
            <section key={idx} className="break-inside-avoid">
              <h2 className="text-base font-bold text-slate-800 border-l-4 border-blue-600 pl-2 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>

        {planSet && (
          <div className="mt-8 break-inside-avoid">
            <h2 className="text-base font-bold text-slate-800 border-l-4 border-blue-600 pl-2 mb-3">9-b. 松竹梅プラン</h2>
            <p className="text-xs text-gray-500 mb-3">プランセット：{planSet.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {planSet.plans.map((plan) => (
                <div key={plan.id} className={`border rounded-lg p-3 ${plan.isRecommended ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-slate-700">{plan.name}</p>
                    {plan.isRecommended && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">おすすめ</span>}
                  </div>
                  {plan.label && <p className="text-xs text-gray-500">{plan.label}</p>}
                  <p className="text-lg font-bold text-slate-800 mt-2">{plan.totalPrice.toLocaleString('ja-JP')}円</p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-0.5">
                    {plan.items.map((it, i) => (
                      <li key={i}>・{it.menuItemName}（{it.quantity}{it.unit}）</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-10">本提案書は患者様の現状所見に基づく治療プランの叩き台です。</p>
      </div>
    </div>
  );
}

// expose helper for parent component
export { buildProposalFromInput };

// ────────── VoiceCapture ──────────

function VoiceCapture({
  draft,
  setDraft,
  menuItems,
  planSets,
  showToast,
}: {
  draft: Proposal;
  setDraft: (p: Proposal) => void;
  menuItems: MenuItem[];
  planSets: PlanSet[];
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const cleanup = () => {
    stopTimer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
  };

  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        cleanup();
        await sendForTranscription(blob);
      };
      rec.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      showToast('マイクの許可が必要です（ブラウザの設定をご確認ください）', 'error');
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    setRecording(false);
    stopTimer();
    try {
      recorderRef.current?.stop();
    } catch {
      cleanup();
    }
  };

  const sendForTranscription = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');
      const r = await fetch('/api/transcribe', { method: 'POST', body: form });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || '文字起こしに失敗しました');
      }
      const data = (await r.json()) as { text: string };
      setTranscript((prev) => (prev ? prev + '\n' + data.text : data.text));
      showToast('文字起こし完了', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '文字起こしエラー', 'error');
    } finally {
      setTranscribing(false);
    }
  };

  const generateFromTranscript = async () => {
    if (!transcript.trim()) {
      showToast('文字起こしテキストが空です', 'warning');
      return;
    }
    setGenerating(true);
    try {
      const r = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          menuItems: menuItems.map((m) => ({
            name: m.name,
            category: m.category,
            price: m.price,
            unit: m.unit,
            description: m.description,
          })),
          planSets: planSets.map((ps) => ({
            id: ps.id,
            name: ps.name,
            plans: ps.plans.map((p) => ({ name: p.name, totalPrice: p.totalPrice, isRecommended: p.isRecommended })),
          })),
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || '生成に失敗しました');
      }
      const data = (await r.json()) as {
        result: {
          patientName?: string;
          patientAge?: number | null;
          patientGender?: Gender | null;
          symptomCategory?: SymptomCategory;
          severity?: Severity;
          chiefComplaint?: string;
          background?: string;
          observation?: string;
          specialNotes?: string;
          recommendedPlanSetId?: string;
          sections?: { title: string; body: string }[];
        };
      };
      const r2 = data.result || {};
      setDraft({
        ...draft,
        patientName: r2.patientName || draft.patientName,
        patientAge: typeof r2.patientAge === 'number' ? r2.patientAge : draft.patientAge,
        patientGender: r2.patientGender || draft.patientGender,
        symptomCategory: r2.symptomCategory || draft.symptomCategory,
        severity: r2.severity || draft.severity,
        chiefComplaint: r2.chiefComplaint || draft.chiefComplaint,
        background: r2.background || draft.background,
        observation: r2.observation || draft.observation,
        specialNotes: r2.specialNotes || draft.specialNotes,
        planSetId: r2.recommendedPlanSetId || draft.planSetId,
        sections: r2.sections && r2.sections.length > 0 ? r2.sections : draft.sections,
      });
      showToast('Claudeで構造化しました。内容を確認・編集してください', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '生成エラー', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span>🎙️</span>音声で下書き（AIまとめ）
        </h2>
        <span className="text-xs text-gray-500">録音 → 文字起こし → Claudeで構造化</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={transcribing || generating}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ● 録音開始
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-900 transition animate-pulse"
          >
            ■ 停止（{mmss(seconds)}）
          </button>
        )}
        {transcribing && (
          <span className="text-sm text-purple-700 font-medium">文字起こし中...</span>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">文字起こし結果（編集可）</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none bg-white"
          placeholder="録音すると自動で文字起こしされます。手入力で追記・修正してから「Claudeで構造化」を押してください。"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <button
          onClick={generateFromTranscript}
          disabled={!transcript.trim() || generating || transcribing}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? 'Claude生成中...' : '✨ Claudeで構造化'}
        </button>
        <button
          onClick={() => setTranscript('')}
          disabled={!transcript || generating || transcribing}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          文字起こしをクリア
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        ※ 録音した音声はOpenAI Whisperで文字起こし後、Anthropic Claudeに送信され、提案書の各フィールドに自動入力されます。
        生成結果はすべて手動で編集可能です。
      </p>
    </div>
  );
}

