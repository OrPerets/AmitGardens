"use client";

import AdminGuard from '@/components/AdminGuard';
import EnableNotifications from '@/components/EnableNotifications';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface PlanItem {
  year: number;
  month: number;
  locked: boolean;
}

export default function AdminHomePage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const res = await fetch('/api/admin/plans/list', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } else {
      setError('שגיאה בטעינת החודשים');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const yyyymm = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

  const months = useMemo(() => plans.map((p) => {
    const key = yyyymm(p.year, p.month);
    const dt = new Date(p.year, p.month - 1, 1);
    const display = format(dt, 'LLLL, yyyy', { locale: he });
    return { key, label: key, display, locked: p.locked };
  }), [plans]);

  const createPlan = async (plan: string) => {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch('/api/admin/plans/bulk-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ plans: [plan] }),
    });
    if (res.ok) await load();
  };

  const createNextMonth = async () => {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const plan = format(next, 'yyyy-MM');
    await createPlan(plan);
    window.location.href = `/admin/plan/${plan}`;
  };

  const go = (plan: string) => {
    window.location.href = `/admin/plan/${plan}`;
  };

  return (
    <AdminGuard>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">ניהול חודשי</h1>
        <div className="flex flex-col items-center gap-3">
          <EnableNotifications />
          <button className="btn btn-primary" onClick={createNextMonth}>צור חודש הבא</button>
        </div>
        {loading ? (
          <div className="text-center">טוען…</div>
        ) : error ? (
          <div className="text-center text-destructive">{error}</div>
        ) : months.length === 0 ? (
          <div className="text-center">אין חודשי תכנון. צור חדש.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {months.map((m) => (
              <div key={m.key} className="card">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{m.display}</div>
                    <div className="text-sm text-muted-foreground">{m.locked ? 'נעול' : 'פתוח'}</div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => go(m.label)}>כניסה</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}


