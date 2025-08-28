import AdminGuard from '@/components/AdminGuard';
import DashboardClient from './dashboard-client';

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
