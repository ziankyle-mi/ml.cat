import React, { useState } from 'react';
import type { Hero, HeroRole, Lane } from '../../types/hero';
import { HeroAvatar } from './HeroAvatar';
import { Search } from 'lucide-react';

interface HeroGridProps {
  heroes: Hero[];
  onSelectHero: (hero: Hero) => void;
  isHeroDisabled?: (heroId: string) => boolean;
  selectedHeroIds?: string[];
  title?: string;
  className?: string;
}

const ROLES: ('All' | HeroRole)[] = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
const LANES: ('All' | Lane)[] = ['All', 'EXP', 'Mid', 'Roam', 'Jungle', 'Gold'];

export const HeroGrid: React.FC<HeroGridProps> = ({
  heroes,
  onSelectHero,
  isHeroDisabled = () => false,
  selectedHeroIds = [],
  title = 'Select Hero',
  className = '',
}) => {
  const [selectedRole, setSelectedRole] = useState<'All' | HeroRole>('All');
  const [selectedLane, setSelectedLane] = useState<'All' | Lane>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHeroes = heroes.filter((hero) => {
    if (selectedRole !== 'All' && hero.role !== selectedRole) return false;
    if (selectedLane !== 'All' && hero.primaryLane !== selectedLane && hero.secondaryLane !== selectedLane) {
      return false;
    }
    if (searchQuery.trim() && !hero.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <h3 className="font-serif text-lg text-paper tracking-wide">{title}</h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-mist absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter..."
              className="bg-ink-raised text-paper text-xs pl-8 pr-3 py-1.5 rounded-panel border border-line focus:outline-none focus-visible:ring-1 focus-visible:ring-tier-ss w-32 sm:w-40 placeholder:text-mist/50"
            />
          </div>

          {/* Lane selector */}
          <div className="flex items-center gap-1 bg-ink-raised p-1 rounded-panel border border-line text-xs">
            {LANES.map((lane) => (
              <button
                key={lane}
                onClick={() => setSelectedLane(lane)}
                className={`px-2 py-0.5 rounded transition-colors ${selectedLane === lane ? 'bg-line text-paper font-medium' : 'text-mist hover:text-paper'}`}
              >
                {lane}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1 rounded-panel whitespace-nowrap transition-colors border ${
              selectedRole === role
                ? 'bg-line/60 border-line text-paper font-medium'
                : 'border-transparent text-mist hover:text-paper hover:bg-line/20'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Hero Icons Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 pt-2">
        {filteredHeroes.map((hero) => {
          const disabled = isHeroDisabled(hero.id);
          const isSelected = selectedHeroIds.includes(hero.id);

          return (
            <div key={hero.id} className="flex justify-center">
              <HeroAvatar
                hero={hero}
                size={56}
                showName
                disabled={disabled}
                ringColor={isSelected ? '#c9a35b' : undefined}
                onClick={disabled ? undefined : () => onSelectHero(hero)}
              />
            </div>
          );
        })}

        {filteredHeroes.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-mist">
            No heroes found matching current filters.
          </div>
        )}
      </div>
    </div>
  );
};
