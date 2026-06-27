import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '施術プランナー',
  description: '治療院・サロン向け 施術メニュー管理・提案書作成・松竹梅プラン・POP生成',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
