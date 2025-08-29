import AdminGuard from '@/components/AdminGuard';
import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./dashboard-client'), {
  ssr: false,
});

export default function AdminPlanPage({
  params,
}: {
  params: { yyyymm: string };
}) {
  const { yyyymm } = params;
  const plan = yyyymm.includes('-')
    ? yyyymm
    : `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`;
  return (
    <AdminGuard>
      <DashboardClient plan={plan} />
    </AdminGuard>
  );
}
