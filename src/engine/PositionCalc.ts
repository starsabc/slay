/**
 * 计算自动打出时每个位置的效果倍率。
 * 最左最高 ~150%，最右最低 ~90%，线性均匀分布。
 */
export function calculatePositionMultipliers(handSize: number): number[] {
  if (handSize <= 1) return [1.0];

  const maxMultiplier = 1.5;
  const minMultiplier = 0.9;
  const result: number[] = [];

  for (let i = 0; i < handSize; i++) {
    const t = i / (handSize - 1);
    const multiplier = maxMultiplier + (minMultiplier - maxMultiplier) * t;
    result.push(Math.round(multiplier * 100) / 100);
  }

  return result;
}
