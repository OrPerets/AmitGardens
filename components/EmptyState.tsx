import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode | string;
  action?: ReactNode;
  variant?: 'default' | 'search' | 'error' | 'loading';
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({ 
  title, 
  description,
  icon, 
  action,
  variant = 'default',
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8'
  };

  const iconClasses = {
    sm: 'w-8 h-8 text-2xl',
    md: 'w-12 h-12 text-3xl', 
    lg: 'w-16 h-16 text-4xl'
  };

  const getVariantEmoji = (variant: string) => {
    switch (variant) {
      case 'search':
        return '🔍';
      case 'error':
        return '⚠️';
      case 'loading':
        return '⏳';
      default:
        return '📝';
    }
  };

  const displayIcon = typeof icon === 'string' ? icon : icon || getVariantEmoji(variant);

  return (
    <div className={`empty-state animate-fade-in ${sizeClasses[size]}`}>
      {/* Icon */}
      <div className={`empty-state-icon ${iconClasses[size]} animate-bounce-in`}>
        {typeof displayIcon === 'string' ? (
          <div className="text-4xl">{displayIcon}</div>
        ) : (
          displayIcon
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <h3 className="empty-state-title text-hebrew">
          {title}
        </h3>
        {description && (
          <p className="empty-state-description text-hebrew animate-slide-down">
            {description}
          </p>
        )}
      </div>
      
      {/* Action */}
      {action && (
        <div className="mt-4 animate-scale-in" style={{ animationDelay: '200ms' }}>
          {action}
        </div>
      )}
    </div>
  );
}
