import React, { useState } from 'react';
import type { Hero } from '../../types/hero';

export interface HeroAvatarProps {
  hero: Hero;
  size?: 40 | 56 | 64 | 96 | 128;
  ringColor?: string;     // tier color
  showName?: boolean;
  disabled?: boolean;     // grayscale, used for banned or picked
  onClick?: () => void;
  className?: string;
  isBanned?: boolean;
}

const sizeMap: Record<number, { container: string; px: number }> = {
  40: { container: 'w-10 h-10', px: 40 },
  56: { container: 'w-14 h-14', px: 56 },
  64: { container: 'w-16 h-16', px: 64 },
  96: { container: 'w-24 h-24', px: 96 },
  128: { container: 'w-32 h-32', px: 128 },
};

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
  hero,
  size = 56,
  ringColor,
  showName = false,
  disabled = false,
  onClick,
  className = '',
  isBanned = false,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(hero.icon || `/heroes/${hero.id}.webp`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('/heroes/_placeholder.webp');
    }
  };

  const sizeCfg = sizeMap[size] || sizeMap[56];

  const content = (
    <div
      className={`relative inline-flex flex-col items-center group ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={!disabled && onClick ? onClick : undefined}
      role={onClick && !disabled ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={hero.name}
    >
      <div
        className={`relative rounded-full overflow-hidden transition-transform duration-200 ease-out ${sizeCfg.container} ${onClick && !disabled ? 'group-hover:scale-105 group-focus-visible:scale-105' : ''}`}
        style={{
          borderWidth: ringColor ? '2px' : '1px',
          borderColor: ringColor || '#22272c',
        }}
      >
        <img
          src={imgSrc}
          alt={hero.name}
          width={sizeCfg.px}
          height={sizeCfg.px}
          loading="lazy"
          onError={handleError}
          className="w-full h-full object-cover rounded-full select-none"
        />

        {/* Thin diagonal ban slash for banned slots */}
        {isBanned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[2px] bg-tier-s transform rotate-45" />
          </div>
        )}
      </div>

      {showName && (
        <span
          className="mt-1 text-xs text-mist font-medium tracking-tight text-center truncate max-w-[80px] transition-colors group-hover:text-paper"
        >
          {hero.name}
        </span>
      )}
    </div>
  );

  return content;
};
