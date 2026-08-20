export type Rng = () => number;

export function rand(min: number, max: number, rng: Rng = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[], rng: Rng = Math.random): T {
  const item = arr[rand(0, arr.length - 1, rng)];
  if (item === undefined) throw new Error('pick() called on an empty array');
  return item;
}

/** Fisher-Yates, en place (mêmes garanties que l'implémentation d'origine). */
export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(0, i, rng);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}
