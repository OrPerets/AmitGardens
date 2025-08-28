'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zodResolver';
import { AssignmentRowSchema } from '@/lib/validators';
import AssignmentRow, { AssignmentFormRow } from '@/components/AssignmentRow';
import BulkPasteDialog, { BulkRow } from '@/components/BulkPasteDialog';
import { useToast } from '@/components/ui/toaster';

const RowSchema = AssignmentRowSchema.extend({ id: z.string().optional() });
const FormSchema = z.object({ rows: z.array(RowSchema) });

type FormData = z.infer<typeof FormSchema>;

interface Props {
  plan: string; // YYYY-MM
  g: string;
  t: string;
}

export default function PlanClient({ plan, g, t }: Props) {
  const toast = useToast();
  const [info, setInfo] = useState<{
    gardener: string;
    locked: boolean;
    submitted: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { rows: [] },
  });
  const { control, register, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

  const readOnly = info?.locked || info?.submitted;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/link/resolve?plan=${plan}&g=${g}&t=${t}`);
      if (!res.ok) {
        setError('קישור לא תקין');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setInfo({
        gardener: data.gardener.name,
        locked: data.plan.locked,
        submitted: !!data.submission,
      });
      const resRows = await fetch(`/api/assignments?plan=${plan}&g=${g}&t=${t}`);
      if (resRows.ok) {
        type AssignmentRowDto = {
          id: string;
          date: string;
          address: string;
          notes: string | null;
        };
        const rows = (await resRows.json()) as { assignments: AssignmentRowDto[] };
        reset({
          rows: rows.assignments.map((r) => ({
            id: r.id,
            date: r.date.slice(0, 10),
            address: r.address,
            notes: r.notes || '',
          })),
        });
      }
      setLoading(false);
    }
    load();
  }, [plan, g, t, reset]);

  const refreshRows = async () => {
    const resRows = await fetch(`/api/assignments?plan=${plan}&g=${g}&t=${t}`);
    if (resRows.ok) {
      type AssignmentRowDto = {
        id: string;
        date: string;
        address: string;
        notes: string | null;
      };
      const rows = (await resRows.json()) as { assignments: AssignmentRowDto[] };
      reset({
        rows: rows.assignments.map((r) => ({
          id: r.id,
          date: r.date.slice(0, 10),
          address: r.address,
          notes: r.notes || '',
        })),
      });
    }
  };

  const onSave = handleSubmit(async (data) => {
    const body = {
      plan,
      g,
      t,
      rows: data.rows.map((r) => ({
        date: new Date(r.date).toISOString(),
        address: r.address,
        notes: r.notes,
      })),
    };
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast({ title: 'נשמר בהצלחה' });
      await refreshRows();
    } else {
      toast({ title: 'שגיאה בשמירה' });
    }
  });

  const onDelete = async (idx: number, id?: string) => {
    remove(idx);
    if (id) {
      await fetch(`/api/assignments/${id}?plan=${plan}&g=${g}&t=${t}`, {
        method: 'DELETE',
      });
      await refreshRows();
    }
  };

  const onPaste = (rows: BulkRow[]) => {
    rows.forEach((r) =>
      append({ date: r.date, address: r.address, notes: r.notes || '' }),
    );
  };

  const submitFinal = async () => {
    const res = await fetch('/api/submission/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, g, t }),
    });
    if (res.ok) {
      toast({ title: 'הוגש' });
      setInfo((prev) => (prev ? { ...prev, submitted: true } : prev));
    } else {
      toast({ title: 'שגיאה בשליחה' });
    }
  };

  if (loading)
    return (
      <div className="p-4 space-y-4">
        <div className="skeleton h-6 w-1/2 mx-auto" />
        <div className="skeleton h-9 w-full" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  if (error) return <div className="p-4 empty-state">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      {info && (
        <h1 className="text-2xl font-bold text-center">
          {`שיבוץ לחודש ${plan} – ${info.gardener}`}
        </h1>
      )}
      <form onSubmit={onSave} className="space-y-3">
        <div className="overflow-x-auto">
          <table className="table table-zebra table-hover">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>כתובת</th>
                <th>הערות</th>
                <th aria-label="פעולות" />
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">אין שורות עדיין</td>
                </tr>
              ) : (
                fields.map((field, idx) => (
                  <AssignmentRow
                    key={field.id}
                    index={idx}
                    control={control}
                    register={register}
                    errors={form.formState.errors}
                    onDelete={() => onDelete(idx, (field as AssignmentFormRow).id)}
                    disabled={readOnly}
                    month={plan}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => append({ date: '', address: '', notes: '' })}
              className="btn btn-secondary"
            >
              הוסף שורה
            </button>
            <BulkPasteDialog onConfirm={onPaste} />
            <button type="submit" className="btn btn-primary">
              שמור
            </button>
            <button
              type="button"
              onClick={submitFinal}
              className="btn btn-ghost"
            >
              שליחה סופית
            </button>
          </div>
        )}
      </form>
      {readOnly && <p className="text-center badge">הטופס נעול</p>}
    </div>
  );
}
