'use client';

import { useState, useEffect, useRef } from 'react';
import { MenuItem, PlanSet, Proposal } from '@/lib/types';
import {
  getMenuItems, saveMenuItems, getPlanSets,
  exportAllData, importAllData,
  getMenuItemsFromDB, saveMenuItemsToDB,
  getPlanSetsFromDB, exportAllDataFromDB, importAllDataToDB,
  signIn, signUp, signOut, getUser, onAuthChange,
  getProposalsFromDB, saveProposalToDB, deleteProposalFromDB,
} from '@/lib/storage';
import MenuManager from '@/components/MenuManager';
import PlanBuilder from '@/components/PlanBuilder';
import PrintableMenu from '@/components/PrintableMenu';
import PopGenerator from '@/components/PopGenerator';
import PriceSimulation from '@/components/PriceSimulation';
import ProposalManager from '@/components/ProposalManager';
import { User } from '@supabase/supabase-js';

type Tab = 'proposal' | 'menu' | 'plan' | 'print' | 'pop' | 'sim';

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: 'proposal', label: '提案書', icon: '📄' },
  { value: 'menu', label: 'メニュー管理', icon: '📋' },
  { value: 'plan', label: 'プランビルダー', icon: '📝' },
  { value: 'print', label: 'メニュー表', icon: '🖨️' },
  { value: 'pop', label: 'POP生成', icon: '🎨' },
  { value: 'sim', label: '価格分析', icon: '📊' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('proposal');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [planSets, setPlanSets] = useState<PlanSet[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Initialize auth and load data
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function init() {
      try {
        const currentUser = await getUser();
        setUser(currentUser);

        subscription = onAuthChange((u) => {
          setUser(u);
        });

        if (currentUser) {
          const items = await getMenuItemsFromDB();
          setMenuItems(items);
          const sets = await getPlanSetsFromDB();
          setPlanSets(sets);
          const props = await getProposalsFromDB();
          setProposals(props);
        } else {
          setMenuItems(getMenuItems());
          setPlanSets(getPlanSets());
          setProposals([]);
        }
      } catch {
        setMenuItems(getMenuItems());
        setPlanSets(getPlanSets());
        setProposals([]);
      } finally {
        setAuthLoading(false);
        setMounted(true);
      }
    }

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Reload data when user changes
  useEffect(() => {
    if (!mounted) return;

    async function loadData() {
      if (user) {
        const items = await getMenuItemsFromDB();
        setMenuItems(items);
        const sets = await getPlanSetsFromDB();
        setPlanSets(sets);
        const props = await getProposalsFromDB();
        setProposals(props);
      } else {
        setMenuItems(getMenuItems());
        setPlanSets(getPlanSets());
        setProposals([]);
      }
    }

    loadData();
  }, [user, mounted]);

  async function handleSaveProposal(p: Proposal) {
    const saved = await saveProposalToDB(p);
    setProposals((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id || x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }

  async function handleDeleteProposal(id: string) {
    await deleteProposalFromDB(id);
    setProposals((prev) => prev.filter((x) => x.id !== id));
  }

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function handleMenuChange(items: MenuItem[]) {
    setMenuItems(items);
    if (user) {
      await saveMenuItemsToDB(items);
    } else {
      saveMenuItems(items);
    }
    setToast('メニューを保存しました');
  }

  function handlePlanChange(sets: PlanSet[]) {
    setPlanSets(sets);
  }

  async function handleExport() {
    const json = user ? await exportAllDataFromDB() : exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu-proposal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('データをエクスポートしました');
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const jsonStr = ev.target?.result as string;
        if (user) {
          const result = await importAllDataToDB(jsonStr);
          setMenuItems(result.menuItems);
          setPlanSets(result.planSets);
        } else {
          const result = importAllData(jsonStr);
          setMenuItems(result.menuItems);
          setPlanSets(result.planSets);
        }
        setToast('データをインポートしました');
      } catch {
        setToast('インポートに失敗しました');
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSignIn() {
    setAuthError('');
    try {
      await signIn(authEmail, authPassword);
      setToast('ログインしました');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました';
      setAuthError(message);
    }
  }

  async function handleSignUp() {
    setAuthError('');
    try {
      await signUp(authEmail, authPassword);
      setToast('アカウントを作成しました。メールを確認してください。');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'アカウント作成に失敗しました';
      setAuthError(message);
    }
  }

  async function handleSignOut() {
    await signOut();
    setMenuItems(getMenuItems());
    setPlanSets(getPlanSets());
    setToast('ログアウトしました');
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        {toast && (
          <div
            className="fixed top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            {toast}
          </div>
        )}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-lg font-bold text-slate-800 text-center mb-1">施術プランナー</h1>
            <p className="text-sm text-slate-500 text-center mb-6">
              {authMode === 'login' ? 'ログイン' : 'アカウント作成'}
            </p>

            {authError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="email@example.com"
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleSignIn() : handleSignUp())}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">パスワード</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="6文字以上"
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleSignIn() : handleSignUp())}
                />
              </div>
              <button
                onClick={authMode === 'login' ? handleSignIn : handleSignUp}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
              >
                {authMode === 'login' ? 'ログイン' : 'アカウント作成'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {authMode === 'login' ? 'アカウントをお持ちでない方はこちら' : 'ログインはこちら'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b no-print sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800">施術プランナー</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 hover:bg-slate-100 rounded"
              >
                エクスポート
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 hover:bg-slate-100 rounded"
              >
                インポート
              </button>
              <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              <span className="text-xs text-slate-400 ml-2">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
              >
                ログアウト
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 mt-2 -mb-px overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'proposal' && (
          <ProposalManager
            proposals={proposals}
            planSets={planSets}
            menuItems={menuItems}
            onSave={handleSaveProposal}
            onDelete={handleDeleteProposal}
            showToast={(msg) => setToast(msg)}
          />
        )}
        {activeTab === 'menu' && <MenuManager items={menuItems} onChange={handleMenuChange} />}
        {activeTab === 'plan' && <PlanBuilder items={menuItems} planSets={planSets} onChange={handlePlanChange} />}
        {activeTab === 'print' && <PrintableMenu items={menuItems} />}
        {activeTab === 'pop' && <PopGenerator items={menuItems} />}
        {activeTab === 'sim' && <PriceSimulation items={menuItems} />}
      </main>
    </div>
  );
}
