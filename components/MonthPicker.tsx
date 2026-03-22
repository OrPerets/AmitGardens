'use client';

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

interface Props {
  value: string;
  onChange: (v: string) => void;
  month: string; // YYYY-MM
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
}

export default function MonthPicker({ 
  value, 
  onChange, 
  month, 
  disabled = false,
  placeholder,
  error = false 
}: Props) {
  const [year, m] = month.split('-').map(Number);
  
  const dateRange = useMemo(() => {
    const first = new Date(year, m - 1, 1).toISOString().slice(0, 10);
    const last = new Date(year, m, 0).toISOString().slice(0, 10);
    return { first, last };
  }, [year, m]);
  
  const displayValue = useMemo(() => {
    if (!value) return '';
    try {
      return format(parseISO(value), 'dd/MM/yyyy', { locale: he });
    } catch {
      return value;
    }
  }, [value]);
  
  const monthName = useMemo(() => {
    try {
      const monthDate = new Date(year, m - 1, 1);
      return format(monthDate, 'MMMM yyyy', { locale: he });
    } catch {
      return month;
    }
  }, [year, m, month]);

  return (
    <div className="relative">
      <input
        type="date"
        min={dateRange.first}
        max={dateRange.last}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          input transition-all duration-200 text-hebrew
          ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        `}
        placeholder={placeholder}
        aria-label={`בחר תאריך בחודש ${monthName}`}
        title={`בחר תאריך בחודש ${monthName}`}
      />
      
      {/* Custom overlay for better mobile experience */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4">
        <span className={`text-sm ${!value ? 'text-muted-foreground' : 'text-foreground'} text-hebrew`}>
          {displayValue || placeholder || `בחר תאריך`}
        </span>
        <span className="text-muted-foreground">
          📅
        </span>
      </div>
      
      {/* Helper text */}
      <div className="mt-1 text-xs text-muted-foreground text-hebrew">
        {monthName}
      </div>
    </div>
  );
}
