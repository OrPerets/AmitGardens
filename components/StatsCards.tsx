'use client';

import { useMemo } from 'react';

interface Stats {
  gardeners: number;
  submitted: number;
  assignments: number;
  coverageDays: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
  trend?: {
    value: number;
    label: string;
  };
}

function StatCard({ title, value, subtitle, icon, color = 'primary', trend }: StatCardProps) {
  const colorClasses = {
    primary: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-700',
    success: 'from-green-50 to-emerald-50 border-green-200 text-green-700',
    warning: 'from-amber-50 to-orange-50 border-amber-200 text-amber-700',
    info: 'from-cyan-50 to-sky-50 border-cyan-200 text-cyan-700',
  };

  return (
    <div className={`
      card card-interactive bg-gradient-to-br ${colorClasses[color]}
      hover:scale-[1.02] transition-all duration-200 animate-fade-in
    `}>
      <div className="card-body text-center">
        {icon && (
          <div className="text-2xl mb-2 animate-bounce-in" style={{ animationDelay: '100ms' }}>
            {icon}
          </div>
        )}
        
        <p className="text-xs font-medium text-muted-foreground mb-1 text-hebrew">
          {title}
        </p>
        
        <div className="text-2xl font-bold mb-1 animate-scale-in" style={{ animationDelay: '200ms' }}>
          {value}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground text-hebrew">
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div className={`
            mt-2 flex items-center justify-center gap-1 text-xs
            ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}
          `}>
            <span>{trend.value >= 0 ? '📈' : '📉'}</span>
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const submissionRate = useMemo(() => {
    return stats.gardeners > 0 ? Math.round((stats.submitted / stats.gardeners) * 100) : 0;
  }, [stats.submitted, stats.gardeners]);
  
  const statCards = [
    {
      title: 'הגשות',
      value: `${stats.submitted}/${stats.gardeners}`,
      subtitle: `${submissionRate}% הושלמו`,
      icon: '👥',
      color: submissionRate >= 80 ? 'success' : submissionRate >= 50 ? 'warning' : 'primary',
      trend: stats.gardeners > 0 ? {
        value: submissionRate,
        label: 'השלמה'
      } : undefined
    }
  ] as const;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Quick overview */}
      <div className="text-center animate-slide-down">
        <h3 className="text-lg font-semibold text-hebrew mb-1">סיכום מהיר</h3>
        <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
      </div>
      
      {/* Stats grid - mobile first, responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={stat.title} 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>
      
      {/* Progress visualization */}
      {stats.gardeners > 0 && (
        <div className="card animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="card-body">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-hebrew">התקדמות הגשות</span>
              <span className="text-xs text-muted-foreground">{submissionRate}%</span>
            </div>
            
            <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className={`
                  h-full transition-all duration-1000 ease-out rounded-full
                  ${submissionRate >= 80 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : submissionRate >= 50 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }
                `}
                style={{ 
                  width: `${submissionRate}%`,
                  animationDelay: '600ms'
                }}
              />
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0</span>
              <span>{stats.gardeners} גננים</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
