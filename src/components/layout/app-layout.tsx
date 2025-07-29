
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AppLayoutClientBoundary } from '@/components/app-layout-client-boundary';
import { getEnvSettings } from '@/lib/env';

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const settings = await getEnvSettings();
  
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AppLayoutClientBoundary settings={settings}>{children}</AppLayoutClientBoundary>
      </main>
      <Footer />
    </div>
  );
}
