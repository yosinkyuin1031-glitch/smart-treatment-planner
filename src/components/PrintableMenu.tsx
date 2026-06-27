'use client';

import { MenuItem, CATEGORIES } from '@/lib/types';

interface Props {
  items: MenuItem[];
}

export default function PrintableMenu({ items }: Props) {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <p className="text-sm text-slate-500">A4印刷用のメニュー表</p>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition"
        >
          印刷 / PDF
        </button>
      </div>

      {/* Printable area */}
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-[210mm] mx-auto print:shadow-none print:rounded-none print:p-6">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-wider">施術メニュー</h1>
          <p className="text-sm text-slate-500 mt-1">Menu & Price List</p>
        </div>

        {/* Categories */}
        {CATEGORIES.map(cat => {
          const catItems = sorted.filter(i => i.category === cat.value);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.value} className="mb-6">
              <div className={`flex items-center gap-2 mb-3 pb-1 border-b ${cat.color}`}>
                <span className={`text-sm font-bold ${cat.color}`}>{cat.label}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {catItems.map(item => (
                    <tr key={item.id} className="border-b border-dotted border-slate-200">
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                          {item.recommended && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">おすすめ</span>
                          )}
                          {item.isNew && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">NEW</span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                        )}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap w-20 text-sm">
                        {item.duration && <span className="text-slate-400 text-xs mr-2">{item.duration}分</span>}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap w-32">
                        {item.originalPrice && (
                          <span className="text-xs text-slate-400 line-through mr-1">¥{item.originalPrice.toLocaleString()}</span>
                        )}
                        <span className="font-bold text-slate-800">¥{item.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 ml-0.5">/{item.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Course info */}
              {catItems.filter(i => i.courseMonths).length > 0 && (
                <div className="mt-2 bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 mb-1">コース料金</div>
                  {catItems.filter(i => i.courseMonths).map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-600">
                      <span>{item.name}（{item.courseMonths}ヶ月コース）</span>
                      <span className="font-medium">¥{(item.coursePrice || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">※ 表示価格はすべて税込です</p>
          <p className="text-xs text-slate-400 mt-1">ご不明な点はお気軽にスタッフまでお申し付けください</p>
        </div>
      </div>
    </div>
  );
}
