import React, { useState } from 'react';
import equipmentData from '../../data/equipment.json';
import { Shield } from 'lucide-react';

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Physical' | 'Magic' | 'Defense';
  icon: string;
  tagline: string;
  passive: string;
  counterReason: string;
}

interface CounterEquipmentProps {
  itemIds: string[];
  heroName: string;
}

export const CounterEquipment: React.FC<CounterEquipmentProps> = ({ itemIds, heroName }) => {
  const allEquipment = equipmentData as EquipmentItem[];
  const itemMap = new Map<string, EquipmentItem>(allEquipment.map((item) => [item.id, item]));

  const items = itemIds
    .map((id) => itemMap.get(id))
    .filter((item): item is EquipmentItem => !!item);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-panel bg-ink-raised border border-line">
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-tier-ss" />
          <h3 className="text-base font-bold text-paper tracking-tight">
            Counter Equipment vs. {heroName}
          </h3>
        </div>
        <span className="text-[11px] text-mist font-mono uppercase tracking-wider">
          Core Item Counters
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <EquipmentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const EquipmentCard: React.FC<{ item: EquipmentItem }> = ({ item }) => {
  const [imgError, setImgError] = useState(false);

  const categoryBadge =
    item.category === 'Physical'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : item.category === 'Magic'
      ? 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10'
      : 'text-sky-300 border-sky-500/30 bg-sky-500/10';

  return (
    <div className="flex items-start gap-3.5 p-3.5 rounded-panel bg-ink/70 border border-line hover:border-line/80 hover:bg-ink transition-colors">
      {/* Official Game Item Icon */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-line bg-ink-raised flex items-center justify-center p-1">
        {!imgError ? (
          <img
            src={item.icon}
            alt={item.name}
            className="w-full h-full object-contain rounded select-none"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono font-bold text-mist bg-ink rounded">
            {item.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="font-bold text-paper text-sm truncate">
            {item.name}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold border ${categoryBadge}`}
          >
            {item.category}
          </span>
        </div>

        <div className="text-[11px] font-mono text-mist truncate">
          Passive: <span className="text-paper/90 font-medium">{item.passive}</span>
        </div>

        <p className="text-xs text-mist leading-relaxed mt-0.5 line-clamp-3">
          {item.counterReason}
        </p>
      </div>
    </div>
  );
};

