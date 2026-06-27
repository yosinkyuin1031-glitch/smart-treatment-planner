'use client';

import { useState } from 'react';
import { MenuItem, MenuItemCategory, CATEGORIES } from '@/lib/types';
import { generateId } from '@/lib/storage';

interface Props {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}

export default function MenuManager({ items, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MenuItem>>({});
  const [filter, setFilter] = useState<MenuItemCategory | 'all'>('all');

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);
  const sorted = [...filtered].sort((a, b) => a.order - b.order);

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({ ...item });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  function saveEdit() {
    if (!editingId || !form.name?.trim()) return;
    const updated = items.map(i =>
      i.id === editingId ? { ...i, ...form } as MenuItem : i
    );
    onChange(updated);
    cancelEdit();
  }

  function addItem() {
    const newItem: MenuItem = {
      id: generateId(),
      category: filter === 'all' ? '施術系' : filter,
      name: '新しいメニュー',
      price: 0,
      unit: '回',
      recommended: false,
      isNew: true,
      order: items.length + 1,
    };
    const updated = [...items, newItem];
    onChange(updated);
    startEdit(newItem);
  }

  function deleteItem(id: string) {
    if (!confirm('このメニューを削除しますか？')) return;
    onChange(items.filter(i => i.id !== id));
  }

  function moveItem(id: string, dir: -1 | 1) {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const arr = [...items];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    arr.forEach((item, i) => item.order = i + 1);
    onChange(arr);
  }

  const catInfo = (cat: MenuItemCategory) => CATEGORIES.find(c => c.value === cat);

  return (
    <div className="space-y-4">
      {/* Filter + Add */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          すべて ({items.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === cat.value ? `${cat.bg} ${cat.color}` : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
        <button
          onClick={addItem}
          className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + メニュー追加
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-left">
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">カテゴリ</th>
              <th className="px-4 py-3 font-medium">メニュー名</th>
              <th className="px-4 py-3 font-medium text-right">価格</th>
              <th className="px-4 py-3 font-medium text-center">時間</th>
              <th className="px-4 py-3 font-medium text-center">単位</th>
              <th className="px-4 py-3 font-medium text-center">フラグ</th>
              <th className="px-4 py-3 font-medium text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(item => (
              editingId === item.id ? (
                <tr key={item.id} className="bg-blue-50">
                  <td className="px-4 py-2" colSpan={8}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">カテゴリ</label>
                        <select
                          value={form.category || '施術系'}
                          onChange={e => setForm({ ...form, category: e.target.value as MenuItemCategory })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">メニュー名</label>
                        <input
                          value={form.name || ''}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">価格（税込）</label>
                        <input
                          type="number"
                          value={form.price ?? 0}
                          onChange={e => setForm({ ...form, price: Math.max(0, Number(e.target.value)) })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">旧価格（任意）</label>
                        <input
                          type="number"
                          value={form.originalPrice ?? ''}
                          onChange={e => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          placeholder="値上げ前の価格"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">所要時間（分）</label>
                        <input
                          type="number"
                          value={form.duration ?? ''}
                          onChange={e => setForm({ ...form, duration: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">単位</label>
                        <select
                          value={form.unit || '回'}
                          onChange={e => setForm({ ...form, unit: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                          {['回', '個', 'ヶ月', 'セット', '箱'].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">コース月数</label>
                        <input
                          type="number"
                          value={form.courseMonths ?? ''}
                          onChange={e => setForm({ ...form, courseMonths: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          placeholder="例: 3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">コース総額</label>
                        <input
                          type="number"
                          value={form.coursePrice ?? ''}
                          onChange={e => setForm({ ...form, coursePrice: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          placeholder="例: 120000"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-4">
                        <label className="block text-xs text-slate-500 mb-1">説明</label>
                        <input
                          value={form.description || ''}
                          onChange={e => setForm({ ...form, description: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-4 flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.recommended || false}
                            onChange={e => setForm({ ...form, recommended: e.target.checked })}
                          />
                          おすすめ
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.isNew || false}
                            onChange={e => setForm({ ...form, isNew: e.target.checked })}
                          />
                          NEW
                        </label>
                        <div className="ml-auto flex gap-2">
                          <button onClick={cancelEdit} className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">キャンセル</button>
                          <button onClick={saveEdit} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-2 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveItem(item.id, -1)} className="text-slate-400 hover:text-slate-600 text-xs">▲</button>
                      <button onClick={() => moveItem(item.id, 1)} className="text-slate-400 hover:text-slate-600 text-xs">▼</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catInfo(item.category)?.bg} ${catInfo(item.category)?.color}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{item.name}</div>
                    {item.description && <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {item.originalPrice && (
                      <span className="text-xs text-slate-400 line-through mr-1">¥{item.originalPrice.toLocaleString()}</span>
                    )}
                    ¥{item.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {item.duration ? `${item.duration}分` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">{item.unit}</td>
                  <td className="px-4 py-3 text-center">
                    {item.recommended && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mr-1">おすすめ</span>}
                    {item.isNew && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">NEW</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 hover:bg-blue-50 rounded">編集</button>
                      <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 hover:bg-red-50 rounded">削除</button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            メニューがありません。「+ メニュー追加」で追加してください。
          </div>
        )}
      </div>
    </div>
  );
}
