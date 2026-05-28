// === 卡牌相关 ===

export type CardType = 'attack' | 'defense' | 'movement' | 'mental' | 'secret';

export type CardRarity = 'basic' | 'advanced' | 'master' | 'legendary';

export type OrderTag = 'priority' | 'delay' | null;

export type TargetType = 'enemy' | 'self' | 'random_enemy' | 'all_enemies';

export type AutoTargetRule =
  | 'random'
  | 'lowest_hp'
  | 'highest_intent'
  | 'all'
  | 'sweep_lr';

export interface EffectValues {
  damage?: number;
  block?: number;
  draw?: number;
  energyGain?: number;
  wound?: number;
  detonate?: number;
  multiplier?: number;
  handSizeBonus?: number;
  heal?: number;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  manualEffect: EffectValues;
  autoEffect: EffectValues;
  autoTarget: AutoTargetRule;
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
  wound: number;
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
  | { type: 'player_defeated' }
  | { type: 'wound_applied'; targetId: string; amount: number }
  | { type: 'wound_detonated'; targetId: string; damage: number };

// === Phase 3: Meta 系统类型 ===

export type RelicTrigger =
  | 'end_turn' | 'auto_left' | 'auto_right' | 'auto_mid'
  | 'on_attack' | 'on_wound_explode' | 'on_damage' | 'on_discard'
  | 'battle_start' | 'low_hp';

export interface RelicDef {
  id: string;
  name: string;
  rarity: CardRarity;
  triggerType: RelicTrigger;
  condition?: Record<string, number>;
  effect: Partial<EffectValues> & { multiplier?: number; handSizeBonus?: number; heal?: number };
  description: string;
}

export type GridNodeType = 'start' | 'battle' | 'elite' | 'shop' | 'event' | 'rest' | 'boss';

export interface GridNode {
  row: number;
  col: number;
  type: GridNodeType;
  revealed: boolean;
  visited: boolean;
  foggy: boolean;
}

export interface EventChoice {
  label: string;
  description: string;
  effect: EventEffect;
}

export interface EventEffect {
  type: 'add_card' | 'remove_card' | 'add_relic' | 'remove_relic'
      | 'gold_gain' | 'qi_gain' | 'heal' | 'max_hp_up'
      | 'damage' | 'alert_up' | 'reveal_boss' | 'reveal_random'
      | 'upgrade_card' | 'skip_boss';
  value?: number;
  rarity?: CardRarity;
  cardType?: CardType;
}

export interface EventDef {
  id: string;
  name: string;
  description: string;
  choices: EventChoice[];
}

export type GamePhase =
  | 'map' | 'battle' | 'shop' | 'event'
  | 'battle_victory' | 'battle_defeat'
  | 'game_victory' | 'game_defeat';

export interface BattleReward {
  gold: number;
  qiRestore: number;
  cardChoices: string[];
  relicChoice: string | null;
}

export interface RunState {
  currentFloor: number;
  maxFloor: number;
  maxHp: number;
  currentHp: number;
  gold: number;
  qi: number;
  alert: number;
  deck: string[];
  relics: RelicDef[];
  maxRelicSlots: number;
  grid: GridNode[][];
  currentPosition: { row: number; col: number };
  phase: GamePhase;
  pendingReward: BattleReward | null;
}
