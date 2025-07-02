// components/ui/date-input.tsx
'use client';

import React from 'react';
import { Input } from './input';

interface DateInputProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function DateInput({
  value,
  onChange,
  className,
  disabled = false,
}: DateInputProps) {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      disabled={disabled}
    />
  );
}