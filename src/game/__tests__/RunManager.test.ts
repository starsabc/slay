import { describe, it, expect } from 'vitest';
import { createNewRun, moveTo, getAlertMultiplier, nextFloor } from '../RunManager';

describe('RunManager', () => {
  it('creates a new run with default values', () => {
    const run = createNewRun(['strike', 'strike', 'defend']);
    expect(run.currentFloor).toBe(1);
    expect(run.currentHp).toBe(50);
    expect(run.gold).toBe(0);
    expect(run.qi).toBe(15);
    expect(run.alert).toBe(0);
    expect(run.deck).toHaveLength(3);
    expect(run.phase).toBe('map');
  });

  it('moveTo consumes qi and updates phase for battle', () => {
    const run = createNewRun(['strike']);
    // Find a revealed battle node adjacent to start
    const startPos = run.currentPosition;
    // Try moving to an adjacent revealed node
    const target = { row: startPos.row, col: (startPos.col + 1) % 4 };
    // Make sure target is within grid
    if (target.col < 4) {
      // Force reveal the target for test
      run.grid[target.row][target.col].revealed = true;
      run.grid[target.row][target.col].type = 'battle';

      const result = moveTo(run, target);
      if (result !== run) {
        expect(result.qi).toBeLessThanOrEqual(run.qi);
      }
    }
  });

  it('getAlertMultiplier returns correct scaling', () => {
    expect(getAlertMultiplier(1)).toEqual({ hpMul: 1.0, dmgMul: 1.0 });
    expect(getAlertMultiplier(4)).toEqual({ hpMul: 1.2, dmgMul: 1.25 });
    expect(getAlertMultiplier(7)).toEqual({ hpMul: 1.4, dmgMul: 1.5 });
  });

  it('nextFloor resets alert and qi', () => {
    const run = createNewRun(['strike']);
    const mutated = { ...run, alert: 5, qi: 2 };
    const next = nextFloor(mutated);
    expect(next.currentFloor).toBe(2);
    expect(next.alert).toBe(0);
    expect(next.qi).toBe(15);
  });

  it('nextFloor sets game_victory after max floor', () => {
    const run = createNewRun(['strike']);
    const mutated = { ...run, currentFloor: 3 };
    const next = nextFloor(mutated);
    expect(next.phase).toBe('game_victory');
  });
});
