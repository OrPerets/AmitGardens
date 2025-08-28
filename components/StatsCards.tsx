'use client';

interface Stats {
  gardeners: number;
  submitted: number;
  assignments: number;
  coverageDays: number;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-center">
      <div className="card card-body">
        <p className="text-xs text-muted-foreground">גננים שהגישו</p>
        <p className="text-2xl font-bold">
          {stats.submitted}/{stats.gardeners}
        </p>
      </div>
    </div>
  );
}
