'use client';

import { Proposal, ProposalSlide, SlideBlock, THEMES, themeForSymptom, PlanSet } from '@/lib/types';

interface Props {
  proposal: Proposal;
  planSets?: PlanSet[];
}

export default function SlideRenderer({ proposal, planSets = [] }: Props) {
  const themeKey = proposal.themeKey || themeForSymptom(proposal.symptomCategory);
  const theme = THEMES[themeKey];
  const slides = proposal.slides || [];
  const planSet = planSets.find((ps) => ps.id === proposal.planSetId);

  return (
    <div className="space-y-6">
      {slides.map((slide) => (
        <div
          key={slide.no}
          className={`relative bg-white border-2 ${theme.borderColor} rounded-xl shadow-sm overflow-hidden break-after-page print:shadow-none print:rounded-none`}
          style={{ aspectRatio: '297/210', minHeight: '210mm' }}
        >
          <SlideContent slide={slide} theme={theme} proposal={proposal} planSet={planSet} />
          <div className={`absolute bottom-3 right-4 text-xs ${theme.primaryText} opacity-60`}>
            {slide.no}/{slides.length} ｜ 大口神経整体院
          </div>
        </div>
      ))}
    </div>
  );
}

function SlideContent({
  slide,
  theme,
  proposal,
  planSet,
}: {
  slide: ProposalSlide;
  theme: ReturnType<typeof getTheme>;
  proposal: Proposal;
  planSet?: PlanSet;
}) {
  switch (slide.layout) {
    case 'cover':
      return <CoverLayout slide={slide} theme={theme} proposal={proposal} />;
    case 'overview':
      return <OverviewLayout slide={slide} theme={theme} />;
    case 'iceberg':
      return <IcebergLayout slide={slide} theme={theme} />;
    case 'mechanism3':
      return <ThreeColumnLayout slide={slide} theme={theme} accent />;
    case 'risks-grid':
      return <GridLayout slide={slide} theme={theme} cols={2} headerStyle="warning" />;
    case 'positives':
      return <PositivesLayout slide={slide} theme={theme} />;
    case 'policy-3':
      return <ThreeColumnLayout slide={slide} theme={theme} accent showSubtitle />;
    case 'approach-4':
      return <GridLayout slide={slide} theme={theme} cols={2} headerStyle="approach" />;
    case 'changes-list':
      return <ChangesListLayout slide={slide} theme={theme} />;
    case 'schedule':
      return <ScheduleLayout slide={slide} theme={theme} />;
    case 'selfcare-4':
      return <GridLayout slide={slide} theme={theme} cols={2} headerStyle="selfcare" />;
    case 'plan-3':
      return <PlanLayout slide={slide} theme={theme} planSet={planSet} />;
    case 'closing':
      return <ClosingLayout slide={slide} theme={theme} />;
    default:
      return <DefaultLayout slide={slide} theme={theme} />;
  }
}

// ===== ヘルパー =====

type Theme = (typeof THEMES)[keyof typeof THEMES];
function getTheme(): Theme {
  return THEMES.blue;
}

function H1({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h1 className={`text-3xl font-bold tracking-wide ${className}`}>{children}</h1>;
}
function H2({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-2xl font-bold tracking-wide ${className}`}>{children}</h2>;
}

// ===== 1. 表紙 =====

function CoverLayout({ slide, theme, proposal }: { slide: ProposalSlide; theme: Theme; proposal: Proposal }) {
  const find = (t: string) => slide.blocks.find((b) => b.title === t)?.body || '';
  const today = find('日付');
  const goal = find('目標');
  const complaint = find('主訴');

  return (
    <div className={`h-full p-12 flex flex-col justify-between ${theme.surfaceBg}`}>
      <div>
        <div className={`text-xs ${theme.primaryText} font-bold tracking-widest mb-2`}>大口神経整体院</div>
        <H1 className={theme.primaryText}>{slide.title}</H1>
        <p className="text-sm text-gray-600 mt-2">{today}</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className={`bg-white rounded-2xl shadow-sm border ${theme.borderColor} px-10 py-8 max-w-2xl text-center`}>
          <p className="text-sm text-gray-500 mb-1">主訴</p>
          <p className="text-lg leading-relaxed text-slate-800 mb-4">{complaint || '（主訴）'}</p>
          {goal && <p className={`text-sm leading-relaxed ${theme.primaryText} italic`}>{goal}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 mb-1">患者様</p>
        <p className="text-2xl font-bold text-slate-800 border-b-2 border-gray-800 inline-block pb-1">
          {proposal.patientName || '（患者名）'} 様
        </p>
        {proposal.patientAge && (
          <p className="text-sm text-gray-500 mt-1">
            {proposal.patientAge}歳{proposal.patientGender ? ` / ${proposal.patientGender}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

// ===== 2. お悩みと状態 =====

function OverviewLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  const symptom = slide.blocks.find((b) => b.title === '主な症状')?.body || '';
  const bg = slide.blocks.find((b) => b.title === '背景')?.body || '';
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} border-b-2 pb-2 mb-6 ${theme.borderColor}`}>{slide.title}</H2>
      <div className="grid grid-cols-2 gap-8 flex-1">
        <div className="space-y-5">
          <div>
            <p className={`text-sm font-bold ${theme.primaryText} mb-2`}>主な症状</p>
            <p className="text-sm leading-relaxed text-slate-700">{symptom}</p>
          </div>
          <div>
            <p className={`text-sm font-bold ${theme.primaryText} mb-2`}>背景</p>
            <p className="text-sm leading-relaxed text-slate-700">{bg}</p>
          </div>
        </div>
        <div className={`flex items-center justify-center border-2 border-dashed ${theme.borderColor} rounded-xl ${theme.surfaceBg}`}>
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-2">🧍</div>
            <p className="text-xs">体のイラスト挿入枠</p>
            <p className="text-[10px] mt-1 text-gray-300">（次バージョンで画像アップロード対応）</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 3. 結果と原因（氷山） =====

function IcebergLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  const result = slide.blocks[0];
  const cause = slide.blocks[1];
  const note = slide.blocks[2];
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} mb-2`}>{slide.title}</H2>
      {slide.subtitle && <p className="text-sm text-gray-500 mb-6">{slide.subtitle}</p>}
      <div className="flex-1 grid grid-cols-2 gap-6">
        <div className={`bg-white border-2 ${theme.borderColor} rounded-xl p-6 flex flex-col items-center justify-center`}>
          <div className="text-4xl mb-2">{result?.icon || '💢'}</div>
          <div className={`text-5xl font-bold ${theme.primaryText} mb-2`}>30%</div>
          <p className="text-sm font-bold text-slate-800">{result?.title}</p>
          <p className="text-xs text-gray-600 text-center mt-1">{result?.body}</p>
        </div>
        <div className={`${theme.primaryBg} text-white rounded-xl p-6 flex flex-col items-center justify-center`}>
          <div className="text-4xl mb-2">{cause?.icon || '🧠'}</div>
          <div className="text-5xl font-bold mb-2">70%</div>
          <p className="text-sm font-bold">{cause?.title}</p>
          <p className="text-xs text-center mt-1 opacity-90 leading-relaxed">{cause?.body}</p>
        </div>
      </div>
      {note?.body && (
        <p className={`text-sm text-center mt-4 italic ${theme.primaryText}`}>{note.body}</p>
      )}
    </div>
  );
}

// ===== 4 & 7. 3カラム共通 =====

function ThreeColumnLayout({
  slide,
  theme,
  accent = false,
  showSubtitle = false,
}: {
  slide: ProposalSlide;
  theme: Theme;
  accent?: boolean;
  showSubtitle?: boolean;
}) {
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} mb-2`}>{slide.title}</H2>
      {slide.subtitle && <p className="text-sm text-gray-500 mb-6">{slide.subtitle}</p>}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {slide.blocks.slice(0, 3).map((b, i) => (
          <div key={i} className={`rounded-xl p-5 flex flex-col items-center text-center border-2 ${accent ? theme.borderColor : 'border-gray-200'} ${accent ? theme.surfaceBg : 'bg-white'}`}>
            <div className="text-4xl mb-3">{b.icon || '✦'}</div>
            <div className={`text-xs font-bold tracking-widest mb-2 ${theme.primaryText}`}>第{i + 1}段階</div>
            <p className="text-base font-bold text-slate-800 mb-1">{b.title}</p>
            {showSubtitle && b.subtitle && (
              <p className={`text-xs ${theme.primaryText} mb-2`}>{b.subtitle}</p>
            )}
            <p className="text-xs text-gray-600 leading-relaxed mt-1">{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 5 / 8 / 11. グリッド共通 =====

function GridLayout({
  slide,
  theme,
  cols,
  headerStyle,
}: {
  slide: ProposalSlide;
  theme: Theme;
  cols: 2 | 3;
  headerStyle: 'warning' | 'approach' | 'selfcare';
}) {
  const titleAccent =
    headerStyle === 'warning' ? 'bg-red-50 text-red-700 border-red-200'
      : headerStyle === 'approach' ? `${theme.surfaceBg} ${theme.primaryText} ${theme.borderColor}`
      : `${theme.surfaceBg} ${theme.primaryText} ${theme.borderColor}`;
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} mb-6`}>{slide.title}</H2>
      <div className={`flex-1 grid gap-4 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {slide.blocks.slice(0, cols === 2 ? 4 : 6).map((b, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${titleAccent} text-xs font-bold mb-3`}>
              <span>{b.icon || '✦'}</span>
              <span>{b.title}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 6. ポジティブ要素 =====

function PositivesLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  const fact = slide.blocks[0];
  const conclusion = slide.blocks[1];
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} mb-6`}>{slide.title}</H2>
      <div className="flex-1 flex flex-col gap-5 justify-center">
        <div className={`${theme.surfaceBg} border-2 ${theme.borderColor} rounded-xl p-6`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{fact?.icon || '✨'}</span>
            <p className={`text-sm font-bold ${theme.primaryText}`}>{fact?.title}</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{fact?.body}</p>
        </div>
        <div className={`${theme.primaryBg} text-white rounded-xl p-6 text-center`}>
          <span className="text-2xl mr-2">{conclusion?.icon || '🌱'}</span>
          <span className="text-base font-bold">{conclusion?.body}</span>
        </div>
      </div>
    </div>
  );
}

// ===== 9. 期待できる変化 =====

function ChangesListLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} mb-8`}>{slide.title}</H2>
      <div className="flex-1 flex flex-col justify-center gap-3">
        {slide.blocks.map((b, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`shrink-0 w-8 h-8 rounded-full ${theme.primaryBg} text-white flex items-center justify-center text-sm font-bold`}>
              {['❶', '❷', '❸', '❹', '❺'][i] || '◯'}
            </span>
            <p className="text-base text-slate-800 leading-relaxed pt-1">{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 10. スケジュール =====

function ScheduleLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  const stages = slide.blocks.slice(0, 3);
  const positive = slide.blocks[3];
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} mb-6`}>{slide.title}</H2>
      <div className="flex-1 flex flex-col gap-3">
        {stages.map((s, i) => (
          <div key={i} className={`flex items-stretch border-2 ${theme.borderColor} rounded-xl overflow-hidden`}>
            <div className={`${theme.primaryBg} text-white px-5 py-4 flex items-center min-w-[160px]`}>
              <p className="text-sm font-bold">{s.title?.replace(/（[^）]+）/, '')}</p>
            </div>
            <div className="flex-1 bg-white px-5 py-4 flex items-center">
              <p className="text-sm text-slate-700 leading-relaxed">{s.body}</p>
            </div>
            <div className={`${theme.surfaceBg} px-5 py-4 flex items-center min-w-[140px]`}>
              <p className={`text-xs ${theme.primaryText} font-bold`}>{s.title?.match(/（([^）]+)）/)?.[1]}</p>
            </div>
          </div>
        ))}
        {positive?.body && (
          <div className={`mt-2 ${theme.surfaceBg} rounded-lg p-3`}>
            <p className={`text-xs ${theme.primaryText} leading-relaxed`}>{positive.body}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 12. プラン =====

function PlanLayout({ slide, theme, planSet }: { slide: ProposalSlide; theme: Theme; planSet?: PlanSet }) {
  return (
    <div className="h-full p-10 flex flex-col">
      <H2 className={`${theme.primaryText} mb-6`}>{slide.title}</H2>
      {planSet ? (
        <div className="flex-1 grid grid-cols-3 gap-4">
          {planSet.plans.map((p) => (
            <div key={p.id} className={`rounded-xl p-5 flex flex-col border-2 ${p.isRecommended ? theme.borderColor + ' ' + theme.surfaceBg : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-base text-slate-800">{p.name}</p>
                {p.isRecommended && <span className={`text-[10px] ${theme.primaryBg} text-white px-2 py-0.5 rounded-full`}>おすすめ</span>}
              </div>
              {p.label && <p className="text-xs text-gray-500 mb-3">{p.label}</p>}
              <p className={`text-2xl font-bold ${theme.primaryText} mb-3`}>{p.totalPrice.toLocaleString('ja-JP')}円</p>
              <ul className="text-xs text-gray-700 space-y-1 mt-auto">
                {p.items.map((it, i) => (
                  <li key={i}>✓ {it.menuItemName}（{it.quantity}{it.unit}）</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-gray-500 mb-2">{slide.blocks[0]?.body}</p>
            <p className="text-xs text-gray-400">プランビルダータブで松竹梅プランを作成し、編集画面で紐付けてください。</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 13. 締め =====

function ClosingLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  return (
    <div className={`h-full p-10 flex flex-col items-center justify-center ${theme.surfaceBg}`}>
      <div className="text-6xl mb-6">🌿</div>
      <H1 className={`${theme.primaryText} text-center mb-3`}>{slide.title}</H1>
      {slide.subtitle && <p className="text-sm text-gray-600">{slide.subtitle}</p>}
      <p className="text-sm text-slate-700 leading-relaxed mt-8 max-w-xl text-center">
        {slide.blocks[0]?.body}
      </p>
    </div>
  );
}

// ===== Default fallback =====

function DefaultLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  return (
    <div className="h-full p-10">
      <H2 className={`${theme.primaryText} mb-4`}>{slide.title}</H2>
      {slide.subtitle && <p className="text-sm text-gray-500 mb-6">{slide.subtitle}</p>}
      <div className="space-y-3">
        {slide.blocks.map((b: SlideBlock, i: number) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            {b.title && <p className="font-bold text-sm text-slate-800 mb-1">{b.title}</p>}
            <p className="text-sm text-slate-700 whitespace-pre-line">{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
