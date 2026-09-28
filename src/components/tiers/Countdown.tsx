import React, { useState, useEffect } from 'react';
import { formatCountdown, formatTimeAgo } from '../../engine/countdown';

interface CountdownProps {
  updatedAt: string;
  nextUpdateAt: string;
  className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  updatedAt,
  nextUpdateAt,
  className = '',
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeAgo = formatTimeAgo(updatedAt, now);
  const countdown = formatCountdown(nextUpdateAt, now);

  return (
    <div className={`text-xs text-mist flex items-center gap-2 ${className}`}>
      <span>Updated {timeAgo}</span>
      <span>·</span>
      <span>next update in <strong className="text-paper font-medium">{countdown}</strong></span>
    </div>
  );
};
