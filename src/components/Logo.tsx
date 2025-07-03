
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
      <title>La Casa del Freno Logo</title>
      {/* House shape */}
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      {/* Brake disc inside */}
      <circle cx="12" cy="15" r="4" />
      <circle cx="12" cy="15" r="1" />
    </svg>
  );
};
