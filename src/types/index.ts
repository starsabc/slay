// === 卡牌相关 ===

export type CardType = 'attack' | 'defense' | 'movement' | 'mental' | 'secret';

export type CardRarity = 'basic' | 'advanced' | 'master' | 'legendary';

export type OrderTag = 'priority' | 'delay' | null;

export type TargetType = 'enemy' | 'self' | 'random_enemy' | 'all_enemies';

export interface EffectValues {
  damage?: number;
  block?: number;
  draw?: number;
  energyGain?: number;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  manualEffect: EffectValues;
  autoEffect: EffectValues;
  orderTag: OrderTag;
  description: string;
}

// === 战斗运行时类型 ===

export interface RuntimeCard {
  instanceId: string; // 运行时唯一ID，区分同一张牌的不同实例
  defId: string;      // 指向 CardDef.id
}

export interface EnemyState {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  intent: EnemyIntent;
}

export interface EnemyIntent {
  type: 'attack' | 'defend' | 'buff';
  value: number;
}

export interface PlayerState {
  maxHp: number;
  currentHp: number;
  block: number;
}

export type BattlePhase =
  | 'draw'
  | 'player_turn'
  | 'auto_resolve'
  | 'enemy_turn'
  | 'victory'
  | 'defeat';

export interface BattleState {
  player: PlayerState;
  enemies: EnemyState[];
  hand: RuntimeCard[];
  drawPile: RuntimeCard[];
  discardPile: RuntimeCard[];
  exhaustPile: RuntimeCard[];
  energy: number;
  maxEnergy: number;
  phase: BattlePhase;
  turnNumber: number;
}

// === 事件类型 ===

export type BattleEvent =
  | { type: 'damage'; targetId: string; amount: number }
  | { type: 'block'; targetId: string; amount: number }
  | { type: 'draw'; count: number }
  | { type: 'card_played'; cardInstanceId: string; isAuto: boolean }
  | { type: 'phase_change'; from: BattlePhase; to: BattlePhase }
  | { type: 'enemy_defeated'; enemyId: string }
  | { type: 'player_defeated' };
