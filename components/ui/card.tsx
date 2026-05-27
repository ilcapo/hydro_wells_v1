import * as React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-white/15 bg-slate-950/75 p-8 shadow-panel transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(0,194,255,0.15)] hover:bg-slate-900/70',
        className
      )}
      {...props}
    />
  );
}
