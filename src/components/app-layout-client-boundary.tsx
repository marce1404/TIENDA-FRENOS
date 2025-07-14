
'use client';

import { WhatsAppButton } from '@/components/WhatsAppButton';
import { LiveChatWidget } from '@/components/LiveChatWidget';

export function AppLayoutClientBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <WhatsAppButton />
      <LiveChatWidget />
    </>
  );
}
