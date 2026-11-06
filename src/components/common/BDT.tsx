import React from 'react';
import { cn } from '@/lib/utils';

interface BDTProps {
  amount: number | string;
  className?: string;
  symbolClassName?: string;
  showPlus?: boolean;
  suffix?: string;
}

/**
 * Universal BDT (৳) Currency Component
 * Guarantees that the Bangladeshi Taka symbol (৳ U+09F3) is rendered
 * using a dedicated Unicode-safe Bengali font stack with no missing glyph boxes [?].
 */
export function BDT({
  amount,
  className = '',
  symbolClassName = '',
  showPlus = false,
  suffix = '',
}: BDTProps) {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const isPositive = numericAmount > 0;
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.abs(numericAmount));

  return (
    <span className={cn('inline-flex items-baseline whitespace-nowrap', className)}>
      {showPlus && isPositive && <span>+</span>}
      {numericAmount < 0 && <span>-</span>}
      <span
        className={cn(
          'bdt-glyph font-sans font-semibold mr-0.5 select-none inline-block',
          symbolClassName
        )}
        style={{
          fontFamily: 'var(--font-hind-siliguri), "Hind Siliguri", "Segoe UI", system-ui, sans-serif',
        }}
      >
        ৳
      </span>
      <span className="font-mono">{formatted}{suffix}</span>
    </span>
  );
}

export default BDT;
