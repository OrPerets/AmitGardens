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
        className="px-2 py-1 border"
      >
        הדבקה מרשימה
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-4 space-y-2 max-w-md w-full">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 border p-2"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-2 py-1 border"
            onClick={() => setOpen(false)}
          >
            בטל
          </button>
          <button type="button" className="px-2 py-1 border" onClick={parse}>
            אישור
          </button>
        </div>
      </div>
    </div>
  );
}
