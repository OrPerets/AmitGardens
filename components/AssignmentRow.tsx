'use client';

import { FieldErrors, UseFormRegister, Control, Controller } from 'react-hook-form';
import MonthPicker from './MonthPicker';
import { z } from 'zod';
import { AssignmentRowSchema } from '@/lib/validators';
import { useState } from 'react';

export type AssignmentFormRow = z.infer<typeof AssignmentRowSchema> & {
  id?: string;
};

type FormType = { rows: AssignmentFormRow[] };

interface Props {
  index: number;
  control: Control<FormType>;
  register: UseFormRegister<FormType>;
  errors: FieldErrors<FormType>;
  onDelete: () => void;
  disabled?: boolean;
  month: string;
  /** Optional mobile-first card layout instead of table row */
  cardLayout?: boolean;
}

export default function AssignmentRow({
  index,
  control,
  register,
  errors,
  onDelete,
  disabled = false,
  month,
  cardLayout = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasErrors = !!(
    errors.rows?.[index]?.date ||
    errors.rows?.[index]?.address ||
    errors.rows?.[index]?.notes
  );

  if (cardLayout) {
    return (
      <div className={`
        card animate-fade-in transition-all duration-200
        ${hasErrors ? 'border-destructive/50 bg-destructive/5' : ''}
        ${disabled ? 'opacity-60' : 'hover:shadow-md'}
      `}>
        <div className="card-body space-y-4">
          {/* Header with row number and delete */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground text-hebrew">
              שיבוץ מספר {index + 1}
            </h4>
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="btn btn-ghost btn-sm p-2 text-destructive hover:bg-destructive/10"
              aria-label={`מחק שיבוץ ${index + 1}`}
            >
              🗑️
            </button>
          </div>

          {/* Date field */}
          <div className="space-y-2">
            <label className="label text-hebrew" htmlFor={`date-${index}`}>
              תאריך <span className="text-destructive">*</span>
            </label>
            <Controller
              control={control}
              name={`rows.${index}.date` as const}
              render={({ field }) => (
                <MonthPicker
                  month={month}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  error={!!errors.rows?.[index]?.date}
                  placeholder="בחר תאריך"
                />
              )}
            />
            {errors.rows?.[index]?.date && (
              <p className="error-text animate-slide-down">
                {errors.rows[index]?.date?.message as string}
              </p>
            )}
          </div>

          {/* Address field */}
          <div className="space-y-2">
            <label className="label text-hebrew" htmlFor={`address-${index}`}>
              כתובת <span className="text-destructive">*</span>
            </label>
            <input
              id={`address-${index}`}
              type="text"
              className={`input text-hebrew ${errors.rows?.[index]?.address ? 'border-destructive' : ''}`}
              placeholder="הכנס כתובת..."
              disabled={disabled}
              {...register(`rows.${index}.address` as const)}
            />
            {errors.rows?.[index]?.address && (
              <p className="error-text animate-slide-down">
                {errors.rows[index]?.address?.message as string}
              </p>
            )}
          </div>

          {/* Notes field - collapsible on mobile */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 label cursor-pointer hover:text-foreground transition-colors text-hebrew"
            >
              הערות
              <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {isExpanded && (
              <textarea
                id={`notes-${index}`}
                className="input h-20 resize-none animate-slide-down text-hebrew"
                placeholder="הערות נוספות..."
                disabled={disabled}
                {...register(`rows.${index}.notes` as const)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Traditional table row layout for desktop
  return (
    <tr className={`
      transition-colors duration-200
      ${hasErrors ? 'bg-destructive/5' : 'hover:bg-accent/50'}
      ${disabled ? 'opacity-60' : ''}
    `}>
      <td className="p-3 align-top border-t">
        <Controller
          control={control}
          name={`rows.${index}.date` as const}
          render={({ field }) => (
            <MonthPicker
              month={month}
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              error={!!errors.rows?.[index]?.date}
            />
          )}
        />
        {errors.rows?.[index]?.date && (
          <p className="error-text mt-1 animate-slide-down">
            {errors.rows[index]?.date?.message as string}
          </p>
        )}
      </td>
      
      <td className="p-3 align-top border-t">
        <input
          type="text"
          className={`input text-hebrew ${errors.rows?.[index]?.address ? 'border-destructive' : ''}`}
          placeholder="כתובת..."
          disabled={disabled}
          {...register(`rows.${index}.address` as const)}
        />
        {errors.rows?.[index]?.address && (
          <p className="error-text mt-1 animate-slide-down">
            {errors.rows[index]?.address?.message as string}
          </p>
        )}
      </td>
      
      <td className="p-3 align-top border-t">
        <input
          type="text"
          className="input text-hebrew"
          placeholder="הערות..."
          disabled={disabled}
          {...register(`rows.${index}.notes` as const)}
        />
      </td>
      
      <td className="p-3 align-top border-t text-center">
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="btn btn-destructive btn-sm p-2 hover:scale-105 active:scale-95 transition-transform"
          aria-label={`מחק שורה ${index + 1}`}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}
