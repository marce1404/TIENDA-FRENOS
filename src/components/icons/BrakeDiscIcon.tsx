import * as React from 'react';
import { cn } from '@/lib/utils';

export const BrakeDiscIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
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
    <title>Disco de Freno</title>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="15" x2="12" y2="17" />
    <line x1="12" y1="7" x2="12" y2="9" />
    <line x1="15" y1="12" x2="17" y2="12" />
    <line x1="7" y1="12" x2="9" y2="12" />
  </svg>
);
