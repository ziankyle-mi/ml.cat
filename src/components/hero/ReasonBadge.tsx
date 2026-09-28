import React from 'react';

interface ReasonBadgeProps {
  text: string;
  variant?: 'positive' | 'negative' | 'neutral' | 'tier';
  className?: string;
  onClick?: () => void;
}

export const ReasonBadge: React.FC<ReasonBadgeProps> = ({
  text,
  variant = 'neutral',
  className = '',
  onClick,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'positive':
        return 'text-tier-a border-tier-a/30 bg-tier-a/10';
      case 'negative':
        return 'text-tier-s border-tier-s/30 bg-tier-s/10';
      case 'tier':
        return 'text-tier-ss border-tier-ss/30 bg-tier-ss/10';
      default:
        return 'text-mist border-line bg-ink-raised';
    }
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-panel border transition-colors ${getStyles()} ${
        onClick ? 'hover:text-paper hover:border-mist cursor-pointer' : ''
      } ${className}`}
    >
      {text}
    </Component>
  );
};
