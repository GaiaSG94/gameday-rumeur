import assert from 'node:assert/strict';
import { test } from 'node:test';

import { countConsistent, dailySeed, generateRumeur, statementText } from './puzzle.ts';

test('seed deterministe', () => {
  assert.equal(dailySeed('2026-12-01'), dailySeed('2026-12-01'));
});

test('le village du jour est deterministe', () => {
  const a = generateRumeur('2026-12-01');
  const b = generateRumeur('2026-12-01');
  assert.deepEqual(a.statements, b.statements);
  assert.equal(a.starter, b.starter);
});

test('exactement une attribution des roles est coherente', () => {
  for (const day of ['2026-12-01', '2026-12-04', '2026-12-08']) {
    const puzzle = generateRumeur(day);
    assert.equal(countConsistent(puzzle.statements, puzzle.liarCount), 1, day);
  }
});

test('chaque villageois parle une fois, jamais de lui-meme', () => {
  const puzzle = generateRumeur('2026-12-02');
  const speakers = puzzle.statements.map((s) => s.speaker).sort();
  assert.deepEqual(speakers, [0, 1, 2, 3, 4]);
  assert.ok(puzzle.statements.every((s) => s.speaker !== s.about));
});

test('les declarations sont lisibles', () => {
  const puzzle = generateRumeur('2026-12-01');
  const text = puzzle.statements.map((s) => statementText(s, puzzle.villagers))[0];
  assert.match(text, /: ".* (is lying|is telling the truth)\."/);
});
