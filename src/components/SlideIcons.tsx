// 線画SVGアイコン（NotebookLM風の細線・上品トーン）

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function IconBrain({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M11 6.5a3.5 3.5 0 0 0-3 5.5 4 4 0 0 0 0 6 3.5 3.5 0 0 0 6 1.5V8a3.5 3.5 0 0 0-3-1.5z" />
      <path d="M21 6.5a3.5 3.5 0 0 1 3 5.5 4 4 0 0 1 0 6 3.5 3.5 0 0 1-6 1.5V8a3.5 3.5 0 0 1 3-1.5z" />
      <path d="M14 14h4" />
      <path d="M14 19v6" />
    </svg>
  );
}

export function IconNerve({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M16 4c-2 4-6 4-6 8s4 4 4 8-4 4-4 8" />
      <path d="M16 4c2 4 6 4 6 8s-4 4-4 8 4 4 4 8" />
      <circle cx="10" cy="12" r="1.4" fill="currentColor" />
      <circle cx="22" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconSpine({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M16 4v24" />
      <path d="M12 7l8 0M11 11l10 0M10 15l12 0M11 19l10 0M12 23l8 0M13 27l6 0" />
    </svg>
  );
}

export function IconHeart({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M16 27s-9-5.5-9-13a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7.5-9 13-9 13z" />
    </svg>
  );
}

export function IconBowl({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M6 13c0-1 1-2 2-2h16c1 0 2 1 2 2 0 6-3 11-10 11s-10-5-10-11z" />
      <path d="M12 7c0-1 1-2 2-2M16 7c0-1 1-2 2-2M20 7c0-1 1-2 2-2" />
    </svg>
  );
}

export function IconWalk({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <circle cx="17" cy="5" r="2" />
      <path d="M17 7l-2 6 4 2 1 5" />
      <path d="M15 13l-4 3-1 5" />
      <path d="M19 20l3 1" />
      <path d="M10 21l-3 1" />
    </svg>
  );
}

export function IconLeaf({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M7 25c0-10 6-19 18-19 0 12-9 19-18 19z" />
      <path d="M7 25c4-4 10-9 18-19" />
    </svg>
  );
}

export function IconMoon({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M22 18A10 10 0 1 1 14 6a8 8 0 0 0 8 12z" />
    </svg>
  );
}

export function IconSun({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <circle cx="16" cy="16" r="5" />
      <path d="M16 3v3M16 26v3M3 16h3M26 16h3M7 7l2 2M23 23l2 2M7 25l2-2M23 9l2-2" />
    </svg>
  );
}

export function IconAlert({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M16 5l12 22H4z" />
      <path d="M16 13v6M16 23v.5" />
    </svg>
  );
}

export function IconSparkle({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <path d="M16 4v8M16 20v8M4 16h8M20 16h8M9 9l4 4M19 19l4 4M9 23l4-4M19 13l4-4" />
    </svg>
  );
}

export function IconPill({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <rect x="6" y="13" width="20" height="6" rx="3" transform="rotate(-30 16 16)" />
      <path d="M11 11l6 6" />
    </svg>
  );
}

export function IconStretch({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <circle cx="16" cy="6" r="2" />
      <path d="M16 8l-1 6M16 8l1 6" />
      <path d="M9 11l6 3M23 11l-6 3" />
      <path d="M14 14l-2 10M18 14l2 10" />
    </svg>
  );
}

export function IconClipboard({ className = '', size = 28 }: IconProps) {
  return (
    <svg className={className} {...baseProps(size)}>
      <rect x="7" y="6" width="18" height="22" rx="2" />
      <rect x="12" y="4" width="8" height="4" rx="1" />
      <path d="M11 14h10M11 18h10M11 22h6" />
    </svg>
  );
}

export function IconWatercolorAccent({ className = '', color = '#bfdbfe' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="60" rx="55" ry="50" fill={color} opacity="0.35" />
      <ellipse cx="65" cy="55" rx="40" ry="35" fill={color} opacity="0.45" />
    </svg>
  );
}

export const SYMPTOM_ICONS = {
  '腰痛': IconSpine,
  '膝痛': IconWalk,
  '坐骨神経痛': IconNerve,
  '脊柱管狭窄症': IconSpine,
  '自律神経失調症': IconHeart,
  '頭痛': IconBrain,
  '睡眠障害': IconMoon,
  '五十肩': IconStretch,
  '肩こり': IconStretch,
  'その他': IconLeaf,
} as const;
