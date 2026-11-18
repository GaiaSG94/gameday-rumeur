export type Statement = {
  speaker: number;
  about: number;
  claim: 'honest' | 'liar';
};

export type RumeurPuzzle = {
  day: string;
  villagers: string[];
  statements: Statement[];
  starter: number;
  liarCount: number;
};

const VILLAGERS = ['Ada', 'Boris', 'Clara', 'Dmitri', 'Elsa'];

export const dayKeyUTC = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

export const dailySeed = (day: string): number => {
  let hash = 2166136261;
  const input = 'rumeur:' + day;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const countConsistent = (statements: Statement[], liarCount: number): number => {
  let total = 0;
  for (let mask = 0; mask < 32; mask++) {
    const liars = [0, 1, 2, 3, 4].map((i) => Boolean((mask >> i) & 1));
    if (liars.filter(Boolean).length !== liarCount) continue;
    const ok = statements.every((s) => {
      const claimTrue = s.claim === 'liar' ? liars[s.about] : !liars[s.about];
      return !liars[s.speaker] === claimTrue;
    });
    if (ok) total++;
  }
  return total;
};

const buildStatements = (rand: () => number, liars: boolean[]): Statement[] =>
  [0, 1, 2, 3, 4].map((speaker) => {
    const offset = 1 + Math.floor(rand() * 4);
    const about = (speaker + offset) % 5;
    const truth: 'honest' | 'liar' = liars[about] ? 'liar' : 'honest';
    const claim = !liars[speaker] ? truth : truth === 'liar' ? 'honest' : 'liar';
    return { speaker, about, claim };
  });

export const generateRumeur = (day: string): RumeurPuzzle => {
  const rand = mulberry32(dailySeed(day));
  for (let attempt = 0; attempt < 500; attempt++) {
    const liarCount = rand() < 0.6 ? 1 : 2;
    const order = [0, 1, 2, 3, 4].sort(() => rand() - 0.5);
    const liars = [false, false, false, false, false];
    for (let i = 0; i < liarCount; i++) liars[order[i] ?? 0] = true;
    const statements = buildStatements(rand, liars);
    if (countConsistent(statements, liarCount) === 1) {
      const starter = liars.findIndex((isLiar) => isLiar);
      return { day, villagers: VILLAGERS, statements, starter, liarCount };
    }
  }
  const liars = [true, false, false, false, false];
  const statements = buildStatements(mulberry32(1), liars);
  return { day, villagers: VILLAGERS, statements, starter: 0, liarCount: 1 };
};

export const accusationHolds = (puzzle: RumeurPuzzle, accused: number): boolean =>
  accused === puzzle.starter;

export const statementText = (s: Statement, villagers: string[]): string =>
  `${villagers[s.speaker]}: "${villagers[s.about]} is ${s.claim === 'liar' ? 'lying' : 'telling the truth'}."`;
