import * as React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { }

export function Label({ className, ...props }: LabelProps) {
  return <label className={className ? className : 'text-sm font-medium text-slate-200'} {...props} />;
}
