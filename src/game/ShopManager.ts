import type { CardDef } from '../types';
import cards, { getCardDef } from '../data/cards';
import { getRelicDef, getAllRelicIds } from '../data/relics';

export interface ShopItem {
  id: string;
  type: 'card' | 'relic' | 'remove';
  label: string;
  description: string;
  price: number;
  cardId?: string;
  relicId?: string;
}

const CARD_PRICES: Record<string, number> = {
  basic: 2,
  advanced: 3,
  master: 4,
  legendary: 5,
};

const RELIC_PRICES: Record<string, number> = {
  basic: 3,
  advanced: 3,
  master: 4,
  legendary: 5,
};

const SHOP_CARD_COUNT = 3;
const SHOP_RELIC_COUNT = 2;
const REMOVE_PRICE = 3;

function generateCardItems(currentDeckIds: string[], count: number): ShopItem[] {
  const allCardIds = Object.keys(cards);
  const available = allCardIds.filter((id) => !currentDeckIds.includes(id));
  return shuffleSlice(available, count).map((cardId) => {
    const card = getCardDef(cardId);
    return {
      id: `card_${cardId}`,
      type: 'card' as const,
      label: card.name,
      description: card.description,
      price: CARD_PRICES[card.rarity] ?? 2,
      cardId,
    };
  });
}

function generateRelicItems(currentRelicIds: string[], count: number): ShopItem[] {
  const allRelicIds = getAllRelicIds();
  const available = allRelicIds.filter((id) => !currentRelicIds.includes(id));
  return shuffleSlice(available, count).map((relicId) => {
    const relic = getRelicDef(relicId);
    return {
      id: `relic_${relicId}`,
      type: 'relic' as const,
      label: relic.name,
      description: relic.description,
      price: RELIC_PRICES[relic.rarity] ?? 3,
      relicId,
    };
  });
}

function shuffleSlice<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export function generateShopItems(
  currentDeckIds: string[],
  currentRelicIds: string[],
): ShopItem[] {
  const items: ShopItem[] = [];

  // 3 random cards not in deck
  items.push(...generateCardItems(currentDeckIds, SHOP_CARD_COUNT));

  // 2 random relics not equipped
  items.push(...generateRelicItems(currentRelicIds, SHOP_RELIC_COUNT));

  // Card removal option
  items.push({
    id: 'remove_card',
    type: 'remove',
    label: '移除牌组中的 1 张牌',
    description: '精简你的武学体系',
    price: REMOVE_PRICE,
  });

  return items;
}

export function canAfford(gold: number, price: number): boolean {
  return gold >= price;
}
