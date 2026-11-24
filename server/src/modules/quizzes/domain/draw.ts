/** Picks `count` distinct ids in random order (Fisher-Yates). `random` is injectable for tests. */
export function drawQuestionIds(ids: readonly string[], count: number, random: () => number = Math.random): string[] {
  const pool = [...ids];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [pool[index], pool[swapWith]] = [pool[swapWith] as string, pool[index] as string];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
