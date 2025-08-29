import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, icon, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="mb-2 text-muted-foreground">{icon}</div>}
      <p>{title}</p>
      {action}
    </div>
  );
}
