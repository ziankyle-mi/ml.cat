import React from 'react';
import type { Hero } from '../types/hero';
import heroesData from '../data/heroes.json';
import { HeroAvatar } from '../components/common/HeroAvatar';

export const Sandbox: React.FC = () => {
  const heroes = heroesData as Hero[];
  const sampleHero = heroes[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-3xl text-paper">Hero Avatar Sandbox</h1>
        <p className="text-xs text-mist mt-1">
          Validating all portraits and sizes (40, 56, 64, 96, 128) across seed heroes.
        </p>
      </div>

      {/* Size Showcase */}
      <div className="flex flex-col gap-4 p-4 rounded-panel bg-ink-raised border border-line">
        <h2 className="font-serif text-lg text-paper">Size Variations</h2>
        <div className="flex items-end gap-6 flex-wrap">
          <div className="flex flex-col items-center gap-1">
            <HeroAvatar hero={sampleHero} size={40} showName />
            <span className="text-[10px] text-mist font-mono">40px</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HeroAvatar hero={sampleHero} size={56} showName />
            <span className="text-[10px] text-mist font-mono">56px</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HeroAvatar hero={sampleHero} size={64} ringColor="#c9a35b" showName />
            <span className="text-[10px] text-mist font-mono">64px (ring)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HeroAvatar hero={sampleHero} size={96} showName />
            <span className="text-[10px] text-mist font-mono">96px</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HeroAvatar hero={sampleHero} size={128} ringColor="#a8574f" showName />
            <span className="text-[10px] text-mist font-mono">128px (ring)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HeroAvatar hero={sampleHero} size={40} isBanned showName />
            <span className="text-[10px] text-mist font-mono">40px (banned)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HeroAvatar hero={sampleHero} size={56} disabled showName />
            <span className="text-[10px] text-mist font-mono">56px (disabled)</span>
          </div>
        </div>
      </div>

      {/* Every Hero at size 56 */}
      <div className="flex flex-col gap-4 p-4 rounded-panel bg-ink-raised border border-line">
        <h2 className="font-serif text-lg text-paper">
          All Seed Heroes ({heroes.length})
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
          {heroes.map((hero) => (
            <div key={hero.id} className="flex justify-center">
              <HeroAvatar hero={hero} size={56} showName />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
