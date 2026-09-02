import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Financeira Rakisan | Gestão de Investimentos',
  description:
    'Plataforma para gestão e simulação de investimentos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
