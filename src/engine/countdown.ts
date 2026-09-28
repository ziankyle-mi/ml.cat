export interface TimeRemaining {
  totalMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function getTimeRemaining(
  targetDate: string | Date,
  currentDate: string | Date = new Date()
): TimeRemaining {
  const target = typeof targetDate === 'string' ? new Date(targetDate).getTime() : targetDate.getTime();
  const current = typeof currentDate === 'string' ? new Date(currentDate).getTime() : currentDate.getTime();
  const diff = target - current;

  if (diff <= 0 || isNaN(diff)) {
    return {
      totalMs: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor(diff / (1000 * 60 * 60));

  return {
    totalMs: diff,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
}

export function formatCountdown(
  targetDate: string | Date,
  currentDate: string | Date = new Date()
): string {
  const remaining = getTimeRemaining(targetDate, currentDate);

  if (remaining.isPast) {
    return 'updating soon';
  }

  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m`;
  }

  return `${remaining.minutes}m ${remaining.seconds}s`;
}

export function formatTimeAgo(
  date: string | Date,
  currentDate: string | Date = new Date()
): string {
  const past = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const now = typeof currentDate === 'string' ? new Date(currentDate).getTime() : currentDate.getTime();
  const diffMs = Math.max(0, now - past);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'just now';
}
