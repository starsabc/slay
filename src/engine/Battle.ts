import type {
  BattleState, BattleEvent, RuntimeCard, EffectValues,
} from '../types';
import { calculatePositionMultipliers } from './PositionCalc';
import { getCardDef } from '../data/cards';

let nextInstanceId = 1;
export function generateInstanceId(): string {
  return `inst_${nextInstanceId++}`;
}

interface PlayResult {
  events: BattleEvent[];
}

const HAND_SIZE = 5;

export class BattleEngine {
  private state: BattleState;

  constructor(initialState: BattleState) {
    this.state = structuredClone(initialState);
  }

  getState(): BattleState {
    return structuredClone(this.state);
  }

  private emit(events: BattleEvent[], event: BattleEvent) {
    events.push(event);
  }

  startTurn(): BattleEvent[] {
    const events: BattleEvent[] = [];
    const prev = this.state.phase;
    this.state.phase = 'draw';
    this.emit(events, { type: 'phase_change', from: prev, to: 'draw' });

    this.state.energy = this.state.maxEnergy;

    // Reshuffle discard into draw pile if needed
    if (this.state.drawPile.length < HAND_SIZE) {
      this.state.drawPile.push(...this.state.discardPile.splice(0));
      this.shuffleArray(this.state.drawPile);
    }

    // Draw cards
    const drawCount = Math.min(HAND_SIZE, this.state.drawPile.length);
    const drawn = this.state.drawPile.splice(-drawCount, drawCount);
    if (this.state.hand.length > 0) {
      this.state.discardPile.push(...this.state.hand);
    }
    this.state.hand = drawn;
    if (drawCount > 0) {
      this.emit(events, { type: 'draw', count: drawCount });
    }

    this.state.phase = 'player_turn';
    this.emit(events, { type: 'phase_change', from: 'draw', to: 'player_turn' });

    return events;
  }

  playCard(instanceId: string, targetId?: string): PlayResult | null {
    if (this.state.phase !== 'player_turn') return null;
    const cardIdx = this.state.hand.findIndex(c => c.instanceId === instanceId);
    if (cardIdx === -1) return null;

    const runtimeCard = this.state.hand[cardIdx];
    const cardDef = getCardDef(runtimeCard.defId);

    if (this.state.energy < cardDef.cost) return null;

    const events: BattleEvent[] = [];
    this.state.energy -= cardDef.cost;

    this.applyEffect(events, cardDef.manualEffect, targetId);

    this.state.hand.splice(cardIdx, 1);
    this.state.discardPile.push(runtimeCard);

    this.emit(events, { type: 'card_played', cardInstanceId: instanceId, isAuto: false });
    this.checkVictory(events);

    return { events };
  }

  endTurn(): BattleEvent[] {
    const events: BattleEvent[] = [];
    const prev = this.state.phase;
    this.state.phase = 'auto_resolve';
    this.emit(events, { type: 'phase_change', from: prev, to: 'auto_resolve' });

    const handSize = this.state.hand.length;
    if (handSize === 0) {
      this.transitionToEnemy(events);
      return events;
    }

    const multipliers = calculatePositionMultipliers(handSize);
    const resolvedCards = this.resolveAutoOrder([...this.state.hand]);
    const resolvedIds = new Set(resolvedCards.map(c => c.instanceId));

    resolvedCards.forEach((rc, idx) => {
      const def = getCardDef(rc.defId);
      const multiplier = multipliers[idx] ?? 1.0;

      const scaledEffect: EffectValues = {};
      for (const key of Object.keys(def.autoEffect) as (keyof EffectValues)[]) {
        const base = def.autoEffect[key];
        if (base !== undefined && base !== 0) {
          scaledEffect[key] = Math.floor(base * handSize * multiplier);
        } else if (base === 0 && key === 'block') {
          // meditation special case: block 0 means use handSize
          scaledEffect[key] = Math.floor(handSize * multiplier);
        } else if (base !== undefined) {
          scaledEffect[key] = base;
        }
      }

      this.applyEffect(events, scaledEffect, undefined);
      this.emit(events, { type: 'card_played', cardInstanceId: rc.instanceId, isAuto: true });
    });

    // Only discard the originally resolved cards; keep cards drawn during auto_resolve
    const played: RuntimeCard[] = [];
    this.state.hand = this.state.hand.filter(c => {
      if (resolvedIds.has(c.instanceId)) {
        played.push(c);
        return false;
      }
      return true;
    });
    this.state.discardPile.push(...played);

    this.checkVictory(events);
    this.transitionToEnemy(events);

    return events;
  }

  enemyTurn(): BattleEvent[] {
    const events: BattleEvent[] = [];

    for (const enemy of this.state.enemies) {
      if (enemy.currentHp <= 0) continue;
      if (enemy.intent.type === 'attack') {
        this.dealDamageToPlayer(events, enemy.intent.value);
      }
    }

    this.state.player.block = 0;

    if (this.state.phase !== 'defeat') {
      this.state.turnNumber++;
      events.push(...this.startTurn());
    }

    return events;
  }

  // === Private methods ===

  private resolveAutoOrder(hand: RuntimeCard[]): RuntimeCard[] {
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

  private applyEffect(events: BattleEvent[], effect: EffectValues, targetId?: string) {
    if (effect.damage && effect.damage > 0) {
      if (targetId) {
        this.dealDamageToEnemy(events, effect.damage, targetId);
      } else {
        const aliveEnemies = this.state.enemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length > 0) {
          const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          this.dealDamageToEnemy(events, effect.damage, target.id);
        }
      }
    }

    if (effect.block && effect.block > 0) {
      this.state.player.block += effect.block;
      this.emit(events, { type: 'block', targetId: 'player', amount: effect.block });
    }

    if (effect.draw && effect.draw > 0) {
      const needDraw = effect.draw;
      if (this.state.drawPile.length < needDraw) {
        this.state.drawPile.push(...this.state.discardPile.splice(0));
        this.shuffleArray(this.state.drawPile);
      }
      const actual = Math.min(needDraw, this.state.drawPile.length);
      const drawn = this.state.drawPile.splice(-actual, actual);
      this.state.hand.push(...drawn);
      if (actual > 0) {
        this.emit(events, { type: 'draw', count: actual });
      }
    }
  }

  private dealDamageToEnemy(events: BattleEvent[], amount: number, enemyId: string) {
    const enemy = this.state.enemies.find(e => e.id === enemyId);
    if (!enemy || enemy.currentHp <= 0) return;

    const originalAmount = amount;
    if (enemy.block > 0) {
      const blocked = Math.min(enemy.block, amount);
      enemy.block -= blocked;
      amount -= blocked;
    }
    enemy.currentHp -= amount;
    this.emit(events, { type: 'damage', targetId: enemyId, amount: originalAmount });

    if (enemy.currentHp <= 0) {
      enemy.currentHp = 0;
      this.emit(events, { type: 'enemy_defeated', enemyId });
    }
  }

  private dealDamageToPlayer(events: BattleEvent[], amount: number) {
    let remaining = amount;
    if (this.state.player.block > 0) {
      const blocked = Math.min(this.state.player.block, remaining);
      this.state.player.block -= blocked;
      remaining -= blocked;
    }
    this.state.player.currentHp -= remaining;
    this.emit(events, { type: 'damage', targetId: 'player', amount });

    if (this.state.player.currentHp <= 0) {
      this.state.player.currentHp = 0;
      this.state.phase = 'defeat';
      this.emit(events, { type: 'player_defeated' });
      this.emit(events, { type: 'phase_change', from: 'enemy_turn', to: 'defeat' });
    }
  }

  private checkVictory(events: BattleEvent[]) {
    if (this.state.enemies.every(e => e.currentHp <= 0)) {
      const prev = this.state.phase;
      this.state.phase = 'victory';
      this.emit(events, { type: 'phase_change', from: prev, to: 'victory' });
    }
  }

  private transitionToEnemy(events: BattleEvent[]) {
    if (this.state.phase === 'victory' || this.state.phase === 'defeat') return;
    const prev = this.state.phase;
    this.state.phase = 'enemy_turn';
    this.emit(events, { type: 'phase_change', from: prev, to: 'enemy_turn' });
  }

  private shuffleArray<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
