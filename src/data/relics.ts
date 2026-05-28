import type { RelicDef } from '../types';

const relics: Record<string, RelicDef> = {
  iron_body: {
    id: 'iron_body', name: '铁布衫', rarity: 'basic',
    triggerType: 'end_turn',
    condition: { handSize_gte: 5 },
    effect: { block: 3 },
    description: '回合结束时手牌≥5：获得 3 格挡',
  },
  berserk: {
    id: 'berserk', name: '狂战诀', rarity: 'basic',
    triggerType: 'auto_left',
    effect: { damage: 2 },
    description: '自动结算左区牌：该牌伤害 +2',
  },
  poison_dragon: {
    id: 'poison_dragon', name: '毒龙心经', rarity: 'advanced',
    triggerType: 'on_wound_explode',
    effect: { multiplier: 1.3 },
    description: '引爆内伤时：伤害 +30%',
  },
  shadow_step: {
    id: 'shadow_step', name: '残影步', rarity: 'advanced',
    triggerType: 'auto_right',
    effect: { draw: 1 },
    description: '自动结算右区牌：抽 1 张牌',
  },
  rock_stance: {
    id: 'rock_stance', name: '磐石功', rarity: 'basic',
    triggerType: 'end_turn',
    condition: { handSize_lte: 2 },
    effect: { block: 8 },
    description: '回合结束时手牌≤2：获得 8 格挡',
  },
  armor_break: {
    id: 'armor_break', name: '破甲诀', rarity: 'advanced',
    triggerType: 'on_attack',
    effect: { damage: 3 },
    description: '手动打出攻击牌：无视敌人 3 格挡',
  },
  blood_rage: {
    id: 'blood_rage', name: '血怒', rarity: 'master',
    triggerType: 'low_hp',
    condition: { hp_pct_lte: 30 },
    effect: { multiplier: 1.5 },
    description: 'HP≤30%：所有伤害 +50%',
  },
  yin_yang: {
    id: 'yin_yang', name: '阴阳轮', rarity: 'master',
    triggerType: 'auto_mid',
    effect: { damage: 0, block: 0, handSizeBonus: 1 },
    description: '自动结算中间位置：手牌数×2 伤 + 手牌数 格挡',
  },
  sacrifice: {
    id: 'sacrifice', name: '舍身', rarity: 'basic',
    triggerType: 'on_damage',
    effect: { energyGain: 1 },
    description: '受到伤害时：下回合内力 +1',
  },
  qi_sea: {
    id: 'qi_sea', name: '气海', rarity: 'master',
    triggerType: 'on_discard',
    effect: { block: 1 },
    description: '弃牌时：每弃 1 张获 1 格挡',
  },
  first_move: {
    id: 'first_move', name: '先手', rarity: 'advanced',
    triggerType: 'battle_start',
    effect: { draw: 2 },
    description: '战斗开始：抽至 7 手牌，+2 气运',
  },
  golden_body: {
    id: 'golden_body', name: '不灭金身', rarity: 'legendary',
    triggerType: 'end_turn',
    condition: { block_gte: 20 },
    effect: { heal: 5 },
    description: '回合结束时格挡≥20：回复 5 HP',
  },
};

export default relics;

export function getRelicDef(id: string): RelicDef {
  const relic = relics[id];
  if (!relic) throw new Error(`Relic "${id}" not found`);
  return relic;
}

export function getAllRelicIds(): string[] {
  return Object.keys(relics);
}
