'use client';

import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import AdminGuard from '@/components/AdminGuard';

interface Assignment {
  date: string;
  address: string;
  notes: string;
}

export default function GardenerReportPage({
  params,
}: {
  params: { yyyymm: string; gardenerId: string };
}) {
  const yyyymmParam = params.yyyymm;
  const plan = yyyymmParam.includes('-')
    ? yyyymmParam
    : `${yyyymmParam.slice(0, 4)}-${yyyymmParam.slice(4, 6)}`;
  const gardenerId = params.gardenerId;
  const [title, setTitle] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch(`/api/admin/report?plan=${plan}&g=${gardenerId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(`${data.gardener.name} – ${plan}`);
        setAssignments(data.assignments);
        // auto print shortly after render
        setTimeout(() => window.print(), 200);
      }
      setLoading(false);
    }
    load();
  }, [plan, gardenerId]);

  const days = useMemo(() => {
    const month = Number(plan.slice(5, 7));
    const year = Number(plan.slice(0, 4));
    const first = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const count = first.daysInMonth();
    const byDate: Record<string, Assignment[]> = {};
    for (const a of assignments) {
      (byDate[a.date] ||= []).push(a);
    }
    return Array.from({ length: count }, (_, i) => {
      const d = first.add(i, 'day');
      const key = d.format('YYYY-MM-DD');
      return { key, d, items: byDate[key] || [] };
    });
  }, [assignments, plan]);

  if (loading) return <div className="p-6 text-center">טוען...</div>;

  return (
    <AdminGuard>
      <div className="p-6 space-y-4 print:p-0">
        <h1 className="text-2xl font-bold text-center print:text-xl">דו"ח חודשי – {title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3">
          {days.map(({ key, d, items }) => (
            <div key={key} className="border rounded p-2 min-h-[90px] break-inside-avoid">
              <div className="text-sm font-semibold mb-1">{d.format('DD/MM/YYYY')}</div>
              {items.length === 0 ? (
                <div className="text-xs text-muted-foreground">—</div>
              ) : (
                <ul className="space-y-1">
                  {items.map((a, idx) => (
                    <li key={idx} className="text-sm">
                      <div>{a.address}</div>
                      {a.notes && <div className="text-xs text-muted-foreground">{a.notes}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}


