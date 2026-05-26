import type { CardDef } from '../types';

const cards: Record<string, CardDef> = {
  // === 入门卡牌（初始牌组） ===

  strike: {
    id: 'strike',
    name: '破风掌',
    type: 'attack',
    rarity: 'basic',
    cost: 1,
    manualEffect: { damage: 6 },
    autoEffect: { damage: 1 },
    autoTarget: 'random',
    orderTag: null,
    description: '手动：造成 6 点伤害\n自动：造成 手牌数 点伤害',
  },

  defend: {
    id: 'defend',
    name: '铁壁',
    type: 'defense',
    rarity: 'basic',
    cost: 1,
    manualEffect: { block: 5 },
    autoEffect: { block: 1 },
    autoTarget: 'random',
    orderTag: null,
    description: '手动：获得 5 点格挡\n自动：获得 手牌数 点格挡',
  },

  quick_thought: {
    id: 'quick_thought',
    name: '灵动',
    type: 'movement',
    rarity: 'basic',
    cost: 0,
    manualEffect: { draw: 2 },
    autoEffect: { draw: 1 },
    autoTarget: 'random',
    orderTag: null,
    description: '手动：抽 2 张牌\n自动：抽 1 张牌',
  },

  // === 精通卡牌（战斗后可选加入） ===

  heavy_strike: {
    id: 'heavy_strike',
    name: '崩山击',
    type: 'attack',
    rarity: 'advanced',
    cost: 2,
    manualEffect: { damage: 12 },
    autoEffect: { damage: 2 },
    autoTarget: 'random',
    orderTag: 'delay',
    description: '手动：造成 12 点伤害\n自动：造成 手牌数×2 点伤害\n自带[延后]标签',
  },

  parry: {
    id: 'parry',
    name: '卸劲',
    type: 'defense',
    rarity: 'advanced',
    cost: 1,
    manualEffect: { block: 8 },
    autoEffect: { block: 2 },
    autoTarget: 'random',
    orderTag: 'priority',
    description: '手动：获得 8 点格挡\n自动：获得 手牌数×2 点格挡\n自带[优先]标签',
  },

  meditation: {
    id: 'meditation',
    name: '凝神诀',
    type: 'movement',
    rarity: 'advanced',
    cost: 0,
    manualEffect: { draw: 2 },
    autoEffect: { block: 0 }, // 特殊处理：手牌数
    autoTarget: 'random',
    orderTag: null,
    description: '手动：抽 2 张牌\n自动：获得 手牌数 点格挡',
  },
};

export default cards;

export function getCardDef(id: string): CardDef {
  const card = cards[id];
  if (!card) throw new Error(`Card "${id}" not found`);
  return card;
}

export function getInitialDeck(): CardDef[] {
  return [
    cards.strike,
    cards.strike,
    cards.strike,
    cards.strike,
    cards.strike,
    cards.defend,
    cards.defend,
    cards.defend,
    cards.defend,
    cards.quick_thought,
  ];
}
