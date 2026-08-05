'use client';
import React, { useId } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      className,
      id: providedId,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const [isFocused, setIsFocused] = React.useState(false);

    const hasError = Boolean(error);

    const inputBorderColor = hasError
      ? 'var(--danger)'
      : isFocused
        ? 'var(--brand)'
        : 'var(--border-strong)';

    const inputBoxShadow = isFocused
      ? hasError
        ? '0 0 0 3px color-mix(in srgb, var(--danger) 20%, transparent)'
        : '0 0 0 3px var(--brand-ring)'
      : 'none';

    const inputStyles: React.CSSProperties = {
      height: '44px',
      border: `1.5px solid ${inputBorderColor}`,
      backgroundColor: 'var(--surface-0)',
      color: 'var(--ink-1)',
      borderRadius: '12px',
      paddingLeft: leftIcon ? '2.5rem' : '0.875rem',
      paddingRight: rightElement ? '2.75rem' : '0.875rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      outline: 'none',
      boxShadow: inputBoxShadow,
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      width: '100%',
      ...style,
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium"
            style={{ color: 'var(--ink-1)' }}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="pointer-events-none absolute left-3 flex shrink-0 items-center"
              style={{ color: 'var(--ink-3)' }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={clsx(
              'placeholder:text-[var(--ink-3)] disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            style={inputStyles}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-3 flex shrink-0 items-center">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${id}-error`}
            className="text-xs font-medium"
            style={{ color: 'var(--danger)' }}
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={`${id}-hint`}
            className="text-xs"
            style={{ color: 'var(--ink-3)' }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
