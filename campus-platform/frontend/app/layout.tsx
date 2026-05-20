import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'CampusHub — Clubs & Events',
  description: 'Discover clubs and events at your college',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#f9fafb', border: '1px solid rgba(255,255,255,0.1)' } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
