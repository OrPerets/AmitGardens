'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import MonthGrid from '@/components/MonthGrid';
import type { DayEntry } from '@/components/DayCell';
import { useToast } from '@/components/ui/toaster';

type AssignmentDto = {
  date: string;
  address: string;
  notes: string | null;
};

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
  const [entries, setEntries] = useState<Record<string, DayEntry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState(false);

  const readOnly = info?.locked || info?.submitted;
  const storageKey = `draft:${plan}:${g}`;

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
      const rowsRes = await fetch(`/api/assignments?plan=${plan}&g=${g}&t=${t}`);
      if (rowsRes.ok) {
        const { assignments } = await rowsRes.json();
        const map: Record<string, DayEntry> = {};
        (assignments as AssignmentDto[]).forEach((r) => {
          map[r.date.slice(0, 10)] = {
            address: r.address,
            notes: r.notes || '',
          };
        });
        setEntries(map);
      }
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Record<string, DayEntry>;
          setEntries((prev) => ({ ...prev, ...parsed }));
        } catch {
          /* ignore */
        }
      }
      setLoading(false);
    }
    load();
  }, [plan, g, t, storageKey]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }
  }, [entries, storageKey]);

  const onChange = (
    date: string,
    value: DayEntry | null,
    bulk?: 'weekdays' | 'weekends' | 'all',
  ) => {
    setEntries((prev) => {
      const next = { ...prev };
      if (value) next[date] = value;
      else delete next[date];
      if (value && bulk) {
        const start = dayjs(`${plan}-01`);
        const daysInMonth = start.daysInMonth();
        for (let d = 1; d <= daysInMonth; d++) {
          const current = start.date(d);
          const dow = current.day();
          const ds = current.format('YYYY-MM-DD');
          if (ds === date) continue;
          if (
            bulk === 'all' ||
            (bulk === 'weekdays' && dow >= 0 && dow <= 4) ||
            (bulk === 'weekends' && dow >= 5)
          ) {
            next[ds] = value;
          }
        }
      }
      return next;
    });
  };

  const onSave = async () => {
    const rows = Object.entries(entries).map(([date, v]) => ({
      date: new Date(date).toISOString(),
      address: v.address,
      notes: v.notes,
    }));
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, g, t, rows }),
    });
    if (res.ok) {
      toast({ title: 'נשמר בהצלחה' });
    } else {
      toast({ title: 'שגיאה בשמירה' });
    }
  };

  const submitFinal = async () => {
    const res = await fetch('/api/submission/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, g, t }),
    });
    if (res.ok) {
      toast({ title: 'הוגש' });
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      setInfo((prev) => (prev ? { ...prev, submitted: true } : prev));
      setReview(false);
    } else {
      toast({ title: 'שגיאה בשליחה' });
    }
  };

  const filled = Object.keys(entries).length;
  const required = 22;

  if (loading)
    return (
      <div className="p-4 space-y-4">
        <div className="skeleton h-6 w-1/2 mx-auto" />
        <div className="skeleton h-60 w-full" />
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
      <div className="space-y-2">
        <progress className="progress w-full" value={filled} max={required} />
        <p className="text-center text-sm">{`${filled}/${required} ימים מלאים`}</p>
      </div>
      <MonthGrid month={plan} entries={entries} onChange={readOnly ? () => {} : onChange} />
      {!readOnly && (
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={onSave}>
            שמור
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReview(true)}
          >
            שליחה סופית
          </button>
        </div>
      )}
      {readOnly && <p className="text-center badge">הטופס נעול</p>}
      {review && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="card w-full max-w-md">
            <div className="card-header">אישור סופי</div>
            <div className="card-body space-y-3 max-h-[60vh] overflow-y-auto">
              <ul className="list-disc list-inside text-sm" dir="rtl">
                {Object.entries(entries).map(([d, v]) => (
                  <li key={d}>{`${d}: ${v.address}`}</li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={submitFinal}
                >
                  שלח
                </button>
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setReview(false)}
                >
                  בטל
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

