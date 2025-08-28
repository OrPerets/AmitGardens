'use client';

import { useEffect, useState } from 'react';
import StatsCards from '@/components/StatsCards';
import { useToast } from '@/components/ui/toaster';

interface Stats {
  gardeners: number;
  submitted: number;
  assignments: number;
  coverageDays: number;
}

interface Row {
  date: string;
  gardener: string;
  address: string;
  notes: string;
}

interface LinkItem {
  gardener_id: string;
  url: string;
  token: string;
}

export default function DashboardClient({ plan }: { plan: string }) {
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [locked, setLocked] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [filterGardener, setFilterGardener] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    const res = await fetch(`/api/admin/overview?plan=${plan}`);
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
      setRows(data.rows);
      setLocked(!!data.locked);
    }
  };

  useEffect(() => {
    load();
  }, [plan]);

  const createLinks = async () => {
    const res = await fetch('/api/admin/links/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      const data = await res.json();
      setLinks(data.links || []);
      toast({ title: 'קישורים נוצרו' });
    } else {
      toast({ title: 'שגיאה ביצירת קישורים' });
    }
  };

  const toggleLock = async () => {
    const url = locked ? '/api/admin/unlock' : '/api/admin/lock';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      setLocked(!locked);
      toast({ title: locked ? 'נפתח' : 'ננעל' });
    } else {
      toast({ title: 'שגיאה' });
    }
  };

  const sendReminders = async () => {
    const res = await fetch('/api/admin/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      toast({ title: 'תזכורות נשלחו' });
    } else {
      toast({ title: 'שגיאה בשליחת תזכורות' });
    }
  };

  const gardenerOptions = Array.from(new Set(rows.map((r) => r.gardener))).filter(
    Boolean,
  );
  const filtered = rows.filter((r) => {
    if (filterGardener && r.gardener !== filterGardener) return false;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-center">לוח מנהל {plan}</h1>
      {stats && <StatsCards stats={stats} />}
      <div className="flex flex-wrap gap-2">
        <button onClick={createLinks} className="border px-2 py-1">
          צור קישורים
        </button>
        <button onClick={toggleLock} className="border px-2 py-1">
          {locked ? 'פתח' : 'נעל'}
        </button>
        <button onClick={sendReminders} className="border px-2 py-1">
          שלח תזכורות
        </button>
        <a
          href={`/api/admin/overview?plan=${plan}&format=csv`}
          className="border px-2 py-1"
        >
          יצוא CSV
        </a>
      </div>
      {links.length > 0 && (
        <div className="border p-2 rounded-md">
          <h2 className="font-semibold mb-1">קישורים שנוצרו</h2>
          <ul className="list-disc pr-4 space-y-1">
            {links.map((l) => (
              <li key={l.gardener_id}>
                <a href={l.url} className="underline" target="_blank">
                  {l.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterGardener}
            onChange={(e) => setFilterGardener(e.target.value)}
            className="border p-1"
          >
            <option value="">כל הגננים</option>
            {gardenerOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border p-1"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border p-1"
          />
        </div>
        <table className="w-full text-right border">
          <thead>
            <tr>
              <th className="border p-1">תאריך</th>
              <th className="border p-1">גנן</th>
              <th className="border p-1">כתובת</th>
              <th className="border p-1">הערות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx}>
                <td className="border p-1">{r.date}</td>
                <td className="border p-1">{r.gardener}</td>
                <td className="border p-1">{r.address}</td>
                <td className="border p-1">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
