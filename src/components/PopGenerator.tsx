'use client';

import { useState } from 'react';
import { MenuItem } from '@/lib/types';

interface Props {
  items: MenuItem[];
}

type PopStyle = 'premium' | 'impact' | 'elegant' | 'campaign';

const STYLES: { value: PopStyle; label: string }[] = [
  { value: 'premium', label: 'プレミアム' },
  { value: 'impact', label: 'インパクト' },
  { value: 'elegant', label: 'エレガント' },
  { value: 'campaign', label: 'キャンペーン' },
];

export default function PopGenerator({ items }: Props) {
  const [selectedId, setSelectedId] = useState(items[0]?.id || '');
  const [style, setStyle] = useState<PopStyle>('premium');
  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubtext, setCustomSubtext] = useState('');

  const item = items.find(i => i.id === selectedId);
  const headline = customHeadline || item?.name || 'メニュー名';
  const subtext = customSubtext || item?.description || '';
  const price = item?.price || 0;
  const originalPrice = item?.originalPrice;
  const discount = originalPrice && originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  function getStyleClasses(): { container: string; title: string; price: string; accent: string; bg: string } {
    switch (style) {
      case 'premium':
        return {
          container: 'bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 border-amber-300',
          title: 'text-amber-900', price: 'text-amber-800', accent: 'text-amber-600', bg: 'bg-amber-600',
        };
      case 'impact':
        return {
          container: 'bg-gradient-to-b from-red-600 via-red-700 to-red-800 border-red-900',
          title: 'text-white', price: 'text-yellow-300', accent: 'text-red-200', bg: 'bg-red-900',
        };
      case 'elegant':
        return {
          container: 'bg-white border-slate-200',
          title: 'text-slate-800', price: 'text-slate-700', accent: 'text-slate-400', bg: 'bg-slate-100',
        };
      case 'campaign':
        return {
          container: 'bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 border-blue-900',
          title: 'text-white', price: 'text-yellow-300', accent: 'text-blue-200', bg: 'bg-yellow-400',
        };
    }
  }

  const s = getStyleClasses();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 no-print">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">メニュー選択</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {items.map(i => (
                <option key={i.id} value={i.id}>{i.category} / {i.name} — ¥{i.price.toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">デザインスタイル</label>
            <div className="flex gap-2">
              {STYLES.map(st => (
                <button
                  key={st.value}
                  onClick={() => setStyle(st.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                    style === st.value ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">見出し（カスタム）</label>
            <input
              value={customHeadline}
              onChange={e => setCustomHeadline(e.target.value)}
              placeholder={item?.name || ''}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">サブテキスト（カスタム）</label>
            <input
              value={customSubtext}
              onChange={e => setCustomSubtext(e.target.value)}
              placeholder={item?.description || ''}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition"
          >
            印刷 / PDF
          </button>
        </div>
      </div>

      {/* POP Preview */}
      <div className="flex justify-center">
        <div className={`w-[210mm] aspect-[210/297] ${s.container} border-2 rounded-xl shadow-lg flex flex-col items-center justify-center p-12 print:shadow-none print:rounded-none print:border-0`}>
          {discount && (
            <div className={`${s.bg} text-white text-lg font-bold px-6 py-2 rounded-full mb-6`}>
              {discount}%OFF
            </div>
          )}
          <h1 className={`text-4xl font-bold ${s.title} text-center tracking-wider mb-4`}>
            {headline}
          </h1>
          {subtext && (
            <p className={`text-lg ${s.accent} text-center mb-8 max-w-md`}>
              {subtext}
            </p>
          )}
          <div className="text-center mb-4">
            {originalPrice && (
              <div className={`text-xl ${s.accent} line-through mb-1`}>
                通常 ¥{originalPrice.toLocaleString()}
              </div>
            )}
            <div className={`text-6xl font-bold ${s.price}`}>
              ¥{price.toLocaleString()}
              <span className={`text-xl ${s.accent} ml-2`}>（税込）</span>
            </div>
          </div>
          {item?.duration && (
            <div className={`text-lg ${s.accent} mt-4`}>
              施術時間：約{item.duration}分
            </div>
          )}
          {item?.courseMonths && (
            <div className={`${s.bg} bg-opacity-10 rounded-lg px-6 py-3 mt-6 text-center`}>
              <div className={`text-sm ${s.accent}`}>{item.courseMonths}ヶ月コース</div>
              <div className={`text-2xl font-bold ${s.price}`}>
                ¥{(item.coursePrice || 0).toLocaleString()}
              </div>
            </div>
          )}
          {item?.recommended && (
            <div className={`mt-8 ${s.bg} text-white px-8 py-2 rounded-full text-sm font-medium tracking-wider`}>
              STAFF RECOMMEND
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
