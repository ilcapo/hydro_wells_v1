import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost';
  asChild?: boolean;
}

export function Button({ className, variant = 'default', asChild, ...props }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
    variant === 'default' && 'bg-gradient-to-r from-primary to-sky-500 text-slate-950 shadow-glow hover:brightness-105',
    variant === 'secondary' && 'bg-slate-900/90 text-white border border-white/10 hover:bg-slate-800/95',
    variant === 'ghost' && 'bg-transparent text-slate-100 hover:text-primary',
    className,
  );

  if (asChild) {
    const { children, ...rest } = props;
    return (
      <button {...rest} className={classes}>
        {children}
      </button>
    );
  }

  return <button className={classes} {...props} />;
}
