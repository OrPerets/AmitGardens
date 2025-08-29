'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toaster';
import EmptyState from '@/components/EmptyState';
import { Inbox } from 'lucide-react';

interface SubmissionItem {
  gardenerId: string;
  gardener: string;
  team: string;
  status: 'pending' | 'approved' | 'needs_changes';
}

export default function DashboardClient({ plan }: { plan: string }) {
  const toast = useToast();
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [team, setTeam] = useState('');
  const [worker, setWorker] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch(`/api/admin/submissions/list?plan=${plan}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.submissions || []);
    } else {
      toast({ title: 'שגיאה בטעינה' });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const teamOptions = Array.from(new Set(items.map((i) => i.team).filter(Boolean)));
  const workerOptions = items
    .filter((i) => !team || i.team === team)
    .map((i) => ({ id: i.gardenerId, name: i.gardener }));
  const filtered = items.filter((i) => {
    if (team && i.team !== team) return false;
    if (worker && i.gardener !== worker) return false;
    if (status && i.status !== status) return false;
    return true;
  });

  const statusBadge = (s: SubmissionItem['status']) => {
    const map: Record<SubmissionItem['status'], { label: string; cls: string }> = {
      pending: { label: 'ממתין', cls: 'badge-warning' },
      approved: { label: 'מאושר', cls: 'badge-success' },
      needs_changes: { label: 'דרוש שינוי', cls: 'badge-error' },
    };
    const { label, cls } = map[s];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">אישורי מנהל {plan}</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <select value={team} onChange={(e) => setTeam(e.target.value)} className="select h-8">
          <option value="">כל הצוותים</option>
          {teamOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={worker} onChange={(e) => setWorker(e.target.value)} className="select h-8">
          <option value="">כל הגננים</option>
          {workerOptions.map((w) => (
            <option key={w.id} value={w.name}>{w.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select h-8">
          <option value="">כל הסטטוסים</option>
          <option value="pending">ממתין</option>
          <option value="approved">מאושר</option>
          <option value="needs_changes">דרוש שינוי</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 && (
          <EmptyState icon={<Inbox className="h-10 w-10" />} title="אין נתונים" />
        )}
        {filtered.map((item) => (
          <div key={item.gardenerId} className="card">
            <div className="card-body space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="font-bold">{item.gardener}</h2>
                {statusBadge(item.status)}
              </div>
              {item.team && <div className="text-sm text-muted-foreground">{item.team}</div>}
              <Link href={`/admin/approvals/${plan}/${item.gardenerId}`} className="btn btn-primary w-full">פתח</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
