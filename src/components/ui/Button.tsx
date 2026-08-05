'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  style,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]';

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variantStyles: React.CSSProperties = (() => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--brand)',
          color: '#ffffff',
          boxShadow: '0 4px 12px var(--brand-ring)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--ink-1)',
          color: '#ffffff',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: '1.5px solid var(--border-strong)',
          color: 'var(--ink-2)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--ink-2)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger)',
          color: '#ffffff',
        };
      default:
        return {};
    }
  })();

  const variantHoverClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'hover:opacity-90',
    secondary: 'hover:opacity-90',
    outline: 'hover:bg-[var(--surface-1)]',
    ghost: 'hover:bg-[var(--surface-1)]',
    danger: 'hover:opacity-90',
  };

  const disabledClasses = isDisabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantHoverClasses[variant],
        disabledClasses,
        widthClass,
        className,
      )}
      style={{ ...variantStyles, ...style }}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
