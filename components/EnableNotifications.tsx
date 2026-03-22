'use client';
import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

export default function EnableNotifications() {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'unsupported' | 'denied' | 'enabling'>('idle');

  async function enable() {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported');
        return;
      }
      
      setStatus('enabling');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;
      if (!vapidKey) {
        console.error('VAPID key not found');
        setStatus('unsupported');
        return;
      }
      
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(sub),
      });

      setStatus('subscribed');
    } catch (e) {
      console.error('Failed to enable notifications:', e);
      setStatus('denied');
    }
  }

  // Automatically enable notifications when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && status === 'idle') {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        enable();
      }, 1000);
    }
  }, [status]);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {status === 'idle' && <span>מכין התראות...</span>}
      {status === 'enabling' && <span>מאפשר התראות...</span>}
      {status === 'subscribed' && <span>✔️ התראות מופעלות</span>}
      {status === 'unsupported' && <span>דפדפן לא תומך בהודעות פוש</span>}
      {status === 'denied' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>נדרשת הרשאה להתראות</span>
          <button onClick={enable} style={{ padding: '8px 12px', borderRadius: 4, fontSize: '14px' }}>
            נסה שוב
          </button>
        </div>
      )}
    </div>
  );
}


