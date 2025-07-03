import * as React from 'react';
import { cn } from '@/lib/utils';

export const BrakePadIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(className)}
    {...props}
  >
    <title>Pastilla de Freno</title>
    <path d="M18 18.35V5.65a3 3 0 0 0-2.09-2.86L8 2a3 3 0 0 0-2.82 1.2L3.13 6.48a3 3 0 0 0 0 3.04L5.18 12.8a3 3 0 0 0 2.82 1.7h7.14" />
    <path d="M6 13.2V21a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7.8" />
  </svg>
);
