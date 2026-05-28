import type { GridNode, GridNodeType } from '../types';

const ROWS = 3;
const COLS = 4;

export function generateGrid(floor: number): GridNode[][] {
  const grid: GridNode[][] = [];

  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = {
        row: r, col: c,
        type: 'battle',
        revealed: false,
        visited: false,
        foggy: false,
      };
    }
  }

  // Place start at bottom, boss at top
  const startCol = Math.floor(Math.random() * COLS);
  grid[2][startCol].type = 'start';
  grid[2][startCol].revealed = true;

  const bossCol = Math.floor(Math.random() * COLS);
  grid[0][bossCol].type = 'boss';

  // Place fixed nodes
  const usedTypes: GridNodeType[] = ['start', 'boss'];
  placeUniqueNode(grid, 'shop', usedTypes); usedTypes.push('shop');
  placeUniqueNode(grid, 'rest', usedTypes); usedTypes.push('rest');

  // Elites: 1-2 depending on floor
  const eliteCount = floor >= 3 ? 2 : 1;
  for (let i = 0; i < eliteCount; i++) {
    placeUniqueNode(grid, 'elite', usedTypes); usedTypes.push('elite');
  }

  // Events: 1-2 depending on floor
  const eventCount = floor >= 2 ? 2 : 1;
  for (let i = 0; i < eventCount; i++) {
    placeUniqueNode(grid, 'event', usedTypes); usedTypes.push('event');
  }

  // Remaining unset nodes stay as 'battle'
  revealAdjacent(grid, { row: 2, col: startCol });

  return grid;
}

function placeUniqueNode(
  grid: GridNode[][],
  type: GridNodeType,
  exclude: GridNodeType[],
): void {
  const available = grid.flat().filter(n =>
    n.type === 'battle' && !exclude.includes(n.type)
  );
  if (available.length === 0) return;
  const target = available[Math.floor(Math.random() * available.length)];
  target.type = type;
}

export function revealAdjacent(grid: GridNode[][], pos: { row: number; col: number }): void {
  grid[pos.row][pos.col].revealed = true;
  grid[pos.row][pos.col].foggy = false;

  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nr = pos.row + dr;
    const nc = pos.col + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      const node = grid[nr][nc];
      if (!node.revealed) {
        node.foggy = true;
      }
    }
  }
}

export function getMovementCost(from: { row: number; col: number }, to: { row: number; col: number }): number {
  const dr = Math.abs(from.row - to.row);
  const dc = Math.abs(from.col - to.col);
  if (dr <= 1 && dc <= 1 && (dr + dc) > 0) {
    return dr === 1 && dc === 1 ? 2 : 1;
  }
  return Infinity;
}

export function canMoveTo(from: { row: number; col: number }, to: { row: number; col: number }): boolean {
  const dr = Math.abs(from.row - to.row);
  const dc = Math.abs(from.col - to.col);
  return dr <= 1 && dc <= 1 && (dr + dc) > 0;
}
