import PlanClient from './plan-client';

export default function PlanPage({
  params,
  searchParams,
}: {
  params: { yyyymm: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { yyyymm } = params;
  const g = typeof searchParams.g === 'string' ? searchParams.g : '';
  const t = typeof searchParams.t === 'string' ? searchParams.t : '';
  const plan = yyyymm.includes('-')
    ? yyyymm
    : `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`;
  if (!g || !t) {
    return <div className="p-4">קישור לא תקין</div>;
  }
  return <PlanClient plan={plan} g={g} t={t} />;
}
