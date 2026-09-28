import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playRetriSound, playSuccessSound, playFailureSound } from '../engine/audioEngine';
import { Volume2, VolumeX, Zap, Trophy, Flame, Target } from 'lucide-react';

interface GameMode {
  id: 'beginner' | 'ranked' | 'duel' | 'lord';
  label: string;
  desc: string;
  targetName: string;
  maxHp: number;
  retriDamage: number;
  hasBursts: boolean;
  botReactionMs?: number; // enemy jungler reaction time
}

const MODES: GameMode[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    desc: 'Level 4 Turtle · Steady auto-attacks · Practice threshold timing',
    targetName: 'Dragon Turtle (Lv 4)',
    maxHp: 12000,
    retriDamage: 1320,
    hasBursts: false,
  },
  {
    id: 'ranked',
    label: 'Ranked',
    desc: 'Level 8 Turtle · Sudden skill bursts · Realistic damage spikes',
    targetName: 'Dragon Turtle (Lv 8)',
    maxHp: 18000,
    retriDamage: 1760,
    hasBursts: true,
  },
  {
    id: 'duel',
    label: '50-50 Contest',
    desc: 'Enemy Jungler Contesting · Bot reacts in 220ms · 50-50 Smite Fight',
    targetName: 'Dragon Turtle (Contested)',
    maxHp: 20000,
    retriDamage: 2160,
    hasBursts: true,
    botReactionMs: 230,
  },
  {
    id: 'lord',
    label: 'Lord Steal',
    desc: 'Level 15 Lord · Extreme chaos · Pro enemy bot reacts in 170ms',
    targetName: 'Evolved Lord (Lv 15)',
    maxHp: 32000,
    retriDamage: 2560,
    hasBursts: true,
    botReactionMs: 170,
  },
];

interface FloatingText {
  id: number;
  text: string;
  isCrit?: boolean;
  x: number;
  y: number;
}

export const RetriGame: React.FC = () => {
  const [selectedModeId, setSelectedModeId] = useState<GameMode['id']>('ranked');
  const currentMode = MODES.find((m) => m.id === selectedModeId) || MODES[1];

  const [gameState, setGameState] = useState<'idle' | 'running' | 'ended'>('idle');
  const [currentHp, setCurrentHp] = useState<number>(currentMode.maxHp);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Result details
  const [verdict, setVerdict] = useState<{
    type: 'perfect' | 'success' | 'early' | 'late' | 'stolen';
    title: string;
    description: string;
    hpAtPress: number;
    difference: number;
    reactionMs?: number;
  } | null>(null);

  // Stats
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('mlcat_retri_best_streak') || '0', 10);
  });
  const [stats, setStats] = useState<{ total: number; wins: number }>({ total: 0, wins: 0 });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextBurstTimeRef = useRef<number>(0);
  const thresholdReachedTimeRef = useRef<number | null>(null);
  const botTriggeredRef = useRef<boolean>(false);

  // Start new round
  const startRound = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setGameState('running');
    setCurrentHp(currentMode.maxHp);
    setVerdict(null);
    setFloatingTexts([]);
    setIsStriking(false);
    setIsShaking(false);
    lastTimeRef.current = performance.now();
    nextBurstTimeRef.current = performance.now() + 1000 + Math.random() * 1500;
    thresholdReachedTimeRef.current = null;
    botTriggeredRef.current = false;
  }, [currentMode]);

  // Handle Retribution Press
  const handleRetriPress = useCallback(() => {
    if (gameState !== 'running') {
      if (gameState === 'ended' || gameState === 'idle') {
        startRound();
      }
      return;
    }

    const hp = currentHp;
    const threshold = currentMode.retriDamage;
    const diff = hp - threshold;

    setIsStriking(true);
    setIsShaking(true);
    playRetriSound(isMuted);

    setTimeout(() => setIsStriking(false), 120);
    setTimeout(() => setIsShaking(false), 150);

    setGameState('ended');
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (diff > 0) {
      // Too early! Retri didn't kill it
      playFailureSound(isMuted);
      setVerdict({
        type: 'early',
        title: 'TOO EARLY',
        description: `You pressed when HP was ${hp.toLocaleString()} HP. Retri only deals ${threshold.toLocaleString()} damage! Left ${(
          hp - threshold
        ).toLocaleString()} HP for enemy steal.`,
        hpAtPress: hp,
        difference: diff,
      });
      setStreak(0);
      setStats((s) => ({ total: s.total + 1, wins: s.wins }));
    } else {
      // Successful or Perfect!
      const absDiff = Math.abs(diff);
      const isPerfect = absDiff <= 65;

      playSuccessSound(isMuted);
      setVerdict({
        type: isPerfect ? 'perfect' : 'success',
        title: isPerfect ? 'PERFECT RETRI' : 'OBJECTIVE SECURED',
        description: isPerfect
          ? `Incredible timing! Pressed at ${hp.toLocaleString()} HP (just ${absDiff} HP below threshold). Instant steal secured!`
          : `Clean Retribution! Pressed at ${hp.toLocaleString()} HP. Turtle secured successfully.`,
        hpAtPress: hp,
        difference: diff,
        reactionMs: thresholdReachedTimeRef.current ? Math.round(performance.now() - thresholdReachedTimeRef.current) : undefined,
      });

      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) {
          setBestStreak(next);
          localStorage.setItem('mlcat_retri_best_streak', next.toString());
        }
        return next;
      });
      setStats((s) => ({ total: s.total + 1, wins: s.wins + 1 }));
    }
  }, [gameState, currentHp, currentMode, isMuted, bestStreak, startRound]);

  // Main game animation loop
  useEffect(() => {
    if (gameState !== 'running') return;

    const tick = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentHp((prevHp) => {
        if (prevHp <= 0) {
          // Monster died without player retri
          setGameState('ended');
          playFailureSound(isMuted);
          setVerdict({
            type: 'late',
            title: 'TOO LATE!',
            description: 'The objective died before you activated Retribution! Always press when HP hits the threshold marker.',
            hpAtPress: 0,
            difference: -currentMode.retriDamage,
          });
          setStreak(0);
          setStats((s) => ({ total: s.total + 1, wins: s.wins }));
          return 0;
        }

        // Base DPS (random auto-attack ticks between 1800 and 3200 DPS)
        let dps = (currentMode.maxHp / 6.0) * (0.85 + Math.random() * 0.3);
        let dmg = dps * dt;

        // Occasional skill burst spike
        if (currentMode.hasBursts && now > nextBurstTimeRef.current) {
          const burstDmg = currentMode.maxHp * (0.05 + Math.random() * 0.08);
          dmg += burstDmg;
          nextBurstTimeRef.current = now + 1200 + Math.random() * 1600;

          // Spawn floating combat text
          setFloatingTexts((prev) => [
            ...prev.slice(-4),
            {
              id: Date.now() + Math.random(),
              text: `-${Math.round(burstDmg)} CRIT!`,
              isCrit: true,
              x: 35 + Math.random() * 30,
              y: 35 + Math.random() * 20,
            },
          ]);
        }

        const newHp = Math.max(0, Math.round(prevHp - dmg));

        // Check if threshold reached
        if (newHp <= currentMode.retriDamage && !thresholdReachedTimeRef.current) {
          thresholdReachedTimeRef.current = now;
        }

        // Enemy bot check (if duel mode)
        if (
          currentMode.botReactionMs &&
          thresholdReachedTimeRef.current &&
          !botTriggeredRef.current
        ) {
          const timeSinceThreshold = now - thresholdReachedTimeRef.current;
          if (timeSinceThreshold >= currentMode.botReactionMs) {
            botTriggeredRef.current = true;
            setGameState('ended');
            playFailureSound(isMuted);
            setVerdict({
              type: 'stolen',
              title: 'STOLEN BY ENEMY JUNGLER!',
              description: `Enemy bot pressed Retribution at ${newHp.toLocaleString()} HP (${Math.round(
                timeSinceThreshold
              )}ms). You needed to react faster!`,
              hpAtPress: newHp,
              difference: newHp - currentMode.retriDamage,
              reactionMs: Math.round(timeSinceThreshold),
            });
            setStreak(0);
            setStats((s) => ({ total: s.total + 1, wins: s.wins }));
            return 0;
          }
        }

        return newHp;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, currentMode, isMuted]);

  // Spacebar and keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'd' || e.key === 'D' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleRetriPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRetriPress]);

  // Clean up floating text after delay
  useEffect(() => {
    if (floatingTexts.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingTexts((prev) => prev.slice(1));
    }, 900);
    return () => clearTimeout(timer);
  }, [floatingTexts]);

  const hpPercent = Math.max(0, Math.min(100, (currentHp / currentMode.maxHp) * 100));
  const retriThresholdPercent = (currentMode.retriDamage / currentMode.maxHp) * 100;
  const isThresholdReady = currentHp <= currentMode.retriDamage && gameState === 'running';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 select-none">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-paper tracking-tight flex items-center gap-2.5">
              <Zap className="w-6 h-6 text-tier-ss" />
              Retri Trainer
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full border border-tier-ss/40 text-tier-ss bg-tier-ss/10 font-mono">
              ml.cat Arcade
            </span>
          </div>
          <p className="text-xs text-mist">
            Practice smiting Dragon Turtle and Lord at the exact threshold. Press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-ink-raised border border-line text-paper font-mono text-[10px]">
              SPACE
            </kbd>{' '}
            or click the Retribution button!
          </p>
        </div>

        {/* Audio and Quick Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-panel border border-line bg-ink-raised text-mist hover:text-paper hover:bg-line/40 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-tier-a" />}
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MODES.map((mode) => {
          const isSelected = mode.id === selectedModeId;
          return (
            <button
              key={mode.id}
              onClick={() => {
                if (gameState === 'running') {
                  if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
                  setGameState('idle');
                }
                setSelectedModeId(mode.id);
                setCurrentHp(mode.maxHp);
                setVerdict(null);
              }}
              className={`p-3 rounded-panel border text-left flex flex-col gap-1 transition-all ${
                isSelected
                  ? 'bg-ink-raised border-tier-ss/80 shadow-sm'
                  : 'bg-ink/50 border-line text-mist hover:text-paper hover:bg-ink-raised/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-tier-ss' : 'text-paper'
                  }`}
                >
                  {mode.label}
                </span>
                <span className="text-[10px] font-mono text-mist">
                  {mode.retriDamage} dmg
                </span>
              </div>
              <p className="text-[11px] text-mist/80 line-clamp-2 leading-relaxed">
                {mode.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Game Arena */}
      <div className="relative overflow-hidden rounded-panel bg-ink-raised border border-line flex flex-col items-center justify-between p-6 sm:p-8 min-h-[460px]">
        {/* Floating Combat Texts */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {floatingTexts.map((f) => (
            <div
              key={f.id}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
              className="absolute font-mono font-bold text-xs sm:text-sm text-rose-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            >
              {f.text}
            </div>
          ))}
        </div>

        {/* Target Name & HP Indicator Bar */}
        <div className="w-full max-w-lg flex flex-col gap-2 z-10">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-sm text-paper font-semibold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-tier-a" />
              {currentMode.targetName}
            </span>
            <span className="font-mono text-paper font-bold">
              {currentHp.toLocaleString()} / {currentMode.maxHp.toLocaleString()} HP
            </span>
          </div>

          {/* Health Bar with Threshold Marker - Solid Game Bar, No Pulsing Neon */}
          <div className="relative w-full h-6 bg-ink rounded-full p-0.5 border border-line overflow-hidden">
            {/* Health fill - Clean solid game colors */}
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                currentHp <= currentMode.retriDamage
                  ? 'bg-amber-400'
                  : currentHp < currentMode.maxHp * 0.35
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />

            {/* Retribution Threshold Vertical Marker - Clean solid line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-300 z-10"
              style={{ left: `${retriThresholdPercent}%` }}
            >
              <div className="absolute -top-5 -left-3 text-[9px] font-mono text-amber-300 font-bold bg-ink px-1 py-0.2 rounded border border-line">
                {currentMode.retriDamage.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Target Monster Center Stage (Dragon Turtle Asset) */}
        <div className="relative my-4 flex items-center justify-center">
          <div
            className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-2 border-line bg-ink flex items-center justify-center transition-transform duration-75 ${
              isShaking ? '-translate-y-1' : ''
            }`}
          >
            <img
              src="/turtle.webp"
              alt="Dragon Turtle"
              className={`w-full h-full object-cover transition-all duration-100 ${
                isStriking ? 'brightness-125' : 'brightness-100'
              } ${gameState === 'running' ? 'scale-105' : 'scale-100 opacity-95'}`}
            />
            {/* Subtle bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-50 pointer-events-none" />
          </div>
        </div>

        {/* Verdict Result Overlay or Action Button */}
        <div className="w-full flex flex-col items-center gap-4 z-10">
          {verdict && (
            <div
              className={`w-full max-w-lg p-3.5 rounded-panel border flex flex-col gap-1.5 items-center text-center animate-in fade-in duration-100 ${
                verdict.type === 'perfect'
                  ? 'bg-tier-ss/10 border-tier-ss/50 text-paper'
                  : verdict.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-paper'
                  : 'bg-rose-950/30 border-rose-500/40 text-paper'
              }`}
            >
              <span
                className={`text-base font-bold tracking-tight ${
                  verdict.type === 'perfect'
                    ? 'text-tier-ss'
                    : verdict.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {verdict.title}
              </span>
              <p className="text-xs text-paper/90 leading-relaxed max-w-md">
                {verdict.description}
              </p>
              {verdict.reactionMs !== undefined && (
                <span className="text-[11px] font-mono text-mist">
                  Reaction Time: <strong>{verdict.reactionMs}ms</strong>
                </span>
              )}
            </div>
          )}

          {/* Authentic MLBB Spell Button - Solid circular physical button, zero glowing halo */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleRetriPress}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 transition-all transform active:scale-90 ${
                gameState === 'running'
                  ? isThresholdReady
                    ? 'border-amber-400'
                    : 'border-line hover:border-mist'
                  : 'border-line hover:border-mist'
              } bg-ink cursor-pointer`}
            >
              {/* Retri Asset Image */}
              <div className="w-full h-full rounded-full overflow-hidden bg-ink">
                <img
                  src="/retri.webp"
                  alt="Retribution Spell"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            </button>

            <span className="text-xs text-mist font-mono flex items-center gap-1.5">
              {gameState === 'running' ? (
                <>
                  Press <kbd className="px-1.5 py-0.5 rounded bg-ink border border-line text-paper font-bold">SPACE</kbd> to Smite!
                </>
              ) : (
                <>
                  Click Retri or press <kbd className="px-1.5 py-0.5 rounded bg-ink border border-line text-paper font-bold">SPACE</kbd> to Start
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Stats and Leaderboard Footer Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-panel bg-ink-raised border border-line text-center">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-mist uppercase tracking-wide flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-tier-s" /> Current Streak
          </span>
          <span className="font-mono text-xl font-bold text-paper">
            {streak}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-mist uppercase tracking-wide flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-tier-ss" /> Best Streak
          </span>
          <span className="font-mono text-xl font-bold text-tier-ss">
            {bestStreak}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-mist uppercase tracking-wide">
            Success Rate
          </span>
          <span className="font-mono text-xl font-bold text-paper">
            {stats.total > 0
              ? `${Math.round((stats.wins / stats.total) * 100)}%`
              : '0%'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-mist uppercase tracking-wide">
            Total Attempts
          </span>
          <span className="font-mono text-xl font-bold text-mist">
            {stats.total}
          </span>
        </div>
      </div>
    </div>
  );
};
