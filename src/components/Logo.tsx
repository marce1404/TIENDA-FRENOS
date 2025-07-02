
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
      <title>todofrenos.cl Logo Personalizado</title>
      <path d="M7 15l5-10 5 10" />
      <path d="M3.5 15h17" />
      <path d="M12 21a9 9 0 000-18 9 9 0 000 18z" />
    </svg>
  );
};
