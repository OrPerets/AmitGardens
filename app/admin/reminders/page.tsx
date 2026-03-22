'use client';
import { useEffect, useState } from 'react';

type SendResult = {
  ok: boolean;
  sent: number;
  removed: number;
  total: number;
} | { error: string };

export default function AdminRemindersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/admin/subscribers/count');
        if (res.ok) {
          const json = (await res.json()) as { count?: number };
          setCount(typeof json.count === 'number' ? json.count : null);
        }
      } catch {
        // ignore
      }
    }
    fetchCount();
  }, []);

  async function sendAll() {
    setLoading(true);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '',
        },
        body: JSON.stringify({
          title: 'תזכורת חודשית',
          body: 'הגיע הזמן לעדכן משמרות/משימות. לחצו כדי להיכנס.',
          clickUrl: '/worker',
        }),
      });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>התראות</h1>
      {count !== null && <p style={{ marginBottom: 8 }}>מנויים פעילים: {count}</p>}
      <button onClick={sendAll} disabled={loading} style={{ padding: '12px 18px', borderRadius: 10 }}>
        {loading ? 'שולח…' : 'שלח תזכורות'}
      </button>
      {result && (
        <pre style={{ marginTop: 16, background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}


