"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
