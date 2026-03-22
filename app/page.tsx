'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login
    router.replace('/admin/login');
  }, [router]);

  return (
    <main style={{ padding: 24 }}>
      <div>מעביר לדף התחברות...</div>
    </main>
  );
}
