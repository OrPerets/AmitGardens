'use client';

import { FieldErrors, UseFormRegister, Control, Controller } from 'react-hook-form';
import MonthPicker from './MonthPicker';
import { z } from 'zod';
import { AssignmentRowSchema } from '@/lib/validators';

const RowSchema = AssignmentRowSchema.extend({ id: z.string().optional() });
export type AssignmentFormRow = z.infer<typeof RowSchema>;

type FormType = { rows: AssignmentFormRow[] };

interface Props {
  index: number;
  control: Control<FormType>;
  register: UseFormRegister<FormType>;
  errors: FieldErrors<FormType>;
  onDelete: () => void;
  disabled?: boolean;
  month: string;
}

export default function AssignmentRow({
  index,
  control,
  register,
  errors,
  onDelete,
  disabled,
  month,
}: Props) {
  return (
    <tr>
      <td className="border p-1">
        <Controller
          control={control}
          name={`rows.${index}.date` as const}
          render={({ field }) => (
            <MonthPicker
              month={month}
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
            />
          )}
        />
        {errors.rows?.[index]?.date && (
          <p className="text-red-600 text-xs">
            {(errors.rows[index]?.date as any)?.message}
          </p>
        )}
      </td>
      <td className="border p-1">
        <input
          type="text"
          className="border p-1 w-full"
          disabled={disabled}
          {...register(`rows.${index}.address` as const)}
        />
        {errors.rows?.[index]?.address && (
          <p className="text-red-600 text-xs">
            {(errors.rows[index]?.address as any)?.message}
          </p>
        )}
      </td>
      <td className="border p-1">
        <input
          type="text"
          className="border p-1 w-full"
          disabled={disabled}
          {...register(`rows.${index}.notes` as const)}
        />
      </td>
      <td className="border p-1 text-center">
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="text-red-600"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
