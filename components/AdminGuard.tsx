import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readAdminSessionFromCookie } from '@/lib/cookies';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const cookie = cookies().get('admin_session')?.value;
  const session = readAdminSessionFromCookie(cookie);
  if (!session) {
    redirect('/admin/login');
  }
  return <>{children}</>;
}
