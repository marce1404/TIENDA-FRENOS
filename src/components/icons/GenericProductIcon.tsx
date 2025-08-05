
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Wrench } from 'lucide-react';

export const GenericProductIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <Wrench className={cn(className)} {...props} />
);
