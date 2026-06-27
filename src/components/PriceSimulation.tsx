'use client';

import { useState } from 'react';
import { MenuItem, CATEGORIES } from '@/lib/types';

interface Props {
  items: MenuItem[];
}

export default function PriceSimulation({ items }: Props) {
  const [monthlyPatients, setMonthlyPatients] = useState(80);
  const [courseConversion, setCourseConversion] = useState(20);

  const avgPrice = items.length > 0
    ? Math.round(items.filter(i => i.price > 0).reduce((s, i) => s + i.price, 0) / items.filter(i => i.price > 0).length)
    : 0;

  const priceChangedItems = items.filter(i => i.originalPrice && i.originalPrice !== i.price);
  const avgIncrease = priceChangedItems.length > 0
    ? Math.round(priceChangedItems.reduce((s, i) => s + ((i.price - (i.originalPrice || i.price)) / (i.originalPrice || i.price) * 100), 0) / priceChangedItems.length)
    : 0;

  const courseItems = items.filter(i => i.courseMonths && i.coursePrice);
  const avgCoursePrice = courseItems.length > 0
    ? Math.round(courseItems.reduce((s, i) => s + (i.coursePrice || 0), 0) / courseItems.length)
    : 0;

  const baseRevenue = monthlyPatients * avgPrice;
  const coursePatients = Math.round(monthlyPatients * courseConversion / 100);
  const courseRevenue = coursePatients * avgCoursePrice;
  const totalRevenue = baseRevenue + courseRevenue;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">メニュー数</div>
          <div className="text-2xl font-bold text-slate-800">{items.length}件</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">平均単価</div>
          <div className="text-2xl font-bold text-slate-800">¥{avgPrice.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">価格改定</div>
          <div className="text-2xl font-bold text-slate-800">{priceChangedItems.length}件</div>
          {avgIncrease !== 0 && (
            <div className={`text-xs ${avgIncrease > 0 ? 'text-green-600' : 'text-red-600'}`}>
              平均{avgIncrease > 0 ? '+' : ''}{avgIncrease}%
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">コースメニュー</div>
          <div className="text-2xl font-bold text-slate-800">{courseItems.length}件</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4">カテゴリ別内訳</h3>
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat.value);
            if (catItems.length === 0) return null;
            const catAvg = Math.round(catItems.filter(i => i.price > 0).reduce((s, i) => s + i.price, 0) / catItems.filter(i => i.price > 0).length || 0);
            const catMax = Math.max(...catItems.map(i => i.price));
            const catMin = Math.min(...catItems.filter(i => i.price > 0).map(i => i.price));
            return (
              <div key={cat.value}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>{cat.label}</span>
                    <span className="text-sm text-slate-500">{catItems.length}件</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">平均 ¥{catAvg.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {catItems.sort((a, b) => a.order - b.order).map(item => (
                        <tr key={item.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2 text-slate-700">{item.name}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{item.duration ? `${item.duration}分` : ''}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {item.originalPrice && item.originalPrice !== item.price && (
                              <span className="text-xs text-slate-400 line-through mr-2">¥{item.originalPrice.toLocaleString()}</span>
                            )}
                            ¥{item.price.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right w-20">
                            {item.originalPrice && item.originalPrice !== item.price && (
                              <span className={`text-xs font-medium ${
                                item.price > item.originalPrice ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.price > item.originalPrice ? '+' : ''}{Math.round((item.price - item.originalPrice) / item.originalPrice * 100)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {catItems.filter(i => i.price > 0).length > 1 && (
                  <div className="flex gap-4 text-xs text-slate-400 mt-1 px-1">
                    <span>最安: ¥{catMin.toLocaleString()}</span>
                    <span>最高: ¥{catMax.toLocaleString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Simulation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4">月間売上シミュレーション</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-slate-500 mb-1">月間来院数</label>
            <input
              type="number"
              value={monthlyPatients}
              onChange={e => setMonthlyPatients(Math.max(0, Number(e.target.value)))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">コース成約率 (%)</label>
            <input
              type="number"
              value={courseConversion}
              onChange={e => setCourseConversion(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-500 mb-1">基本施術売上</div>
              <div className="text-xl font-bold text-slate-800">¥{baseRevenue.toLocaleString()}</div>
              <div className="text-xs text-slate-400">{monthlyPatients}人 × ¥{avgPrice.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">コース売上</div>
              <div className="text-xl font-bold text-slate-800">¥{courseRevenue.toLocaleString()}</div>
              <div className="text-xs text-slate-400">{coursePatients}人 × ¥{avgCoursePrice.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">月間合計</div>
              <div className="text-2xl font-bold text-blue-700">¥{totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-slate-400">年間 ¥{(totalRevenue * 12).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
