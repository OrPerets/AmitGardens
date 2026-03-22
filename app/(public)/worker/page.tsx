'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addMonths, format } from 'date-fns';
import MonthGrid from '@/components/MonthGrid';
import EnableNotifications from '@/components/EnableNotifications';

type Status = 'not_started' | 'in_progress' | 'submitted';

function WorkerDashboardContent() {
  const search = useSearchParams();
  const g = search.get('g') || '';
  const t = search.get('t') || '';
  const month = format(addMonths(new Date(), 1), 'yyyy-MM');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('not_started');

  useEffect(() => {
    async function load() {
      if (!g || !t) return;
      const res = await fetch(`/api/link/resolve?plan=${month}&g=${g}&t=${t}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.gardener?.name || '');
        if (data.submission) {
          setStatus('submitted');
          return;
        }
        const rowsRes = await fetch(
          `/api/assignments?plan=${month}&g=${g}&t=${t}`,
        );
        if (rowsRes.ok) {
          const rows = await rowsRes.json();
          setStatus(
            rows.assignments.length > 0 ? 'in_progress' : 'not_started',
          );
        }
      }
    }
    load();
  }, [g, t, month]);

  const statusText: Record<Status, string> = {
    not_started: 'לא התחלת',
    in_progress: 'בתהליך',
    submitted: 'הוגש',
  };

  const planLink = `/plan/${month}?g=${encodeURIComponent(g)}&t=${encodeURIComponent(t)}`;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">{`שלום${name ? ` ${name}` : ''}`}</h1>
      <EnableNotifications />
      <div className="card">
        <div className="card-body text-center space-y-2">
          <p>{`סטטוס לחודש ${month}: ${statusText[status]}`}</p>
          <a href={planLink} className="btn btn-primary w-full">
            ערוך את התוכנית
          </a>
        </div>
      </div>
      <MonthGrid month={month} entries={{}} onChange={() => {}} readOnly={true} />
    </div>
  );
}

export default function WorkerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">טוען…</div>}>
      <WorkerDashboardContent />
    </Suspense>
  );
}
