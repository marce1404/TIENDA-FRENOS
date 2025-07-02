
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <title>todofrenos.cl Logo Freno de Disco Estilizado</title>
      {/* Brake disc */}
      <path d="M21 12a9 9 0 1 1-6.22-8.66" />
      {/* Brake pad/caliper */}
      <path d="M15.78 3.34 18 6l-2.22 2.66" />
      {/* Inner circle for hub */}
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};
