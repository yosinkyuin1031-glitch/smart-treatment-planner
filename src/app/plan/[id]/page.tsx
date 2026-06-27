'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PlanSet } from '@/lib/types';
import { getPlanSetById, getPlanSetByIdFromDB, getUser } from '@/lib/storage';

const PLAN_GRADIENTS = [
  'from-pink-50 to-rose-100',
  'from-emerald-50 to-teal-100',
  'from-amber-50 to-yellow-100',
];

export default function PlanPage() {
  const { id } = useParams();
  const [mounted, setMounted] = useState(false);
  const [planSet, setPlanSet] = useState<PlanSet | null>(null);

  useEffect(() => {
    async function loadPlanSet() {
      if (typeof id !== 'string') {
        setMounted(true);
        return;
      }

      try {
        const user = await getUser();
        if (user) {
          const set = await getPlanSetByIdFromDB(id);
          setPlanSet(set || null);
        } else {
          const set = getPlanSetById(id);
          setPlanSet(set || null);
        }
      } catch {
        const set = getPlanSetById(id);
        setPlanSet(set || null);
      }

      setMounted(true);
    }

    loadPlanSet();
  }, [id]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (!planSet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">プランが見つかりません</h2>
          <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">← ダッシュボードに戻る</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print controls */}
      <div className="no-print bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-sm text-slate-500 hover:text-slate-700">← 戻る</a>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition"
        >
          印刷 / PDF
        </button>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto px-8 py-12 proposal-document">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 tracking-wider mb-2">施術プランのご案内</h1>
          <p className="text-sm text-slate-500">大口神経整体院</p>
          {planSet.name !== '新しいプランセット' && (
            <p className="text-sm text-slate-600 mt-1 font-medium">{planSet.name}</p>
          )}
        </div>

        {/* Plan Cards */}
        <div className={`grid gap-6 ${planSet.plans.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {planSet.plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`bg-gradient-to-b ${PLAN_GRADIENTS[i] || 'from-slate-50 to-slate-100'} rounded-2xl overflow-hidden ${
                plan.isRecommended ? 'ring-2 ring-blue-400 shadow-lg' : 'shadow-md'
              }`}
            >
              {/* Plan Header */}
              <div className={`px-6 py-4 ${plan.isRecommended ? 'bg-blue-600 text-white' : 'bg-white/60'}`}>
                {plan.isRecommended && (
                  <div className="text-xs font-medium bg-white/20 inline-block px-3 py-0.5 rounded-full mb-2">
                    おすすめ
                  </div>
                )}
                <div className={`text-lg font-bold ${plan.isRecommended ? '' : 'text-slate-800'}`}>
                  {plan.label}
                </div>
                <div className={`text-3xl font-bold mt-1 ${plan.isRecommended ? '' : 'text-slate-800'}`}>
                  ¥{plan.totalPrice.toLocaleString()}
                  <span className={`text-sm font-normal ml-1 ${plan.isRecommended ? 'text-white/70' : 'text-slate-500'}`}>/月</span>
                </div>
              </div>

              {/* Plan Items */}
              <div className="px-6 py-4 space-y-2">
                {plan.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5 text-sm">✓</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{item.menuItemName}</div>
                      <div className="text-xs text-slate-500">
                        {item.quantity}{item.unit} × ¥{item.unitPrice.toLocaleString()} = ¥{item.subtotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {plan.items.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">アイテムなし</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-slate-400">
          <p>ご不明な点がございましたら、お気軽にスタッフまでお申し付けください。</p>
        </div>
      </div>
    </div>
  );
}
