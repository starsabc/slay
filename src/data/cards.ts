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

  // === 内伤卡牌 ===

  wound_seal: {
    id: 'wound_seal', name: '内伤印', type: 'mental', rarity: 'advanced', cost: 1,
    manualEffect: { wound: 3 },
    autoEffect: { wound: 1 },
    autoTarget: 'random', orderTag: null,
    description: '手动：内伤+3  |  自动：内伤+手牌数',
  },
  detonate: {
    id: 'detonate', name: '引爆符', type: 'mental', rarity: 'advanced', cost: 1,
    manualEffect: { detonate: 2 },
    autoEffect: { detonate: 1 },
    autoTarget: 'random', orderTag: 'delay',
    description: '手动：引爆×2伤害  |  自动：引爆×1伤害',
  },

  // === 位置操控卡牌 ===

  star_reverse: {
    id: 'star_reverse', name: '斗转星移', type: 'movement', rarity: 'advanced', cost: 1,
    manualEffect: { draw: 2 }, autoEffect: {}, autoTarget: 'random', orderTag: null,
    description: '手动：抽2+弃2  |  自动：反转剩余手牌顺序',
  },
  shadow_shift: {
    id: 'shadow_shift', name: '移形换影', type: 'movement', rarity: 'advanced', cost: 0,
    manualEffect: {}, autoEffect: {}, autoTarget: 'random', orderTag: null,
    description: '手动：交换手中2牌位置  |  自动：最右牌移至最左',
  },
  returning_wind: {
    id: 'returning_wind', name: '回风落雁', type: 'movement', rarity: 'advanced', cost: 1,
    manualEffect: { draw: 1 }, autoEffect: {}, autoTarget: 'random', orderTag: null,
    description: '手动：弃1→抽弃牌堆顶  |  自动：弃牌堆顶牌插入当前位',
  },
  foresight: {
    id: 'foresight', name: '未卜先知', type: 'movement', rarity: 'master', cost: 1,
    manualEffect: { draw: 1 }, autoEffect: {}, autoTarget: 'random', orderTag: null,
    description: '手动：看抽牌堆顶3选1  |  自动：抽牌堆顶1插入当前位',
  },

  // === 进阶攻击卡牌 ===

  flurry: {
    id: 'flurry', name: '连珠箭', type: 'attack', rarity: 'advanced', cost: 1,
    manualEffect: { damage: 6 },
    autoEffect: { damage: 1 },
    autoTarget: 'sweep_lr', orderTag: 'priority',
    description: '手动：3×2次伤害  |  自动：(手牌数÷2)伤逐敌',
  },

  throat_cut: {
    id: 'throat_cut', name: '断喉刺', type: 'attack', rarity: 'master', cost: 1,
    manualEffect: { damage: 6 },
    autoEffect: { damage: 1 },
    autoTarget: 'lowest_hp', orderTag: null,
    description: '手动：6伤(无盾×2)  |  自动：(手牌数)无视护盾',
  },

  solar_slash: {
    id: 'solar_slash', name: '烈阳斩', type: 'attack', rarity: 'master', cost: 3,
    manualEffect: { damage: 25 },
    autoEffect: { damage: 3 },
    autoTarget: 'random', orderTag: 'delay',
    description: '手动：25伤  |  自动：(手牌数×3)伤',
  },

  poison_dart: {
    id: 'poison_dart', name: '淬毒镖', type: 'attack', rarity: 'advanced', cost: 1,
    manualEffect: { damage: 2, wound: 2 },
    autoEffect: { damage: 1, wound: 1 },
    autoTarget: 'lowest_hp', orderTag: null,
    description: '手动：2伤+内伤2  |  自动：(手牌数)伤+内伤1',
  },

  thousand_swords: {
    id: 'thousand_swords', name: '万剑诀', type: 'attack', rarity: 'master', cost: 2,
    manualEffect: { damage: 8 },
    autoEffect: { damage: 1 },
    autoTarget: 'all', orderTag: null,
    description: '手动：所有敌人8伤  |  自动：所有敌人(手牌数)伤',
  },

  soul_bite: {
    id: 'soul_bite', name: '噬心掌', type: 'attack', rarity: 'legendary', cost: 2,
    manualEffect: { damage: 0 },
    autoEffect: { damage: 0 },
    autoTarget: 'random', orderTag: null,
    description: '手动：弃1→费用×5伤  |  自动：弃牌堆顶费用×手牌数',
  },

  // === 进阶防御卡牌 ===

  golden_bell: {
    id: 'golden_bell', name: '金钟罩', type: 'defense', rarity: 'master', cost: 2,
    manualEffect: { block: 15 },
    autoEffect: { block: 2 },
    autoTarget: 'random', orderTag: 'delay',
    description: '手动：15格挡  |  自动：(手牌数×2)格挡',
  },

  reflect: {
    id: 'reflect', name: '反弹功', type: 'defense', rarity: 'advanced', cost: 1,
    manualEffect: { block: 5 },
    autoEffect: { block: 1 },
    autoTarget: 'random', orderTag: null,
    description: '手动：5格挡+反弹3  |  自动：(手牌数)格挡',
  },

  sacrifice_shield: {
    id: 'sacrifice_shield', name: '献祭盾', type: 'defense', rarity: 'master', cost: 1,
    manualEffect: { block: 0 },
    autoEffect: { block: 1 },
    autoTarget: 'random', orderTag: null,
    description: '手动：弃1→格挡=弃牌伤害  |  自动：(手牌数)格挡+弃1',
  },

  flow_guard: {
    id: 'flow_guard', name: '化劲归元', type: 'defense', rarity: 'legendary', cost: 2,
    manualEffect: { block: 10 },
    autoEffect: { block: 3 },
    autoTarget: 'random', orderTag: 'priority',
    description: '手动：10格挡  |  自动：(手牌数×3)格挡',
  },

  flower_jam: {
    id: 'flower_jam', name: '移花接木', type: 'defense', rarity: 'advanced', cost: 1,
    manualEffect: { block: 3, draw: 1 },
    autoEffect: { block: 1 },
    autoTarget: 'random', orderTag: null,
    description: '手动：3格挡+抽1  |  自动：(手牌数)格挡',
  },

  // === 进阶身法/控制卡牌 ===

  swallow_dash: {
    id: 'swallow_dash', name: '燕子三抄', type: 'movement', rarity: 'advanced', cost: 1,
    manualEffect: { draw: 3 },
    autoEffect: { draw: 1 },
    autoTarget: 'random', orderTag: 'priority',
    description: '手动：抽3  |  自动：抽1',
  },

  earth_shrink: {
    id: 'earth_shrink', name: '缩地成寸', type: 'movement', rarity: 'master', cost: 0,
    manualEffect: { energyGain: 2 },
    autoEffect: {},
    autoTarget: 'random', orderTag: null,
    description: '手动：+2内力  |  自动：从手中移除不结算',
  },

  oblivion: {
    id: 'oblivion', name: '物我两忘', type: 'movement', rarity: 'master', cost: 1,
    manualEffect: {},
    autoEffect: { block: 2 },
    autoTarget: 'random', orderTag: null,
    description: '手动：弃任意张每张+1内力  |  自动：弃全部手牌每张2格挡',
  },

  sky_net: {
    id: 'sky_net', name: '天罗地网', type: 'movement', rarity: 'legendary', cost: 2,
    manualEffect: {},
    autoEffect: {},
    autoTarget: 'random', orderTag: null,
    description: '手动：抽牌堆所有攻击牌加入  |  自动：抽牌堆随机1攻击插入当前位',
  },

  // === 进阶内功卡牌 ===

  consume_wound: {
    id: 'consume_wound', name: '吞噬内伤', type: 'mental', rarity: 'master', cost: 1,
    manualEffect: {},
    autoEffect: {},
    autoTarget: 'random', orderTag: null,
    description: '手动：移除所有内伤每层回1HP  |  自动：同上但格挡',
  },

  burning_poison: {
    id: 'burning_poison', name: '灼心毒', type: 'mental', rarity: 'master', cost: 2,
    manualEffect: { wound: 5 },
    autoEffect: { wound: 1 },
    autoTarget: 'random', orderTag: 'delay',
    description: '手动：内伤+5+每回合+2  |  自动：内伤+手牌数',
  },

  mutual_ruin: {
    id: 'mutual_ruin', name: '同归于尽', type: 'mental', rarity: 'master', cost: 3,
    manualEffect: { damage: 20 },
    autoEffect: { damage: 3 },
    autoTarget: 'random', orderTag: 'delay',
    description: '手动：HP-5敌-20  |  自动：HP-手牌数敌-手牌数×3',
  },

  heaven_sense: {
    id: 'heaven_sense', name: '天人感应', type: 'mental', rarity: 'legendary', cost: 1,
    manualEffect: {},
    autoEffect: {},
    autoTarget: 'random', orderTag: null,
    description: '手动：重排整个抽牌堆  |  自动：抽牌堆顶3按费用降序',
  },

  elixir_refine: {
    id: 'elixir_refine', name: '丹元炼化', type: 'mental', rarity: 'master', cost: 2,
    manualEffect: {},
    autoEffect: { energyGain: 0 },
    autoTarget: 'random', orderTag: null,
    description: '手动：永久+1内力上限  |  自动：本回合+手牌数内力',
  },

  // === 秘传卡牌 ===

  reverse_karma: {
    id: 'reverse_karma', name: '逆转乾坤', type: 'secret', rarity: 'legendary', cost: 3,
    manualEffect: {},
    autoEffect: {},
    autoTarget: 'random', orderTag: 'delay',
    description: '手动：本回合后额外玩家回合  |  自动：所有手牌改为手动打出',
  },

  myriad_return: {
    id: 'myriad_return', name: '万法归一', type: 'secret', rarity: 'legendary', cost: 0,
    manualEffect: { draw: 5 },
    autoEffect: {},
    autoTarget: 'random', orderTag: null,
    description: '手动：弃牌堆洗入抽5  |  自动：弃牌堆全部洗入',
  },

  final_sacrifice: {
    id: 'final_sacrifice', name: '舍身一击', type: 'secret', rarity: 'legendary', cost: 2,
    manualEffect: { damage: 0 },
    autoEffect: { damage: 5 },
    autoTarget: 'random', orderTag: 'delay',
    description: '手动：HP降1→减少量×2伤  |  自动：HP减半→手牌数×5伤',
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
