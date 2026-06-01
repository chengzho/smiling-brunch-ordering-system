import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: ReactNode;
};

export function EmptyState({ title, description, ctaLabel, onCta, icon }: EmptyStateProps) {
  return (
    <div className="empty-state-card">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {ctaLabel && onCta && (
        <button className="btn btn-primary empty-state-cta" onClick={onCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
