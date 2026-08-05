'use client';
import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'dark';
  hover?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = false,
  noPadding = false,
  children,
  className,
  style,
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const paddingClass = noPadding ? '' : 'p-5';

  const variantStyles: React.CSSProperties = (() => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'elevated':
        return {
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        };
      case 'glass':
        return {
          backgroundColor: 'color-mix(in srgb, var(--surface-0) 80%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'dark':
        return {
          backgroundColor: 'var(--ink-1)',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: 'var(--shadow-md)',
        };
      default:
        return {};
    }
  })();

  const hoverClasses = hover
    ? 'hover:shadow-md cursor-pointer hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={clsx(baseClasses, paddingClass, hoverClasses, className)}
      style={{ ...variantStyles, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
