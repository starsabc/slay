import { describe, it, expect } from 'vitest';
import { resolveAutoQueue } from '../AutoResolver';
import type { ResolverContext } from '../AutoResolver';
import type { RuntimeCard } from '../../types';

function makeContext(hand: RuntimeCard[], overrides?: Partial<ResolverContext>): ResolverContext {
  return {
    hand: [...hand],
    discardPile: overrides?.discardPile ?? [],
    drawPile: overrides?.drawPile ?? [],
    onEffect: () => {
      return [];
    },
  };
}

describe('AutoResolver', () => {
  it('resolves simple hand in order', () => {
    const hand: RuntimeCard[] = [
      { instanceId: 'a', defId: 'strike' },
      { instanceId: 'b', defId: 'defend' },
    ];
    const result = resolveAutoQueue(hand, makeContext(hand));
    const playEvents = result.events.filter(e => e.type === 'card_played');
    expect(playEvents[0].cardInstanceId).toBe('a');
    expect(playEvents[1].cardInstanceId).toBe('b');
  });

  it('reorders priority before normal', () => {
    const hand: RuntimeCard[] = [
      { instanceId: 'a', defId: 'strike' },
      { instanceId: 'b', defId: 'parry' },
      { instanceId: 'c', defId: 'defend' },
    ];
    const result = resolveAutoQueue(hand, makeContext(hand));
    const playEvents = result.events.filter(e => e.type === 'card_played');
    // parry (priority) should be first
    expect(playEvents[0].cardInstanceId).toBe('b');
  });

  it('reverses remaining queue with star_reverse', () => {
    const hand: RuntimeCard[] = [
      { instanceId: 'a', defId: 'star_reverse' },
      { instanceId: 'b', defId: 'strike' },
      { instanceId: 'c', defId: 'defend' },
    ];
    const result = resolveAutoQueue(hand, makeContext(hand));
    const playEvents = result.events.filter(e => e.type === 'card_played');
    expect(playEvents[0].cardInstanceId).toBe('a'); // star_reverse first
    expect(playEvents[1].cardInstanceId).toBe('c'); // reversed
    expect(playEvents[2].cardInstanceId).toBe('b');
  });

  it('inserts discard top via returning_wind', () => {
    const discarded: RuntimeCard = { instanceId: 'discarded', defId: 'strike' };
    const hand: RuntimeCard[] = [
      { instanceId: 'a', defId: 'returning_wind' },
      { instanceId: 'b', defId: 'defend' },
    ];
    const ctx = makeContext(hand, { discardPile: [discarded] });
    const result = resolveAutoQueue(hand, ctx);
    const playEvents = result.events.filter(e => e.type === 'card_played');
    expect(playEvents[0].cardInstanceId).toBe('a');
    expect(playEvents[1].cardInstanceId).toBe('discarded');
    expect(playEvents[2].cardInstanceId).toBe('b');
  });

  it('inserts draw top via foresight', () => {
    const drawn: RuntimeCard = { instanceId: 'top_draw', defId: 'strike' };
    const hand: RuntimeCard[] = [
      { instanceId: 'a', defId: 'foresight' },
      { instanceId: 'b', defId: 'defend' },
    ];
    const ctx = makeContext(hand, { drawPile: [drawn] });
    const result = resolveAutoQueue(hand, ctx);
    const playEvents = result.events.filter(e => e.type === 'card_played');
    expect(playEvents[0].cardInstanceId).toBe('a');
    expect(playEvents[1].cardInstanceId).toBe('top_draw');
    expect(playEvents[2].cardInstanceId).toBe('b');
  });
});
