'use client';

import { FieldErrors, UseFormRegister, Control, Controller } from 'react-hook-form';
import MonthPicker from './MonthPicker';
import { z } from 'zod';
import { AssignmentRowSchema } from '@/lib/validators';

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
    <tr className="hover:bg-accent/50">
      <td className="p-2 align-top border-t">
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
          <p className="error-text">
            {errors.rows[index]?.date?.message as string}
          </p>
        )}
      </td>
      <td className="p-2 align-top border-t">
        <input
          type="text"
          className="input"
          disabled={disabled}
          {...register(`rows.${index}.address` as const)}
        />
        {errors.rows?.[index]?.address && (
          <p className="error-text">
            {errors.rows[index]?.address?.message as string}
          </p>
        )}
      </td>
      <td className="p-2 align-top border-t">
        <input
          type="text"
          className="input"
          disabled={disabled}
          {...register(`rows.${index}.notes` as const)}
        />
      </td>
      <td className="p-2 align-top border-t text-center">
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="btn btn-destructive h-8 px-2"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
