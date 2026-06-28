'use client';

import { useRef } from 'react';
import { Proposal, ProposalSlide, SlideBlock, THEMES, themeForSymptom, PlanSet } from '@/lib/types';
import { IconWatercolorAccent } from './SlideIcons';

interface Props {
  proposal: Proposal;
  planSets?: PlanSet[];
  editable?: boolean;
  onSlideChange?: (slideNo: number, updated: ProposalSlide) => void;
}

type Theme = (typeof THEMES)[keyof typeof THEMES];

export default function SlideRenderer({ proposal, planSets = [], editable = false, onSlideChange }: Props) {
  const themeKey = proposal.themeKey || themeForSymptom(proposal.symptomCategory);
  const theme = THEMES[themeKey];
  const slides = proposal.slides || [];
  const planSet = planSets.find((ps) => ps.id === proposal.planSetId);

  // 配色テーマに対応した水彩色
  const watercolorPalette: Record<string, string> = {
    blue: '#dbeafe', purple: '#ede9fe', orange: '#ffedd5', pink: '#fce7f3', green: '#dcfce7', gray: '#e2e8f0',
  };
  const watercolorColor = watercolorPalette[themeKey] || '#e2e8f0';

  return (
    <div className="space-y-6">
      {slides.map((slide) => (
        <div
          key={slide.no}
          className={`relative bg-white border ${theme.borderColor} rounded-2xl shadow-sm overflow-hidden break-after-page print:shadow-none print:rounded-none`}
          style={{ aspectRatio: '297/210', minHeight: '210mm' }}
        >
          {/* 水彩風背景装飾 */}
          <IconWatercolorAccent className="absolute -top-10 -right-10 w-56 h-56 pointer-events-none" color={watercolorColor} />
          <IconWatercolorAccent className="absolute -bottom-16 -left-12 w-48 h-48 pointer-events-none" color={watercolorColor} />
          <SlideContent
            slide={slide}
            theme={theme}
            proposal={proposal}
            planSet={planSet}
            editable={editable}
            onChange={(updated) => onSlideChange?.(slide.no, updated)}
          />
          <div className={`absolute bottom-4 left-6 text-[10px] tracking-[0.3em] text-slate-400 uppercase`}>
            {proposal.clinicNameEn || proposal.clinicName || 'Clinic'}
          </div>
          <div className={`absolute bottom-4 right-6 text-[10px] tracking-widest text-slate-400`}>
            {String(slide.no).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
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
  editable,
  onChange,
}: {
  slide: ProposalSlide;
  theme: Theme;
  proposal: Proposal;
  planSet?: PlanSet;
  editable: boolean;
  onChange: (updated: ProposalSlide) => void;
}) {
  switch (slide.layout) {
    case 'cover':
      return <CoverLayout slide={slide} theme={theme} proposal={proposal} editable={editable} onChange={onChange} />;
    case 'overview':
      return <OverviewLayout slide={slide} theme={theme} editable={editable} onChange={onChange} />;
    case 'iceberg':
      return <IcebergLayout slide={slide} theme={theme} />;
    case 'mechanism3':
      return <ThreeColumnLayout slide={slide} theme={theme} />;
    case 'risks-grid':
      return <GridLayout slide={slide} theme={theme} cols={2} headerStyle="warning" />;
    case 'positives':
      return <PositivesLayout slide={slide} theme={theme} />;
    case 'policy-3':
      return <ThreeColumnLayout slide={slide} theme={theme} showSubtitle />;
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

function H1({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h1 className={`text-3xl font-serif font-bold tracking-wide ${className}`}>{children}</h1>;
}
function H2({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-2xl font-serif font-bold tracking-wide ${className}`}>{children}</h2>;
}

function ImageUploadBox({
  current,
  placeholder = '画像を追加',
  onUpload,
  className = '',
  emojiHint,
}: {
  current?: string;
  placeholder?: string;
  onUpload: (base64: string) => void;
  className?: string;
  emojiHint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onUpload(reader.result);
    };
    reader.readAsDataURL(f);
  };
  return (
    <div className={`relative ${className}`}>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="" className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
          {emojiHint && <div className="text-5xl mb-2">{emojiHint}</div>}
          <p className="text-xs">{placeholder}</p>
        </div>
      )}
      <button
        onClick={() => ref.current?.click()}
        className="absolute bottom-2 right-2 px-2 py-1 text-[10px] bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 print:hidden"
      >
        {current ? '差替え' : '画像追加'}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
}

function updateBlockField(slide: ProposalSlide, idx: number, field: keyof SlideBlock, value: string): ProposalSlide {
  const blocks = slide.blocks.map((b, i) => (i === idx ? { ...b, [field]: value } : b));
  return { ...slide, blocks };
}

// ===== 1. 表紙 =====

function CoverLayout({
  slide,
  theme,
  proposal,
  editable,
  onChange,
}: {
  slide: ProposalSlide;
  theme: Theme;
  proposal: Proposal;
  editable: boolean;
  onChange: (updated: ProposalSlide) => void;
}) {
  const find = (t: string) => slide.blocks.find((b) => b.title === t)?.body || '';
  const findIdx = (t: string) => slide.blocks.findIndex((b) => b.title === t);
  const today = find('日付');
  const goal = find('目標');
  const complaint = find('主訴');
  const coverImgIdx = findIdx('表紙画像');

  return (
    <div className="relative h-full p-14 flex flex-col bg-white z-10">
      <div className="text-center">
        <div className={`text-[10px] tracking-[0.4em] mb-3 ${theme.primaryText}`}>初回施術 ご提案書</div>
        <p className="text-[10px] text-slate-400 tracking-wider">{today}</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center px-8">
        {(editable || coverImgIdx >= 0) && (
          <div className="w-72 h-44 mb-6 opacity-95">
            <ImageUploadBox
              current={slide.blocks[coverImgIdx]?.illustration}
              placeholder="表紙メインビジュアル（任意）"
              emojiHint="🌿"
              onUpload={(b64) => {
                if (coverImgIdx >= 0) {
                  onChange(updateBlockField(slide, coverImgIdx, 'illustration', b64));
                } else {
                  onChange({ ...slide, blocks: [...slide.blocks, { title: '表紙画像', illustration: b64 }] });
                }
              }}
            />
          </div>
        )}

        <p className="text-[10px] text-slate-400 tracking-widest mb-3">主訴</p>
        <p className="text-lg text-slate-800 leading-relaxed font-serif max-w-2xl">{complaint || '（主訴）'}</p>
        {goal && (
          <>
            <div className={`h-px w-16 ${theme.accentBg} my-5`} />
            <p className={`text-sm italic ${theme.primaryText} font-serif max-w-xl leading-relaxed`}>〜 {goal} 〜</p>
          </>
        )}
      </div>

      <div className="text-center">
        <p className="text-2xl font-serif font-bold text-slate-800">
          {proposal.patientName || '（患者名）'} <span className={`text-base font-normal ${theme.primaryText}`}>様</span>
        </p>
        {proposal.patientAge && (
          <p className="text-xs text-slate-500 mt-1 tracking-wider">
            {proposal.patientAge}歳{proposal.patientGender ? `／${proposal.patientGender}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

// ===== 2. お悩みと状態 =====

function OverviewLayout({
  slide,
  theme,
  editable,
  onChange,
}: {
  slide: ProposalSlide;
  theme: Theme;
  editable: boolean;
  onChange: (updated: ProposalSlide) => void;
}) {
  const symptomIdx = slide.blocks.findIndex((b) => b.title === '主な症状');
  const bgIdx = slide.blocks.findIndex((b) => b.title === '背景');
  const illustIdx = slide.blocks.findIndex((b) => b.title === '体のイラスト');
  const symptom = slide.blocks[symptomIdx]?.body || '';
  const bg = slide.blocks[bgIdx]?.body || '';
  return (
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800 mb-1">{slide.title}</H2>
      <div className={`h-px ${theme.accentBg} mb-6`} />
      <div className="grid grid-cols-2 gap-8 flex-1">
        <div className="space-y-5">
          <div className={`border-l-2 ${theme.borderColor} pl-4`}>
            <p className={`text-xs font-serif font-bold ${theme.primaryText} mb-2 tracking-wider`}>主な症状</p>
            <p className="text-sm leading-relaxed text-slate-700">{symptom}</p>
          </div>
          <div className={`border-l-2 ${theme.borderColor} pl-4`}>
            <p className={`text-xs font-serif font-bold ${theme.primaryText} mb-2 tracking-wider`}>背景</p>
            <p className="text-sm leading-relaxed text-slate-700">{bg}</p>
          </div>
        </div>
        <div className={`relative ${theme.surfaceBg} rounded-2xl flex items-center justify-center overflow-hidden`}>
          {editable || illustIdx >= 0 ? (
            <ImageUploadBox
              current={slide.blocks[illustIdx]?.illustration}
              placeholder="体のイラスト挿入枠"
              emojiHint="🧍"
              onUpload={(b64) => {
                if (illustIdx >= 0) onChange(updateBlockField(slide, illustIdx, 'illustration', b64));
                else onChange({ ...slide, blocks: [...slide.blocks, { title: '体のイラスト', illustration: b64 }] });
              }}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center text-slate-300">
              <div className="text-5xl mb-2">🧍</div>
              <p className="text-xs">体のイラスト</p>
            </div>
          )}
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
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      {slide.subtitle && <p className="text-xs text-slate-500 mt-1">{slide.subtitle}</p>}
      <div className={`h-px ${theme.accentBg} my-4`} />
      <div className="flex-1 grid grid-cols-5 gap-4 items-stretch">
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className={`text-3xl font-serif font-bold ${theme.primaryText} mb-2`}>30%</div>
          <p className="text-sm font-serif font-bold text-slate-800 mb-2">{result?.title}</p>
          <p className="text-xs text-slate-600 text-center">{result?.body}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-slate-300 text-3xl">＝</div>
        </div>
        <div className={`col-span-2 ${theme.primaryBg} text-white rounded-2xl p-6 flex flex-col items-center justify-center`}>
          <div className="text-3xl font-serif font-bold mb-2">70%</div>
          <p className="text-sm font-serif font-bold mb-2">{cause?.title}</p>
          <p className="text-xs text-center opacity-90 leading-relaxed">{cause?.body}</p>
        </div>
      </div>
      {note?.body && (
        <p className={`text-xs text-center mt-4 italic text-slate-600 max-w-2xl mx-auto`}>{note.body}</p>
      )}
    </div>
  );
}

// ===== 4 & 7. 3カラム共通 =====

function ThreeColumnLayout({
  slide,
  theme,
  showSubtitle = false,
}: {
  slide: ProposalSlide;
  theme: Theme;
  showSubtitle?: boolean;
}) {
  return (
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      {slide.subtitle && <p className="text-xs text-slate-500 mt-1">{slide.subtitle}</p>}
      <div className={`h-px ${theme.accentBg} my-4`} />
      <div className="flex-1 grid grid-cols-3 gap-5">
        {slide.blocks.slice(0, 3).map((b, i) => (
          <div key={i} className={`rounded-2xl p-7 flex flex-col text-center border ${theme.borderColor} bg-white/80 backdrop-blur-sm justify-center`}>
            <div className={`text-[10px] tracking-[0.3em] ${theme.primaryText} mb-3`}>STEP {String(i + 1).padStart(2, '0')}</div>
            <p className="text-base font-serif font-bold text-slate-800 mb-2">{b.title}</p>
            {showSubtitle && b.subtitle && (
              <p className={`text-xs ${theme.primaryText} mb-2 font-serif`}>{b.subtitle}</p>
            )}
            <p className="text-xs text-slate-600 leading-relaxed">{b.body}</p>
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
  const accentBar =
    headerStyle === 'warning' ? 'bg-rose-300' : theme.accentBg;
  return (
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      <div className={`h-px ${theme.accentBg} my-4`} />
      <div className={`flex-1 grid gap-5 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {slide.blocks.slice(0, cols === 2 ? 4 : 6).map((b, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-block w-1 h-5 rounded-full ${accentBar}`} />
              <p className="text-sm font-serif font-bold text-slate-800 leading-tight">{b.title}</p>
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
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      <div className={`h-px ${theme.accentBg} my-4`} />
      <div className="flex-1 flex flex-col gap-5 justify-center max-w-3xl mx-auto w-full">
        <div className={`${theme.surfaceBg} border ${theme.borderColor} rounded-2xl p-6`}>
          <p className={`text-xs font-serif font-bold ${theme.primaryText} mb-3 tracking-wider`}>{fact?.title}</p>
          <p className="text-sm leading-relaxed text-slate-700">{fact?.body}</p>
        </div>
        <div className={`${theme.primaryBg} text-white rounded-2xl p-6 text-center`}>
          <p className="text-base font-serif font-bold">{conclusion?.body}</p>
        </div>
      </div>
    </div>
  );
}

// ===== 9. 期待できる変化 =====

function ChangesListLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  return (
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      <div className={`h-px ${theme.accentBg} my-4`} />
      <div className="flex-1 flex flex-col justify-center gap-4 max-w-3xl mx-auto w-full">
        {slide.blocks.map((b, i) => (
          <div key={i} className={`flex items-start gap-4 border-b ${theme.borderColor} pb-3`}>
            <span className={`shrink-0 w-9 h-9 rounded-full ${theme.primaryBg} text-white flex items-center justify-center text-sm font-serif`}>
              {['❶', '❷', '❸', '❹', '❺'][i] || '◯'}
            </span>
            <p className="text-base text-slate-800 leading-relaxed pt-1.5 font-serif">{b.body}</p>
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
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      <div className={`h-px ${theme.accentBg} my-4`} />
      <div className="flex-1 flex flex-col gap-3">
        {stages.map((s, i) => {
          const stageLabel = s.title?.replace(/（[^）]+）/, '');
          const period = s.title?.match(/（([^）]+)）/)?.[1];
          return (
            <div key={i} className={`flex items-stretch border ${theme.borderColor} rounded-2xl overflow-hidden bg-white`}>
              <div className={`${theme.primaryBg} text-white px-6 py-5 flex flex-col justify-center min-w-[180px]`}>
                <p className="text-[10px] tracking-widest mb-1 opacity-80">PHASE {i + 1}</p>
                <p className="text-sm font-serif font-bold">{stageLabel}</p>
              </div>
              <div className="flex-1 px-5 py-4 flex items-center">
                <p className="text-sm text-slate-700 leading-relaxed">{s.body}</p>
              </div>
              <div className={`${theme.surfaceBg} px-5 py-4 flex items-center min-w-[140px] border-l ${theme.borderColor}`}>
                <p className={`text-xs font-serif ${theme.primaryText}`}>{period}</p>
              </div>
            </div>
          );
        })}
        {positive?.body && (
          <div className={`mt-2 ${theme.surfaceBg} rounded-xl p-4`}>
            <p className={`text-xs italic ${theme.primaryText} leading-relaxed font-serif`}>{positive.body}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 12. プラン =====

function PlanLayout({ slide, theme, planSet }: { slide: ProposalSlide; theme: Theme; planSet?: PlanSet }) {
  return (
    <div className="relative h-full p-10 flex flex-col bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      <p className="text-xs text-slate-500 mt-1">単発のメニュー合計より、お得な総合プランをご提案します</p>
      <div className={`h-px ${theme.accentBg} my-4`} />
      {planSet ? (
        <div className="flex-1 grid grid-cols-3 gap-4">
          {planSet.plans.map((p) => {
            const itemListPrice = p.items.reduce((sum, it) => {
              return sum + ((it.unitPrice || 0) * (it.quantity || 1));
            }, 0);
            const discount = itemListPrice - p.totalPrice;
            return (
              <div key={p.id} className={`rounded-2xl p-5 flex flex-col border ${p.isRecommended ? theme.borderColor + ' ' + theme.surfaceBg : 'border-slate-200 bg-white'} relative overflow-hidden`}>
                {p.isRecommended && (
                  <div className={`absolute top-0 left-0 right-0 ${theme.primaryBg} text-white text-center py-1 text-[10px] font-bold tracking-widest`}>
                    院長おすすめ
                  </div>
                )}
                <div className={`flex items-baseline gap-2 ${p.isRecommended ? 'mt-5' : ''}`}>
                  <p className="font-serif font-bold text-lg text-slate-800">{p.name}</p>
                </div>
                {p.label && <p className="text-[11px] text-slate-500 mb-3">{p.label}</p>}
                <div className="mb-3">
                  <p className={`text-2xl font-serif font-bold ${theme.primaryText}`}>{p.totalPrice.toLocaleString('ja-JP')}<span className="text-sm">円</span></p>
                  {discount > 0 && (
                    <p className="text-[10px] text-rose-600 mt-1">通常合計 {itemListPrice.toLocaleString('ja-JP')}円より <span className="font-bold">{discount.toLocaleString('ja-JP')}円お得</span></p>
                  )}
                </div>
                <div className={`h-px ${theme.borderColor} mb-3`} />
                <p className="text-[10px] text-slate-400 font-bold tracking-wider mb-2">含まれる内容</p>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {p.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">
                        <span className={theme.primaryText}>＋</span> {it.menuItemName}
                      </span>
                      <span className="text-slate-500 shrink-0 text-[10px]">×{it.quantity}{it.unit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3">
                  <div className={`text-center text-[10px] ${theme.primaryText} pt-2 border-t ${theme.borderColor}`}>
                    施術 {p.items.length}項目
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-sm text-slate-500 mb-2">{slide.blocks[0]?.body}</p>
            <p className="text-xs text-slate-400">プランビルダータブで松竹梅プランを作成し、編集画面で紐付けてください。</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 13. 締め =====

function ClosingLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  return (
    <div className={`relative h-full p-12 flex flex-col items-center justify-center bg-white z-10`}>
      <div className={`text-5xl mb-6 ${theme.primaryText}`}>—</div>
      <H1 className="text-slate-800 text-center mb-3">{slide.title}</H1>
      {slide.subtitle && <p className={`text-xs ${theme.primaryText} tracking-widest font-serif`}>{slide.subtitle}</p>}
      <p className="text-sm text-slate-600 leading-relaxed mt-8 max-w-xl text-center font-serif">
        {slide.blocks[0]?.body}
      </p>
    </div>
  );
}

// ===== Default fallback =====

function DefaultLayout({ slide, theme }: { slide: ProposalSlide; theme: Theme }) {
  return (
    <div className="relative h-full p-10 bg-white z-10">
      <H2 className="text-slate-800">{slide.title}</H2>
      {slide.subtitle && <p className="text-xs text-slate-500 mt-1">{slide.subtitle}</p>}
      <div className={`h-px ${theme.accentBg} my-4`} />
      <div className="space-y-3">
        {slide.blocks.map((b: SlideBlock, i: number) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4">
            {b.title && <p className="font-serif font-bold text-sm text-slate-800 mb-1">{b.title}</p>}
            <p className="text-sm text-slate-700 whitespace-pre-line">{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
