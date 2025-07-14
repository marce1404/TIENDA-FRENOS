
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AppLayoutClientBoundary } from '@/components/app-layout-client-boundary';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AppLayoutClientBoundary>{children}</AppLayoutClientBoundary>
      </main>
      <Footer />
    </div>
  );
}
