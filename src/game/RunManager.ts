import type { RunState, BattleReward } from '../types';
import { generateGrid, revealAdjacent, getMovementCost } from './MapGenerator';
import { getRelicDef } from '../data/relics';

const INITIAL_QI = 15;
const INITIAL_SLOTS = 3;
const MAX_FLOOR = 3;

export function createNewRun(initialDeckIds: string[]): RunState {
  const grid = generateGrid(1);
  const startNode = grid.flat().find(n => n.type === 'start');
  const startPos = startNode ? { row: startNode.row, col: startNode.col } : { row: 2, col: 1 };

  return {
    currentFloor: 1,
    maxFloor: MAX_FLOOR,
    maxHp: 50,
    currentHp: 50,
    gold: 0,
    qi: INITIAL_QI,
    alert: 0,
    deck: initialDeckIds,
    relics: [],
    maxRelicSlots: INITIAL_SLOTS,
    grid,
    currentPosition: startPos,
    phase: 'map',
    pendingReward: null,
  };
}

export function moveTo(state: RunState, to: { row: number; col: number }): RunState {
  const cost = getMovementCost(state.currentPosition, to);
  const targetNode = state.grid[to.row]?.[to.col];
  if (!targetNode || (!targetNode.revealed && !targetNode.foggy) || state.qi < cost) {
    return state; // Invalid move, return unchanged
  }

  const newGrid = state.grid.map(r => r.map(c => ({ ...c })));
  const newQi = state.qi - cost;

  // Reveal adjacent on new grid
  revealAdjacent(newGrid, to);

  // Mark node as visited
  const node = newGrid[to.row][to.col];
  node.visited = true;

  let newAlert = state.alert;
  let newPhase = state.phase;

  if (node.type === 'battle') {
    newAlert += 1;
    newPhase = 'battle';
  } else if (node.type === 'elite') {
    newAlert += 2;
    newPhase = 'battle';
  } else if (node.type === 'shop') {
    newPhase = 'shop';
  } else if (node.type === 'event') {
    newPhase = 'event';
  } else if (node.type === 'rest') {
    const healAmount = Math.floor(state.maxHp * 0.3);
    return {
      ...state,
      currentHp: Math.min(state.maxHp, state.currentHp + healAmount),
      qi: newQi,
      grid: newGrid,
      currentPosition: to,
      phase: 'map',
    };
  } else if (node.type === 'boss') {
    newPhase = 'battle';
  }

  return {
    ...state,
    qi: newQi,
    alert: newAlert,
    grid: newGrid,
    currentPosition: to,
    phase: newPhase,
  };
}

export function applyBattleReward(state: RunState, reward: BattleReward): RunState {
  return {
    ...state,
    gold: state.gold + reward.gold,
    qi: state.qi + reward.qiRestore,
    pendingReward: reward,
    phase: 'battle_victory',
  };
}

export function acceptRewardCard(state: RunState, cardId: string): RunState {
  return {
    ...state,
    deck: [...state.deck, cardId],
    pendingReward: state.pendingReward ? { ...state.pendingReward, cardChoices: [] } : null,
  };
}

export function skipRewardCards(state: RunState): RunState {
  return {
    ...state,
    pendingReward: state.pendingReward ? { ...state.pendingReward, cardChoices: [] } : null,
  };
}

export function returnToMap(state: RunState): RunState {
  return { ...state, phase: 'map', pendingReward: null };
}

export function addRelic(state: RunState, relicId: string): RunState | null {
  if (state.relics.length >= state.maxRelicSlots) return null;
  const relic = getRelicDef(relicId);
  return { ...state, relics: [...state.relics, relic] };
}

export function removeRelic(state: RunState, relicId: string): RunState {
  return { ...state, relics: state.relics.filter(r => r.id !== relicId) };
}

export function nextFloor(state: RunState): RunState {
  const nextFloor = state.currentFloor + 1;
  if (nextFloor > state.maxFloor) {
    return { ...state, phase: 'game_victory' };
  }
  const grid = generateGrid(nextFloor);
  const startNode = grid.flat().find(n => n.type === 'start');
  const startPos = startNode ? { row: startNode.row, col: startNode.col } : { row: 2, col: 1 };

  return {
    ...state,
    currentFloor: nextFloor,
    alert: 0,
    qi: INITIAL_QI,
    grid,
    currentPosition: startPos,
    phase: 'map',
    pendingReward: null,
  };
}

export function getAlertMultiplier(alert: number): { hpMul: number; dmgMul: number } {
  if (alert <= 2) return { hpMul: 1.0, dmgMul: 1.0 };
  if (alert <= 5) return { hpMul: 1.2, dmgMul: 1.25 };
  return { hpMul: 1.4, dmgMul: 1.5 };
}
