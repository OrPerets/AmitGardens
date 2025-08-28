'use client';

interface Stats {
  gardeners: number;
  submitted: number;
  assignments: number;
  coverageDays: number;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
      <div className="border p-4 rounded-md">
        <p className="text-sm">גננים שהגישו</p>
        <p className="text-xl font-bold">
          {stats.submitted}/{stats.gardeners}
        </p>
      </div>
      <div className="border p-4 rounded-md">
        <p className="text-sm">שיבוצים</p>
        <p className="text-xl font-bold">{stats.assignments}</p>
      </div>
      <div className="border p-4 rounded-md">
        <p className="text-sm">ימי כיסוי</p>
        <p className="text-xl font-bold">{stats.coverageDays}</p>
      </div>
    </div>
  );
}
