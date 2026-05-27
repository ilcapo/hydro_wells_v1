import * as React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em]',
        variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-slate-900/80 text-slate-100',
        className,
      )}
      {...props}
    />
  );
}
