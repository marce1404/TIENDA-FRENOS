
'use client';

import { WhatsAppButton } from '@/components/WhatsAppButton';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import type { getEnvSettings } from '@/lib/env';

type Settings = Awaited<ReturnType<typeof getEnvSettings>>;

export function AppLayoutClientBoundary({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: Settings
}) {
  return (
    <>
      {children}
      <WhatsAppButton initialNumber={settings.WHATSAPP_NUMBER} />
      <LiveChatWidget />
    </>
  );
}
