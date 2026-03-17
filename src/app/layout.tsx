import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'متجر بوتات Discord - الطريقة الأسهل للدفع',
  description: 'متجر بيع بوتات Discord مع طرق دفع متعددة',
  keywords: 'Discord Bots, متجر, بيع, بوتات',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
