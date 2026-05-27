'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

interface AccordionProps {
  title: string;
  content: string;
}

export function Accordion({ title, content }: AccordionProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-950/80 transition-all duration-300 hover:bg-white/5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-white">{title}</span>
        <ChevronRight
          className={cn(
            'h-5 w-5 text-sky-200/80 transition-transform duration-300',
            open && 'rotate-90 text-primary'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 text-slate-300 leading-relaxed">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
