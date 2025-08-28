'use client';

import { useState } from 'react';

export interface BulkRow {
  date: string;
  address: string;
  notes?: string;
}

export default function BulkPasteDialog({
  onConfirm,
}: {
  onConfirm: (rows: BulkRow[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const parse = () => {
    const rows: BulkRow[] = [];
    text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [date, address, notes] = line.split('|').map((s) => s.trim());
        if (date && address) {
          rows.push({ date, address, notes });
        }
      });
    if (rows.length) {
      onConfirm(rows);
    }
    setOpen(false);
    setText('');
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary h-9"
      >
        הדבקה מרשימה
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="card w-full max-w-md">
        <div className="card-header">הדבקה מרשימה</div>
        <div className="card-body space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-40 input"
            placeholder="תאריך|כתובת|הערות (שורה לכל רשומה)"
            dir="rtl"
          />
          <div className="flex gap-2 justify-start">
            <button
              type="button"
              className="btn btn-primary"
              onClick={parse}
              aria-label="אישור הדבקה"
            >
              אישור
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
    </div>
  );
}
