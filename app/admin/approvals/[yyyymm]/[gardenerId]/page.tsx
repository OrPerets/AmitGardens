import AdminGuard from '@/components/AdminGuard';
import DetailClient from './detail-client';

export default function ApprovalDetailPage({ params }: { params: { yyyymm: string; gardenerId: string } }) {
  const { yyyymm, gardenerId } = params;
  const plan = yyyymm.includes('-') ? yyyymm : `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`;
  return (
    <AdminGuard>
      <DetailClient plan={plan} gardenerId={gardenerId} />
    </AdminGuard>
  );
}
