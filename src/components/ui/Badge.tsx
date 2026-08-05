import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  success: {
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)',
  },
  warning: {
    backgroundColor: 'var(--warning-bg)',
    color: 'var(--warning)',
    border: '1px solid color-mix(in srgb, var(--warning) 20%, transparent)',
  },
  danger: {
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)',
  },
  info: {
    backgroundColor: 'var(--info-bg)',
    color: 'var(--info)',
    border: '1px solid color-mix(in srgb, var(--info) 20%, transparent)',
  },
  neutral: {
    backgroundColor: 'var(--surface-1)',
    color: 'var(--ink-2)',
    border: '1px solid var(--border-subtle)',
  },
  brand: {
    backgroundColor: 'var(--brand-muted)',
    color: 'var(--brand)',
    border: '1px solid color-mix(in srgb, var(--brand) 20%, transparent)',
  },
};

const dotColorVar: Record<BadgeVariant, string> = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
  neutral: 'var(--ink-2)',
  brand: 'var(--brand)',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  dot = false,
  className,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className,
      )}
      style={variantStyles[variant]}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: dotColorVar[variant] }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
