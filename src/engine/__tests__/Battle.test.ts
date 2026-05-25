import { describe, it, expect, beforeEach } from 'vitest';
import { BattleEngine } from '../Battle';
import type { BattleState } from '../../types';

function makeTestState(overrides?: Partial<BattleState>): BattleState {
  return {
    player: { maxHp: 50, currentHp: 50, block: 0 },
    enemies: [
      { id: 'e1', name: '山贼', maxHp: 20, currentHp: 20, block: 0, intent: { type: 'attack', value: 5 } },
    ],
    hand: [
      { instanceId: 'c1', defId: 'strike' },
      { instanceId: 'c2', defId: 'defend' },
    ],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    energy: 3,
    maxEnergy: 3,
    phase: 'player_turn',
    turnNumber: 1,
    ...overrides,
  };
}

describe('BattleEngine', () => {
  let engine: BattleEngine;

  beforeEach(() => {
    engine = new BattleEngine(makeTestState());
  });

  describe('startTurn', () => {
    it('sets phase to player_turn and restores energy', () => {
      const state = makeTestState({ phase: 'draw', energy: 0 });
      engine = new BattleEngine(state);
      engine.startTurn();
      const s = engine.getState();
      expect(s.phase).toBe('player_turn');
      expect(s.energy).toBe(3);
    });

    it('draws 5 cards from draw pile', () => {
      const state = makeTestState({
        phase: 'draw',
        hand: [],
        drawPile: Array.from({ length: 10 }, (_, i) => ({
          instanceId: `d${i}`,
          defId: 'strike',
        })),
      });
      engine = new BattleEngine(state);
      engine.startTurn();
      const s = engine.getState();
      expect(s.hand.length).toBe(5);
      expect(s.drawPile.length).toBe(5);
    });
  });

  describe('playCard (manual)', () => {
    it('deducts energy and moves card to discard', () => {
      const result = engine.playCard('c1');
      expect(result).not.toBeNull();
      const s = engine.getState();
      expect(s.energy).toBe(2);
      expect(s.hand).toHaveLength(1);
      expect(s.discardPile).toHaveLength(1);
    });

    it('applies manual damage to enemy', () => {
      const result = engine.playCard('c1', 'e1');
      expect(result?.events.some(e => e.type === 'damage')).toBe(true);
      const s = engine.getState();
      expect(s.enemies[0].currentHp).toBe(14); // 20 - 6
    });

    it('returns null on insufficient energy', () => {
      const state = makeTestState({ energy: 0 });
      engine = new BattleEngine(state);
      expect(engine.playCard('c1')).toBeNull();
    });
  });

  describe('endTurn + autoResolve', () => {
    it('auto-plays all remaining hand cards', () => {
      engine.endTurn();
      expect(engine.getState().hand).toHaveLength(0);
    });

    it('transitions to enemy_turn after auto resolve', () => {
      engine.endTurn();
      expect(engine.getState().phase).toBe('enemy_turn');
    });
  });

  describe('enemyTurn', () => {
    it('enemy deals damage to player', () => {
      engine.endTurn();
      engine.enemyTurn();
      expect(engine.getState().player.currentHp).toBeLessThan(50);
    });

    it('block absorbs damage first', () => {
      const state = makeTestState({
        player: { maxHp: 50, currentHp: 50, block: 6 },
      });
      engine = new BattleEngine(state);
      engine.endTurn();
      engine.enemyTurn();
      const s = engine.getState();
      // Auto-resolve defend adds 1 block (total 7),
      // enemy deals 5 damage (block absorbs it, HP untouched),
      // block resets to 0 at end of enemy turn per spec.
      expect(s.player.block).toBe(0);
      expect(s.player.currentHp).toBe(50);
    });
  });

  describe('victory/defeat', () => {
    it('sets victory when all enemies defeated', () => {
      const state = makeTestState({
        enemies: [{ id: 'e1', name: '山贼', maxHp: 20, currentHp: 1, block: 0, intent: { type: 'attack', value: 5 } }],
        hand: [{ instanceId: 'c1', defId: 'strike' }],
      });
      engine = new BattleEngine(state);
      engine.playCard('c1', 'e1');
      expect(engine.getState().phase).toBe('victory');
    });

    it('sets defeat when player HP reaches 0', () => {
      const state = makeTestState({
        player: { maxHp: 50, currentHp: 4, block: 0 },
      });
      engine = new BattleEngine(state);
      engine.endTurn();
      engine.enemyTurn();
      expect(engine.getState().phase).toBe('defeat');
    });
  });
});
