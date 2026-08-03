import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../components/theme/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EduCrédito UTB | Fondo Estudiantil Universitario',
  description: 'Plataforma oficial del Sistema Cooperativo Crediticio Estudiantil de la Universidad Técnica de Babahoyo (UTB). Microcréditos solidarios entre compañeros sin buró bancario.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="transition-colors duration-300">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-emerald-500 selection:text-white`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
