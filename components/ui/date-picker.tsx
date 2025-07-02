// components/ui/date-picker.tsx
'use client';

import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from './input';
import DatePicker from 'react-datepicker';

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
}

export function DatePickerInput({
  date,
  onSelect,
  className,
  placeholder = 'Select date',
}: DatePickerProps) {
  return (
    <DatePicker
      selected={date}
      onChange={onSelect}
      customInput={<Input className={className} />}
      placeholderText={placeholder}
      dateFormat="yyyy-MM-dd"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      className="w-full"
    />
  );
}