'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toaster';

interface Assignment {
  date: string;
  address: string;
  notes: string;
}

interface DetailData {
  gardener: { id: string; name: string; team: string };
  status: 'pending' | 'approved' | 'needs_changes';
  note: string;
  assignments: Assignment[];
}

export default function DetailClient({ plan, gardenerId }: { plan: string; gardenerId: string }) {
  const toast = useToast();
  const router = useRouter();
  const [data, setData] = useState<DetailData | null>(null);
  const [note, setNote] = useState('');

  const load = async () => {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch(`/api/admin/submissions/detail?plan=${plan}&gardenerId=${gardenerId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      const json = await res.json();
      setData(json);
      setNote(json.note || '');
    } else {
      toast({ title: 'שגיאה בטעינה' });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, gardenerId]);

  const update = async (status: 'approved' | 'needs_changes') => {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch('/api/admin/submissions/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ plan, gardenerId, status, note: status === 'needs_changes' ? note : undefined }),
    });
    if (res.ok) {
      toast({ title: 'עודכן בהצלחה' });
      router.back();
    } else {
      toast({ title: 'שגיאה בעדכון' });
    }
  };

  if (!data) return <div className="p-4">טוען...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">{data.gardener.name}</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>כתובת</th>
              <th>הערות</th>
            </tr>
          </thead>
          <tbody>
            {data.assignments.map((a, idx) => (
              <tr key={idx}>
                <td>{a.date}</td>
                <td>{a.address}</td>
                <td>{a.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2">
        <textarea
          placeholder="הערות לבקשת שינוי"
          className="textarea w-full"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={() => update('approved')} className="btn btn-success flex-1">אשר הכל</button>
          <button onClick={() => update('needs_changes')} className="btn btn-warning flex-1">בקש שינויים</button>
        </div>
      </div>
    </div>
  );
}
