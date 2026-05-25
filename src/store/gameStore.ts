import { create } from 'zustand';
import type { BattleState, BattleEvent, RuntimeCard } from '../types';
import { BattleEngine, generateInstanceId } from '../engine/Battle';
import { getInitialDeck, getCardDef } from '../data/cards';

interface GameStore {
  battleState: BattleState | null;
  battleEngine: BattleEngine | null;
  events: BattleEvent[];

  initBattle: () => void;
  startTurn: () => void;
  playCard: (instanceId: string, targetId?: string) => boolean;
  endTurn: () => void;
  enemyTurn: () => void;
  clearEvents: () => void;
  getCardDef: (defId: string) => ReturnType<typeof getCardDef>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  battleState: null,
  battleEngine: null,
  events: [],

  initBattle: () => {
    const deck = getInitialDeck();
    const drawPile: RuntimeCard[] = deck.map(d => ({
      instanceId: generateInstanceId(),
      defId: d.id,
    }));

    const initialState: BattleState = {
      player: { maxHp: 50, currentHp: 50, block: 0 },
      enemies: [
        { id: 'e1', name: '山贼', maxHp: 20, currentHp: 20, block: 0, intent: { type: 'attack', value: 5 } },
      ],
      hand: [],
      drawPile,
      discardPile: [],
      exhaustPile: [],
      energy: 3,
      maxEnergy: 3,
      phase: 'draw',
      turnNumber: 0,
    };

    const engine = new BattleEngine(initialState);
    set({ battleEngine: engine, events: [] });

    const events = engine.startTurn();
    set({ battleState: engine.getState(), events });
  },

  startTurn: () => {
    const engine = get().battleEngine;
    if (!engine) return;
    const events = engine.startTurn();
    set({ battleState: engine.getState(), events });
  },

  playCard: (instanceId, targetId) => {
    const engine = get().battleEngine;
    if (!engine) return false;
    const result = engine.playCard(instanceId, targetId);
    if (!result) return false;
    set({ battleState: engine.getState(), events: result.events });
    return true;
  },

  endTurn: () => {
    const engine = get().battleEngine;
    if (!engine) return;
    const events = engine.endTurn();
    set({ battleState: engine.getState(), events });
  },

  enemyTurn: () => {
    const engine = get().battleEngine;
    if (!engine) return;
    const events = engine.enemyTurn();
    set({ battleState: engine.getState(), events });
  },

  clearEvents: () => set({ events: [] }),

  getCardDef: (defId) => getCardDef(defId),
}));
