# Rumeur

A daily social-deduction puzzle for Reddit, built on [Devvit Web](https://developers.reddit.com/).

Every morning the village of five wakes up with a fresh rumor. Each villager makes one
statement about another ("Boris is lying", "Clara is telling the truth"). You know exactly
how many villagers lie today. Honest villagers always tell the truth; liars never do.
Work out the roles, then point at the villager who started the rumor.

## How to play

1. Read the five statements.
2. Remember the liar count shown at the top.
3. Tap the villager who started the rumor, then **Accuse**.

One village per day, the same for everyone; the puzzle is generated so the role
assignment is unique. Streaks stored per user in Redis.

## Stack

- React 19 + Tailwind 4 + Vite (client inside a Reddit post)
- Hono server on Devvit (`/api/init`, `/api/submit`), Redis persistence
- Deterministic daily generation (UTC seed), uniqueness brute-forced (32 role sets),
  unit-tested

## Development

```bash
npm install
npm run dev        # playtest on Reddit
npm test           # unit tests
npm run type-check # types + lint
npm run build
```

## Submission (Reddit's Game of the Day Hackathon)

- App listing: `developers.reddit.com/apps/gameday-rumeur` (private until judging ends)
- Demo post: public test subreddit, post running the game
