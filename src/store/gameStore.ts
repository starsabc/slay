import { create } from 'zustand';
import type { BattleState, BattleEvent, RuntimeCard, RunState, BattleReward } from '../types';
import { BattleEngine, generateInstanceId } from '../engine/Battle';
import { getInitialDeck, getCardDef } from '../data/cards';
import { createEnemy, getDefaultBattle } from '../data/enemies';
import {
  createNewRun,
  moveTo as runMoveTo,
  applyBattleReward,
  acceptRewardCard,
  skipRewardCards,
  returnToMap,
  addRelic,
  removeRelic,
  nextFloor,
} from '../game/RunManager';

const REWARD_CARD_POOL = [
  'heavy_strike', 'parry', 'meditation', 'wound_seal', 'detonate',
  'poison_dart', 'swallow_dash', 'flurry', 'flower_jam', 'shadow_shift',
  'returning_wind', 'star_reverse', 'earth_shrink', 'throat_cut',
  'golden_bell', 'reflect', 'sky_net',
];

function pickRewardCards(count: number): string[] {
  const shuffled = [...REWARD_CARD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateBattleReward(): BattleReward {
  return {
    gold: 20 + Math.floor(Math.random() * 20),
    qiRestore: 5,
    cardChoices: pickRewardCards(3),
    relicChoice: null,
  };
}

interface GameStore {
  battleState: BattleState | null;
  battleEngine: BattleEngine | null;
  events: BattleEvent[];
  runState: RunState | null;

  initBattle: (deckIds?: string[]) => void;
  startTurn: () => void;
  playCard: (instanceId: string, targetId?: string) => boolean;
  endTurn: () => void;
  enemyTurn: () => void;
  clearEvents: () => void;
  getCardDef: (defId: string) => ReturnType<typeof getCardDef>;

  initRun: (deckIds: string[]) => void;
  movePlayer: (to: { row: number; col: number }) => void;
  handleBattleVictory: (reward: BattleReward) => void;
  acceptReward: (cardId: string) => void;
  skipReward: () => void;
  backToMap: () => void;
  acquireRelic: (relicId: string) => boolean;
  loseRelic: (relicId: string) => void;
  advanceFloor: () => void;
  gainGold: (amount: number) => void;
  healPlayerMeta: (amount: number) => void;
  increaseMaxHp: (amount: number) => void;
  damagePlayerMeta: (amount: number) => void;
  gainQi: (amount: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  battleState: null,
  battleEngine: null,
  events: [],
  runState: null,

  initBattle: (deckIds?: string[]) => {
    const { battleEngine, battleState } = get();
    // Guard: don't re-init if a battle is already active
    if (battleEngine && battleState && battleState.phase !== 'victory' && battleState.phase !== 'defeat') {
      return;
    }

    const ids = deckIds ?? getInitialDeck().map(d => d.id);
    const deck = ids.map(id => getCardDef(id));

    const drawPile: RuntimeCard[] = deck.map(d => ({
      instanceId: generateInstanceId(),
      defId: d.id,
    }));

    const enemyList = getDefaultBattle().map(({ templateId, instanceNum }) =>
      createEnemy(templateId, instanceNum)
    );

    const initialState: BattleState = {
      player: { maxHp: 50, currentHp: 50, block: 0 },
      enemies: enemyList,
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

  // === Phase 3: RunState actions ===

  initRun: (deckIds: string[]) => {
    const runState = createNewRun(deckIds);
    set({ runState });
  },

  movePlayer: (to: { row: number; col: number }) => {
    const state = get().runState;
    if (!state) return;

    const newState = runMoveTo(state, to);
    set({ runState: newState });

    // If the move resulted in a battle, initialize the battle engine
    if (newState.phase === 'battle') {
      get().initBattle(newState.deck);
    }
  },

  handleBattleVictory: (reward: BattleReward) => {
    const state = get().runState;
    if (!state) return;

    const newState = applyBattleReward(state, reward);
    set({ runState: newState });
  },

  acceptReward: (cardId: string) => {
    const state = get().runState;
    if (!state) return;

    const newState = acceptRewardCard(state, cardId);
    set({ runState: newState });
  },

  skipReward: () => {
    const state = get().runState;
    if (!state) return;

    const newState = skipRewardCards(state);
    set({ runState: newState });
  },

  backToMap: () => {
    const state = get().runState;
    if (!state) return;

    const newState = returnToMap(state);
    set({ runState: newState });
  },

  acquireRelic: (relicId: string) => {
    const state = get().runState;
    if (!state) return false;

    const newState = addRelic(state, relicId);
    if (!newState) return false;

    set({ runState: newState });
    return true;
  },

  loseRelic: (relicId: string) => {
    const state = get().runState;
    if (!state) return;

    const newState = removeRelic(state, relicId);
    set({ runState: newState });
  },

  advanceFloor: () => {
    const state = get().runState;
    if (!state) return;

    const newState = nextFloor(state);
    set({ runState: newState });
  },

  gainGold: (amount: number) => {
    const state = get().runState;
    if (!state) return;
    set({ runState: { ...state, gold: state.gold + amount } });
  },

  healPlayerMeta: (amount: number) => {
    const state = get().runState;
    if (!state) return;
    set({ runState: { ...state, currentHp: Math.min(state.maxHp, state.currentHp + amount) } });
  },

  increaseMaxHp: (amount: number) => {
    const state = get().runState;
    if (!state) return;
    set({ runState: { ...state, maxHp: state.maxHp + amount, currentHp: state.currentHp + amount } });
  },

  damagePlayerMeta: (amount: number) => {
    const state = get().runState;
    if (!state) return;
    set({ runState: { ...state, currentHp: Math.max(1, state.currentHp - amount) } });
  },

  gainQi: (amount: number) => {
    const state = get().runState;
    if (!state) return;
    set({ runState: { ...state, qi: state.qi + amount } });
  },
}));
