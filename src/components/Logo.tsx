
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
      <title>aquifrenos.cl Logo</title>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 18a6 6 0 0 0 0-12v12Z" fill="currentColor" />
      <path d="M12 18a6 6 0 0 1 0-12" />
    </svg>
  );
};
