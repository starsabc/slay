import type { EventDef } from '../types';

const events: Record<string, EventDef> = {
  ancient_scroll: {
    id: 'ancient_scroll', name: '古籍残卷',
    description: '一本蒙尘的武学典籍躺在角落，书页间夹着一枚灵石。',
    choices: [
      { label: '潜心研读', description: '学习新的武学', effect: { type: 'add_card', rarity: 'advanced' } },
      { label: '取走灵石', description: '获得 3 灵石', effect: { type: 'gold_gain', value: 3 } },
      { label: '强行领悟', description: '失去 5 HP，学习 2 张牌', effect: { type: 'damage', value: 5 } },
    ],
  },
  hermit_teach: {
    id: 'hermit_teach', name: '隐士传功',
    description: '一位白发隐士盘坐石上，愿传你一招。',
    choices: [
      { label: '请求指点', description: '升级 1 张牌', effect: { type: 'upgrade_card' } },
      { label: '切磋推演', description: '领悟 1 个随机心法', effect: { type: 'add_relic' } },
    ],
  },
  altar: {
    id: 'altar', name: '祭坛献祭',
    description: '古老的祭坛上刻着符文——献上武学，换取力量。',
    choices: [
      { label: '献上 1 张牌', description: '永久移除 1 张牌', effect: { type: 'remove_card' } },
      { label: '献上武学换心法', description: '移除 1 张牌，获得 1 个心法', effect: { type: 'add_relic' } },
    ],
  },
  swamp: {
    id: 'swamp', name: '毒瘴沼泽',
    description: '瘴气弥漫的沼泽挡住去路，泥中似乎有东西在蠕动。',
    choices: [
      { label: '绕路避开', description: '+5 气运', effect: { type: 'qi_gain', value: 5 } },
      { label: '硬闯瘴气', description: '-10 HP，获得随机心法', effect: { type: 'add_relic' } },
      { label: '探索沼泽', description: '随机卡牌，警惕度 +1', effect: { type: 'add_card' } },
    ],
  },
  stele: {
    id: 'stele', name: '石碑谜题',
    description: '一块古老石碑，上面写着一段谜语。',
    choices: [
      { label: '尝试解密', description: '猜对→稀有心法', effect: { type: 'add_relic', rarity: 'master' } },
      { label: '绕过', description: '+3 灵石', effect: { type: 'gold_gain', value: 3 } },
    ],
  },
  black_market: {
    id: 'black_market', name: '黑市商人',
    description: '一个蒙面商人笑了笑："你的心法值不少钱。"',
    choices: [
      { label: '出售灵石', description: '灵石翻倍', effect: { type: 'gold_gain', value: 0 } },
      { label: '出售心法', description: '移除 1 心法，获得 3 灵石', effect: { type: 'remove_relic' } },
      { label: '离开', description: '', effect: { type: 'gold_gain', value: 0 } },
    ],
  },
  spring: {
    id: 'spring', name: '疗伤泉水',
    description: '一池清澈的泉水，灵气盎然。',
    choices: [
      { label: '饮用泉水', description: '回复 30% HP', effect: { type: 'heal', value: 30 } },
      { label: '修炼突破', description: '+8 最大 HP', effect: { type: 'max_hp_up', value: 8 } },
    ],
  },
  relic_fuse: {
    id: 'relic_fuse', name: '心法共鸣',
    description: '你的两个相同心法产生了奇妙的共鸣……',
    choices: [
      { label: '合成升级', description: '2 个相同心法合成升级版', effect: { type: 'add_relic', rarity: 'master' } },
      { label: '拆解变卖', description: '拆解→3 灵石', effect: { type: 'gold_gain', value: 3 } },
    ],
  },
  shortcut: {
    id: 'shortcut', name: '捷径',
    description: '你发现了一条通往塔顶的捷径。',
    choices: [
      { label: '直通 Boss', description: '揭示 Boss 格 +5 气运', effect: { type: 'reveal_boss' } },
      { label: '探明周围', description: '揭示 3 个随机格子', effect: { type: 'reveal_random', value: 3 } },
    ],
  },
  sword_tomb: {
    id: 'sword_tomb', name: '剑冢',
    description: '一位剑客的安息之地，剑意未散。',
    choices: [
      { label: '继承宝剑', description: '获得随机攻击牌', effect: { type: 'add_card', cardType: 'attack' } },
      { label: '取走宝剑', description: '+3 灵石', effect: { type: 'gold_gain', value: 3 } },
      { label: '对抗剑意', description: '-8 HP→绝学攻击牌', effect: { type: 'add_card', rarity: 'legendary', cardType: 'attack' } },
    ],
  },
  mist: {
    id: 'mist', name: '迷雾幻境',
    description: '迷雾中隐约传来刀剑之声——一场战斗在等着。',
    choices: [
      { label: '迎战', description: '额外战斗（不涨警惕度）', effect: { type: 'gold_gain', value: 0 } },
      { label: '绕行', description: '安全通过', effect: { type: 'gold_gain', value: 0 } },
      { label: '花钱消灾', description: '消耗 3 气运→获得心法', effect: { type: 'add_relic' } },
    ],
  },
  tower_crack: {
    id: 'tower_crack', name: '塔顶裂缝',
    description: '一道裂缝通向塔外——你可以跳过这层的 Boss。',
    choices: [
      { label: '从裂缝离开', description: '跳过本层 Boss（警惕度归零）', effect: { type: 'skip_boss' } },
      { label: '正面迎战', description: '正常打 Boss', effect: { type: 'gold_gain', value: 0 } },
    ],
  },
};

export default events;

export function getEventDef(id: string): EventDef {
  return events[id];
}

export function getRandomEventIds(count: number, exclude: string[] = []): string[] {
  const pool = Object.keys(events).filter(e => !exclude.includes(e));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
