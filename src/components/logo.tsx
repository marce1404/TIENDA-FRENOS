
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className={cn('h-7 w-7', className)}
      {...props}
    >
      <title>SerAPP Logo</title>
      <rect x="4" y="2" width="4" height="12" />
      <rect x="10" y="2" width="12" height="4" />
      <rect x="14" y="6" width="4" height="8" />
      <rect x="24" y="2" width="4" height="12" />
      <rect x="0" y="18" width="12" height="4" />
      <rect x="4" y="22" width="4" height="10" />
      <rect x="14" y="16" width="4" height="14" />
      <rect x="20" y="18" width="12" height="4" />
      <rect x="24" y="22" width="4" height="10" />
    </svg>
  );
};
