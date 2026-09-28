import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import type { Hero } from '../../types/hero';
import { HeroAvatar } from './HeroAvatar';

interface SearchBoxProps {
  heroes: Hero[];
  placeholder?: string;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  heroes,
  placeholder = 'Search hero...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? heroes
        .filter((h) =>
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.role.toLowerCase().includes(query.toLowerCase()) ||
          h.primaryLane.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (heroId: string) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/hero/${heroId}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-mist absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-ink-raised text-paper text-sm pl-9 pr-8 py-2 rounded-panel border border-line placeholder:text-mist/60 focus:outline-none focus:border-line focus-visible:ring-1 focus-visible:ring-tier-ss transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 text-mist hover:text-paper transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-ink-raised border border-line rounded-panel shadow-2xl z-50 overflow-hidden py-1">
          {filtered.map((hero) => (
            <div
              key={hero.id}
              onClick={() => handleSelect(hero.id)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-line/40 cursor-pointer transition-colors"
            >
              <HeroAvatar hero={hero} size={40} />
              <div className="flex flex-col">
                <span className="text-sm text-paper font-medium">{hero.name}</span>
                <span className="text-xs text-mist">
                  {hero.role} · {hero.primaryLane}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
