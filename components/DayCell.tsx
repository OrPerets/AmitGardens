'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { motion as motionTokens } from '@/lib/tokens';
import dayjs from 'dayjs';

export interface DayEntry {
  address: string;
  notes: string;
}

interface DayCellProps {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  value?: DayEntry;
  onChange: (
    date: string,
    value: DayEntry | null,
    bulk?: 'weekdays' | 'weekends' | 'all',
  ) => void;
}

const DayCell: FC<DayCellProps> = ({ date, value, onChange }) => {
  const day = Number(date.slice(-2));
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setAddress(value?.address ?? '');
    setNotes(value?.notes ?? '');
  }, [value, open]);

  const save = (bulk?: 'weekdays' | 'weekends' | 'all') => {
    const val = address || notes ? { address, notes } : null;
    onChange(date, val, bulk);
    setOpen(false);
  };

  const clear = () => {
    setAddress('');
    setNotes('');
    onChange(date, null);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={`border rounded-sm flex items-center justify-center aspect-square text-sm w-full h-full ${value ? 'bg-primary/20' : ''}`}
        onClick={() => setOpen(true)}
      >
        {day}
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center animate-fade-in"
          style={{ animationDuration: motionTokens.normal }}
        >
          <div
            className="bg-white w-full max-w-md p-4 rounded-t-lg space-y-3 animate-slide-up"
            style={{ animationDuration: motionTokens.normal }}
          >
            <h2 className="text-center font-medium">
              {dayjs(date).format('DD/MM')}
            </h2>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="כתובת"
              className="input w-full"
            />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות"
              className="input w-full"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => save()}
              >
                שמור
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => save('weekdays')}
              >
                לימי השבוע
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => save('weekends')}
              >
                לסופש
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => save('all')}
              >
                לכל החודש
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={clear}
              >
                מחק
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
              >
                בטל
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DayCell;

