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
  gardener?: string;
  url: string;
  token: string;
}

export default function DashboardClient({ plan }: { plan: string }) {
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [locked, setLocked] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [gardenerList, setGardenerList] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<null | 'not_found' | 'error'>(null);
  const [filterGardener, setFilterGardener] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gardenerName, setGardenerName] = useState('');
  const [deadline, setDeadline] = useState(''); // datetime-local value
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoadError(null);
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch(`/api/admin/overview?plan=${plan}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
      setRows(data.rows);
      setLocked(!!data.locked);
      setLinks([]);
      if (Array.isArray(data.gardenerList)) {
        setGardenerList(
          data.gardenerList
            .map((g: { id: string; name: string }) => g?.name)
            .filter(Boolean),
        );
      } else {
        setGardenerList([]);
      }
    } else {
      setStats(null);
      setRows([]);
      setLocked(false);
      setLoadError(res.status === 404 ? 'not_found' : 'error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const createLinks = async () => {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch('/api/admin/links/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

  const createSingleLink = async () => {
    if (!gardenerName.trim()) {
      toast({ title: 'נא להזין שם גנן' });
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const deadlineIso = deadline ? new Date(deadline).toISOString() : undefined;
      const res = await fetch('/api/admin/links/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan, gardenerName: gardenerName.trim(), deadline: deadlineIso }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.link) {
          setLinks((prev) => [data.link, ...prev]);
          toast({ title: 'קישור נוצר' });
          setShowCreateModal(false);
          setGardenerName('');
          setDeadline('');
        } else {
          toast({ title: 'שגיאה: תגובה לא צפויה' });
        }
      } else {
        toast({ title: 'שגיאה ביצירת קישור' });
      }
    } finally {
      setCreating(false);
    }
  };

  const initDb = async () => {
    const res = await fetch('/api/admin/init');
    if (res.ok) {
      toast({ title: 'אינדקסים/נתוני דמו אותחלו' });
      await load();
    } else {
      toast({ title: 'שגיאה באתחול' });
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'הקישור הועתק' });
    } catch {
      toast({ title: 'שגיאה בהעתקה' });
    }
  };

  // Lock/unlock removed per requirements

  const sendReminders = async () => {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch('/api/admin/remind', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      toast({ title: 'תזכורות נשלחו' });
    } else {
      toast({ title: 'שגיאה בשליחת תזכורות' });
    }
  };

  // CSV export removed per requirements

  const exportPdf = async (gardenerId: string) => {
    // Simple navigation to the printable page; the page will render a printable calendar and trigger print dialog
    window.open(`/admin/plan/${plan}/report/${gardenerId}`, '_blank');
  };

  const gardenerOptions = (gardenerList.length
    ? gardenerList
    : Array.from(new Set(rows.map((r) => r.gardener))).filter(Boolean)
  ) as string[];
  const filtered = rows.filter((r) => {
    if (filterGardener && r.gardener !== filterGardener) return false;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">לוח מנהל {plan}</h1>
      {loadError === 'not_found' ? (
        <div className="card">
          <div className="card-body text-center space-y-3">
            <p className="text-muted-foreground">לא נמצא תכנון לחודש זה.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={initDb} className="btn btn-secondary">אתחל נתוני דמו</button>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">צור קישורים (יוצר גם תכנון)</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {stats && <StatsCards stats={stats} />}
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">צור קישורים</button>
            <button onClick={sendReminders} className="btn btn-secondary">שלח תזכורות</button>
            <span className="badge">סטטוס: {locked ? 'נעול' : 'פתוח'}</span>
            <div className="ml-auto flex gap-2 items-center">
              <button onClick={initDb} className="btn btn-ghost">אתחל</button>
            </div>
          </div>
          {links.length > 0 && (
            <div className="card">
              <div className="card-header">קישורים שנוצרו</div>
              <div className="card-body">
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l.gardener_id} className="flex items-center gap-2">
                      <span className="text-sm">{l.gardener || l.gardener_id}</span>
                      <a href={l.url} className="text-primary underline" target="_blank" rel="noreferrer">
                        פתח קישור
                      </a>
                      <button
                        className="btn btn-ghost h-8 px-2 text-xs"
                        onClick={() => copyLink(l.url)}
                      >
                        העתק קישור
                      </button>
                      <button
                        className="btn btn-secondary h-8 px-2 text-xs"
                        onClick={() => exportPdf(l.gardener_id)}
                      >
                        ייצוא PDF
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="card w-[90vw] max-w-md text-right">
                <div className="card-header">יצירת קישור חדש</div>
                <div className="card-body space-y-3">
                  <div>
                    <label className="label" htmlFor="gardener-name">שם הגנן</label>
                    <select
                      id="gardener-name"
                      className="select w-full"
                      value={gardenerName}
                      onChange={(e) => setGardenerName(e.target.value)}
                    >
                      <option value="">בחר גנן</option>
                      {gardenerList.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="deadline">דדליין להגשה (אופציונלי)</label>
                    <input
                      id="deadline"
                      type="datetime-local"
                      className="input"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                    <p className="help-text">זמן מקומי של הדפדפן</p>
                  </div>
                  <div className="flex gap-2 justify-start">
                    <button
                      onClick={createSingleLink}
                      disabled={creating}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      צור
                    </button>
                    <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
                      ביטול
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={filterGardener}
                onChange={(e) => setFilterGardener(e.target.value)}
                className="select h-8"
                aria-label="סנן לפי גנן"
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
                className="input h-8 w-auto"
                aria-label="מתאריך"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input h-8 w-auto"
                aria-label="עד תאריך"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-hover">
                <thead>
                  <tr>
                    <th>תאריך</th>
                    <th>גנן</th>
                    <th>כתובת</th>
                    <th>הערות</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-muted-foreground">אין שורות להצגה</td>
                    </tr>
                  ) : (
                    filtered.map((r, idx) => (
                      <tr key={idx}>
                        <td className="align-top">{r.date}</td>
                        <td className="align-top">{r.gardener}</td>
                        <td className="align-top">{r.address}</td>
                        <td className="align-top">{r.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
