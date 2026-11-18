import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#15251c] px-6 text-center text-[#d9ead3]">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#9ef0a5]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#7fae8f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#9ef0a5]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#7fae8f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#9ef0a5]" />
      </div>
      <h1 className="text-3xl font-black tracking-[0.3em] text-[#9ef0a5]">RUMEUR</h1>
      <p className="max-w-[240px] text-[13px] leading-snug text-[#7fae8f]">
        Five villagers, one lie too many. Who started it? Hi {context.username ?? 'stranger'}.
      </p>
      <button
        onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        className="mt-2 rounded-full bg-[#9ef0a5] px-8 py-2.5 text-sm font-black uppercase tracking-widest text-[#15251c] transition-transform active:scale-[0.98]"
      >
        Listen
      </button>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
