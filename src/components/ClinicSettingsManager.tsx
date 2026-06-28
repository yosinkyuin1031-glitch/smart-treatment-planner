'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClinicSettings, DEFAULT_CLINIC_SETTINGS } from '@/lib/types';
import { getClinicSettings, saveClinicSettings } from '@/lib/storage';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
  onSettingsChange?: (s: ClinicSettings) => void;
}

export default function ClinicSettingsManager({ showToast, onSettingsChange }: Props) {
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      const s = await getClinicSettings();
      setSettings(s);
    } catch {
      showToast('院設定の読み込みに失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSave = async () => {
    if (!settings.clinicName.trim()) {
      showToast('院名を入力してください', 'warning');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveClinicSettings(settings);
      setSettings(saved);
      onSettingsChange?.(saved);
      showToast('院設定を保存しました', 'success');
    } catch {
      showToast('保存に失敗しました', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSettings({ ...settings, logoUrl: reader.result });
      }
    };
    reader.readAsDataURL(f);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-800">院設定</h2>
        <p className="text-xs text-slate-500 mt-1">提案書・メニュー表・POPなど、すべての出力に反映される院情報です。</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">院名 *</label>
          <input
            type="text"
            value={settings.clinicName}
            onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
            placeholder="例: ○○整体院 / ○○鍼灸院"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">院名英語表記（任意）</label>
          <input
            type="text"
            value={settings.clinicNameEn || ''}
            onChange={(e) => setSettings({ ...settings, clinicNameEn: e.target.value })}
            placeholder="例: OO Clinic / OO Acupuncture"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-[10px] text-slate-400 mt-1">提案書スライドの表紙のヘッダーに小さく表示されます</p>
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

        <div>
          <label className="block text-xs text-slate-500 mb-1">ロゴ画像</label>
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt="logo" className="w-16 h-16 object-contain border border-slate-200 rounded" />
            ) : (
              <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-xs">なし</div>
            )}
            <input type="file" accept="image/*" onChange={handleLogo} className="text-xs" />
            {settings.logoUrl && (
              <button onClick={() => setSettings({ ...settings, logoUrl: '' })} className="text-xs text-rose-600">削除</button>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
      >
        {saving ? '保存中…' : '院設定を保存'}
      </button>
    </div>
  );
}
