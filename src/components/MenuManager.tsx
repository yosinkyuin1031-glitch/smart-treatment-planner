'use client';

import { useState, useRef } from 'react';
import { MenuItem, MenuItemCategory, CATEGORIES } from '@/lib/types';
import { generateId } from '@/lib/storage';

// ===== CSV utilities =====

function escapeCsvCell(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function itemsToCsv(items: MenuItem[]): string {
  const headers = ['category', 'name', 'price', 'original_price', 'duration', 'unit', 'description', 'recommended', 'is_new', 'course_months', 'course_price', 'sort_order'];
  const rows = items.map((i) => [
    i.category,
    i.name,
    i.price,
    i.originalPrice ?? '',
    i.duration ?? '',
    i.unit,
    i.description ?? '',
    i.recommended,
    i.isNew,
    i.courseMonths ?? '',
    i.coursePrice ?? '',
    i.order,
  ].map(escapeCsvCell).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cell += c; }
    } else {
      if (c === ',') { result.push(cell); cell = ''; }
      else if (c === '"') { inQuotes = true; }
      else { cell += c; }
    }
  }
  result.push(cell);
  return result;
}

function csvToItems(csv: string, startOrder: number): MenuItem[] {
  const lines = csv.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = (key: string) => headers.indexOf(key);
  const items: MenuItem[] = [];
  for (let li = 1; li < lines.length; li++) {
    const cells = parseCsvLine(lines[li]);
    const category = (cells[idx('category')] || '施術系').trim() as MenuItemCategory;
    const name = (cells[idx('name')] || '').trim();
    if (!name) continue;
    const price = parseInt(cells[idx('price')] || '0', 10) || 0;
    const originalPrice = cells[idx('original_price')] ? parseInt(cells[idx('original_price')], 10) : undefined;
    const duration = cells[idx('duration')] ? parseInt(cells[idx('duration')], 10) : undefined;
    const unit = (cells[idx('unit')] || '回').trim();
    const description = cells[idx('description')]?.trim() || undefined;
    const recommended = ['true', '1', 'yes', '○', '◯'].includes((cells[idx('recommended')] || '').trim().toLowerCase());
    const isNew = ['true', '1', 'yes', '○', '◯'].includes((cells[idx('is_new')] || '').trim().toLowerCase());
    const courseMonths = cells[idx('course_months')] ? parseInt(cells[idx('course_months')], 10) : undefined;
    const coursePrice = cells[idx('course_price')] ? parseInt(cells[idx('course_price')], 10) : undefined;
    const order = cells[idx('sort_order')] ? parseInt(cells[idx('sort_order')], 10) : startOrder + items.length;
    items.push({
      id: generateId() + '-' + li,
      category,
      name,
      price,
      originalPrice,
      duration,
      unit,
      description,
      recommended,
      isNew,
      courseMonths,
      coursePrice,
      order,
    });
  }
  return items;
}

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

  // CSV export
  const fileRef = useRef<HTMLInputElement>(null);
  function handleExport() {
    const csv = itemsToCsv(items);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const csv = reader.result as string;
      const parsed = csvToItems(csv, items.length);
      if (parsed.length === 0) {
        alert('CSVから有効な行を読み取れませんでした');
        return;
      }
      const mode = confirm(`${parsed.length}件読み込みました。\n\nOKで既存メニューを置き換え／キャンセルで既存に追加します。`);
      if (mode) {
        onChange(parsed);
      } else {
        onChange([...items, ...parsed]);
      }
    };
    reader.readAsText(f, 'utf-8');
    if (fileRef.current) fileRef.current.value = '';
  }

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
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            title="CSVファイルからメニューを取り込む"
          >
            📥 CSV取込
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
          <button
            onClick={handleExport}
            disabled={items.length === 0}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="現在のメニューをCSVファイルでダウンロード"
          >
            📤 CSV出力
          </button>
          <button
            onClick={addItem}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + メニュー追加
          </button>
        </div>
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
