'use client';

import { useState } from 'react';
import { ClinicSettings, DEFAULT_CLINIC_SETTINGS, MenuItem, PlanSet, Plan } from '@/lib/types';
import { CLINIC_TEMPLATE_LIST, ClinicType } from '@/lib/clinicTemplates';
import { saveClinicSettings, saveMenuItemsToDB, savePlanSetToDB, savePromptToDB, generateId } from '@/lib/storage';

interface Props {
  initialSettings?: ClinicSettings;
  onComplete: () => void;
  onSkip: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

type Step = 1 | 2 | 3;

export default function OnboardingWizard({ initialSettings, onComplete, onSkip, showToast }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [settings, setSettings] = useState<ClinicSettings>(initialSettings || DEFAULT_CLINIC_SETTINGS);
  const [selectedType, setSelectedType] = useState<ClinicType | null>(null);
  const [loading, setLoading] = useState(false);

  const next = () => {
    if (step === 1) {
      if (!settings.clinicName.trim() || settings.clinicName === '治療院') {
        showToast('院名を入力してください', 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedType) {
        showToast('院タイプを選択してください', 'warning');
        return;
      }
      setStep(3);
    }
  };

  const back = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const finalize = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      // 1. 院設定保存
      await saveClinicSettings(settings);

      // 2. テンプレからメニュー一括登録
      const template = CLINIC_TEMPLATE_LIST.find((t) => t.key === selectedType);
      if (!template) throw new Error('テンプレが見つかりません');
      const items: MenuItem[] = template.menuItems.map((m, i) => ({ ...m, id: generateId() + '-' + i }));
      await saveMenuItemsToDB(items);

      // 3. プランセット保存
      const planSet: PlanSet = {
        id: generateId(),
        name: template.planSet.name,
        plans: template.planSet.plans.map((p): Plan => ({
          ...p,
          id: generateId(),
          items: p.items.map((it) => ({ ...it })),
        })),
        createdAt: new Date().toISOString(),
      };
      await savePlanSetToDB(planSet);

      // 4. プロンプト保存
      const now = new Date().toISOString();
      await savePromptToDB({
        id: '',
        title: template.prompt.title,
        body: template.prompt.body,
        model: template.prompt.model,
        isDefault: true,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      });

      showToast('セットアップ完了。これから提案書を作成できます。', 'success');
      onComplete();
    } catch {
      showToast('セットアップに失敗しました。もう一度お試しください。', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-500 tracking-widest">セットアップ STEP {step}/3</p>
            <h1 className="text-xl font-bold text-slate-800 mt-1">施術プランナーへようこそ</h1>
          </div>
          <button onClick={onSkip} className="text-xs text-slate-400 hover:text-slate-600">スキップ</button>
        </div>

        {/* ステップインジケータ */}
        <div className="flex items-center gap-1 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-blue-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">院情報を入力</h2>
              <p className="text-xs text-slate-500">提案書・メニュー表・POPに反映されます。後から「院設定」で変更できます。</p>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">院名 *</label>
              <input
                type="text"
                value={settings.clinicName === '治療院' ? '' : settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                placeholder="例: ○○整体院"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">院名英語表記（任意）</label>
              <input
                type="text"
                value={settings.clinicNameEn || ''}
                onChange={(e) => setSettings({ ...settings, clinicNameEn: e.target.value })}
                placeholder="例: OO Seitai Clinic"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">キャッチコピー（任意）</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="例: 根本改善・自律神経専門院"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">住所</label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">電話番号</label>
                <input
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">院タイプを選択</h2>
              <p className="text-xs text-slate-500">院タイプに合わせたメニュー・松竹梅プラン・AIプロンプトのテンプレを自動で用意します。後から自由に編集できます。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CLINIC_TEMPLATE_LIST.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  className={`text-left rounded-xl border-2 p-5 transition ${selectedType === t.key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <p className="font-bold text-base text-slate-800 mb-1">{t.label}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2">メニュー{t.menuItems.length}件＋松竹梅プラン＋AIプロンプトをセット</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && selectedType && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">確認</h2>
              <p className="text-xs text-slate-500">以下の内容で初期セットアップを行います。</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 space-y-2 text-sm">
              <p><span className="text-slate-500">院名：</span><span className="font-bold">{settings.clinicName}</span></p>
              {settings.clinicNameEn && <p><span className="text-slate-500">英語表記：</span>{settings.clinicNameEn}</p>}
              {settings.tagline && <p><span className="text-slate-500">キャッチ：</span>{settings.tagline}</p>}
              <p><span className="text-slate-500">院タイプ：</span><span className="font-bold">{CLINIC_TEMPLATE_LIST.find((t) => t.key === selectedType)?.label}</span></p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
              <p className="font-bold">セットアップ内容</p>
              <p>・院設定の保存</p>
              <p>・メニュー{CLINIC_TEMPLATE_LIST.find((t) => t.key === selectedType)?.menuItems.length}件の自動登録</p>
              <p>・松竹梅プランの自動作成</p>
              <p>・AIプロンプト「{CLINIC_TEMPLATE_LIST.find((t) => t.key === selectedType)?.prompt.title}」の自動登録</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={back}
            disabled={step === 1 || loading}
            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30"
          >
            ← 戻る
          </button>
          {step < 3 ? (
            <button
              onClick={next}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition"
            >
              次へ →
            </button>
          ) : (
            <button
              onClick={finalize}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'セットアップ中…' : 'セットアップを完了する'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
