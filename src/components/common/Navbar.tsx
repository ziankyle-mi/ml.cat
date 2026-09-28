import React from 'react';
import { NavLink } from 'react-router-dom';
import type { Hero } from '../../types/hero';
import { SearchBox } from './SearchBox';

interface NavbarProps {
  heroes: Hero[];
}

export const Navbar: React.FC<NavbarProps> = ({ heroes }) => {
  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 text-paper hover:opacity-90 transition-opacity">
          <img
            src="/logo.webp"
            alt="ml.cat logo"
            className="w-8 h-8 rounded-full object-cover border border-line ring-1 ring-tier-ss/40"
          />
          <span className="font-serif text-xl tracking-tight text-paper font-semibold">
            ml.cat
          </span>
        </NavLink>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-panel text-sm font-medium transition-colors ${
                isActive
                  ? 'text-paper bg-ink-raised border border-line'
                  : 'text-mist hover:text-paper hover:bg-ink-raised/50'
              }`
            }
          >
            Tiers
          </NavLink>
          <NavLink
            to="/draft"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-panel text-sm font-medium transition-colors ${
                isActive
                  ? 'text-paper bg-ink-raised border border-line'
                  : 'text-mist hover:text-paper hover:bg-ink-raised/50'
              }`
            }
          >
            Draft
          </NavLink>
          <NavLink
            to="/counter"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-panel text-sm font-medium transition-colors ${
                isActive
                  ? 'text-paper bg-ink-raised border border-line'
                  : 'text-mist hover:text-paper hover:bg-ink-raised/50'
              }`
            }
          >
            Counter
          </NavLink>
          <NavLink
            to="/retri"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-panel text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'text-tier-ss bg-ink-raised border border-tier-ss/40'
                  : 'text-mist hover:text-paper hover:bg-ink-raised/50'
              }`
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-tier-ss animate-pulse hidden sm:inline-block" />
            <span>Retri Test</span>
          </NavLink>
        </nav>

        {/* Search */}
        <div className="w-36 sm:w-56">
          <SearchBox heroes={heroes} />
        </div>
      </div>
    </header>
  );
};
