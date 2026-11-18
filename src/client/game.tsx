import './index.css';

import { useCallback, useEffect, useState } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { statementText } from '../shared/puzzle';

type Statement = { speaker: number; about: number; claim: 'honest' | 'liar' };

type Init = {
  day: string;
  username: string;
  streak: number;
  solvedToday: boolean;
  startedAt: number;
  villagers: string[];
  statements: Statement[];
  liarCount: number;
};

type Result = { won: boolean; streak: number; elapsedMs: number; starter: number; villagers: string[] };

const App = () => {
  const [init, setInit] = useState<Init | null>(null);
  const [accused, setAccused] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/init');
      const data = await res.json();
      if (data.status === 'error') throw new Error(data.message);
      setInit(data);
      setAccused(null);
      setResult(null);
      setSeconds(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load failed');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const submit = async () => {
    if (accused === null || !init) return;
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accused, startedAt: Date.now() - seconds * 1000 }),
      });
      const data = await res.json();
      if (data.status === 'error') throw new Error(data.message);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'submit failed');
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#15251c] text-[#d9ead3]">
        <p>{error}</p>
      </div>
    );
  }
  if (!init) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#15251c] text-[#7fae8f]">
        <p className="animate-pulse">Gathering the villagers…</p>
      </div>
    );
  }

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-[#15251c] px-4 py-6 text-[#d9ead3]">
      <header className="flex w-full max-w-md items-center justify-between">
        <h1 className="text-xl font-black tracking-[0.3em] text-[#9ef0a5]">RUMEUR</h1>
        <div className="text-sm font-semibold text-[#7fae8f]">
          <span className="mr-3">{clock}</span>
          <span>🔥 {result ? result.streak : init.streak}</span>
        </div>
      </header>
      <p className="max-w-md text-center text-[13px] leading-snug text-[#7fae8f]">
        Exactly <span className="font-bold text-[#d9ead3]">{init.liarCount}</span> villager
        {init.liarCount > 1 ? 's lie' : ' lies'}. Honest villagers tell the truth, liars do not.
        Point at the one who started today's rumor.
      </p>
      <ul className="w-full max-w-md space-y-2">
        {init.statements.map((s, i) => (
          <li
            key={i}
            className="rounded-xl border-2 border-[#2c4435] bg-[#1d3327] p-3 text-[13px] text-[#d9ead3]"
          >
            {statementText(s, init.villagers)}
          </li>
        ))}
      </ul>
      <div className="flex w-full max-w-md flex-wrap justify-center gap-2">
        {init.villagers.map((name, i) => (
          <button
            key={name}
            onClick={() => setAccused(i)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
              accused === i
                ? 'border-[#9ef0a5] bg-[#9ef0a5] text-[#15251c]'
                : 'border-[#2c4435] bg-[#1d3327] text-[#d9ead3]'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      {!result ? (
        <button
          onClick={() => void submit()}
          disabled={accused === null}
          className="w-full max-w-md rounded-full bg-[#9ef0a5] py-3 text-base font-black uppercase tracking-widest text-[#15251c] transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          Accuse
        </button>
      ) : (
        <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border-2 border-[#2c4435] bg-[#1d3327] p-5 text-center">
          <p className="text-2xl font-black tracking-widest">
            {result.won ? 'RUMOR CRACKED' : 'WRONG VILLAGER'}
          </p>
          <p className="text-sm text-[#7fae8f]">
            {result.won
              ? `The rumor started with ${result.villagers[result.starter]} — streak 🔥 ${result.streak}.`
              : `It was ${result.villagers[result.starter]}. Come back tomorrow for a new village.`}
          </p>
          <button
            onClick={() => setResult(null)}
            className="rounded-full border-2 border-[#9ef0a5] px-6 py-2 text-sm font-bold uppercase tracking-widest text-[#9ef0a5]"
          >
            Back to the square
          </button>
        </div>
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
