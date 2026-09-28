import React from 'react';
import type { Lane } from '../../types/hero';

interface LaneFilterProps {
  selectedLane: 'All' | Lane;
  onSelectLane: (lane: 'All' | Lane) => void;
  className?: string;
}

const LANES: ('All' | Lane)[] = ['All', 'EXP', 'Gold', 'Mid', 'Jungle', 'Roam'];

export const LaneFilter: React.FC<LaneFilterProps> = ({
  selectedLane,
  onSelectLane,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-xs text-mist font-normal">filter:</span>
      <div className="flex items-center gap-1 bg-ink-raised p-1 rounded-panel border border-line">
        {LANES.map((lane) => (
          <button
            key={lane}
            onClick={() => onSelectLane(lane)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedLane === lane
                ? 'bg-line text-paper font-medium'
                : 'text-mist hover:text-paper'
            }`}
          >
            {lane}
          </button>
        ))}
      </div>
    </div>
  );
};
