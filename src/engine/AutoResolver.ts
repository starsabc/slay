import type { RuntimeCard, BattleEvent, EffectValues } from '../types';
import { getCardDef } from '../data/cards';

export interface ResolverContext {
  hand: RuntimeCard[];
  discardPile: RuntimeCard[];
  drawPile: RuntimeCard[];
  onEffect: (card: RuntimeCard, effect: EffectValues) => BattleEvent[];
}

export interface ResolverResult {
  events: BattleEvent[];
  remainingHand: RuntimeCard[];
}

export function resolveAutoQueue(
  initialHand: RuntimeCard[],
  context: ResolverContext,
): ResolverResult {
  const events: BattleEvent[] = [];
  const queue = buildInitialQueue([...initialHand]);
  const visited = new Set<string>();

  for (let i = 0; i < queue.length; i++) {
    const card = queue[i];
    if (visited.has(card.instanceId)) continue;
    visited.add(card.instanceId);

    const def = getCardDef(card.defId);
    events.push({ type: 'card_played', cardInstanceId: card.instanceId, isAuto: true });

    // Handle special ordering cards
    switch (card.defId) {
      case 'star_reverse': {
        // Reverse everything after current position
        const before = queue.slice(0, i + 1);
        const after = queue.slice(i + 1).reverse();
        queue.length = 0;
        queue.push(...before, ...after);
        break;
      }
      case 'shadow_shift': {
        // Move rightmost (last in queue) to right after current position
        if (queue.length > i + 1) {
          const rightmost = queue.pop()!;
          queue.splice(i + 1, 0, rightmost);
        }
        break;
      }
      case 'returning_wind': {
        // Insert discard pile top right after current position
        if (context.discardPile.length > 0) {
          const inserted = context.discardPile.pop()!;
          queue.splice(i + 1, 0, inserted);
        }
        break;
      }
      case 'foresight': {
        // Insert draw pile top right after current position
        if (context.drawPile.length > 0) {
          const inserted = context.drawPile.pop()!;
          queue.splice(i + 1, 0, inserted);
        }
        break;
      }
      default: {
        // Normal card: apply auto effect
        const scaledEffect = scaleAutoEffect(def.autoEffect, def, initialHand.length, i, queue.length);
        const effectEvents = context.onEffect(card, scaledEffect);
        events.push(...effectEvents);
        break;
      }
    }
  }

  // Remaining hand = cards that weren't in the initial resolved set
  const initialIds = new Set(initialHand.map(c => c.instanceId));
  const remainingHand = context.hand.filter(c => !initialIds.has(c.instanceId));

  return { events, remainingHand };
}

function buildInitialQueue(hand: RuntimeCard[]): RuntimeCard[] {
  const priority: RuntimeCard[] = [];
  const normal: RuntimeCard[] = [];
  const delay: RuntimeCard[] = [];

  for (const card of hand) {
    const def = getCardDef(card.defId);
    if (def.orderTag === 'priority') priority.push(card);
    else if (def.orderTag === 'delay') delay.push(card);
    else normal.push(card);
  }

  return [...priority, ...normal, ...delay];
}

function scaleAutoEffect(
  effect: EffectValues,
  _def: ReturnType<typeof getCardDef>,
  originalHandSize: number,
  currentIndex: number,
  queueSize: number,
): EffectValues {
  // Position multiplier based on current position in dynamic queue
  const multiplier = calcPositionMultiplier(currentIndex, queueSize);
  const scaled: EffectValues = {};

  for (const key of Object.keys(effect) as (keyof EffectValues)[]) {
    const base = effect[key];
    if (base !== undefined && base !== 0) {
      scaled[key] = Math.floor(base * originalHandSize * multiplier);
    } else if (base === 0 && key === 'block') {
      // meditation special case: block 0 means use handSize
      scaled[key] = Math.floor(originalHandSize * multiplier);
    } else if (base !== undefined) {
      scaled[key] = base;
    }
  }

  return scaled;
}

export function calcPositionMultiplier(idx: number, total: number): number {
  if (total <= 1) return 1.0;
  const maxM = 1.5, minM = 0.9;
  const t = idx / (total - 1);
  return Math.round((maxM + (minM - maxM) * t) * 100) / 100;
}
