import { describe, it, expect } from 'vitest';
import { calculatePositionMultipliers } from '../PositionCalc';

describe('calculatePositionMultipliers', () => {
  it('returns [1.0] for a single card', () => {
    expect(calculatePositionMultipliers(1)).toEqual([1.0]);
  });

  it('returns correct 5-card multipliers', () => {
    const result = calculatePositionMultipliers(5);
    expect(result).toHaveLength(5);
    expect(result[0]).toBeCloseTo(1.5, 2);
    expect(result[4]).toBeCloseTo(0.9, 2);
  });

  it('is monotonically decreasing left to right', () => {
    const result = calculatePositionMultipliers(7);
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeLessThan(result[i - 1]);
    }
  });

  it('returns [1.0] for zero cards (edge case)', () => {
    expect(calculatePositionMultipliers(0)).toEqual([1.0]);
  });

  it('correctly calculates 3-card multipliers', () => {
    const result = calculatePositionMultipliers(3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(1.5, 2);
    expect(result[1]).toBeCloseTo(1.2, 2);
    expect(result[2]).toBeCloseTo(0.9, 2);
  });

  it('correctly calculates 2-card multipliers (minimum multi-card case)', () => {
    const result = calculatePositionMultipliers(2);
    expect(result).toEqual([1.5, 0.9]);
  });

  it('all values stay within [0.9, 1.5] range for large hand', () => {
    const result = calculatePositionMultipliers(20);
    for (const val of result) {
      expect(val).toBeGreaterThanOrEqual(0.9);
      expect(val).toBeLessThanOrEqual(1.5);
    }
  });
});
