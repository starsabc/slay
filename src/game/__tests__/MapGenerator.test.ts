import { describe, it, expect } from 'vitest';
import { generateGrid, revealAdjacent, getMovementCost, canMoveTo } from '../MapGenerator';

describe('MapGenerator', () => {
  it('generates a 3x4 grid with correct node types', () => {
    const grid = generateGrid(1);
    expect(grid.length).toBe(3);
    expect(grid[0].length).toBe(4);
    const allNodes = grid.flat();
    expect(allNodes.some(n => n.type === 'start')).toBe(true);
    expect(allNodes.some(n => n.type === 'boss')).toBe(true);
    expect(allNodes.filter(n => n.type === 'battle').length).toBeGreaterThanOrEqual(3);
    expect(allNodes.filter(n => n.type === 'shop').length).toBe(1);
    expect(allNodes.filter(n => n.type === 'rest').length).toBe(1);
  });

  it('start node is at bottom row', () => {
    const grid = generateGrid(1);
    const startNode = grid.flat().find(n => n.type === 'start');
    expect(startNode).toBeDefined();
    expect(startNode!.row).toBe(2);
  });

  it('boss node is at top row', () => {
    const grid = generateGrid(1);
    const bossNode = grid.flat().find(n => n.type === 'boss');
    expect(bossNode).toBeDefined();
    expect(bossNode!.row).toBe(0);
  });

  it('reveals adjacent nodes', () => {
    const grid = generateGrid(1);
    revealAdjacent(grid, { row: 1, col: 1 });
    const neighbors = [[0,1],[2,1],[1,0],[1,2]];
    for (const [r, c] of neighbors) {
      expect(grid[r][c].foggy || grid[r][c].revealed).toBe(true);
    }
  });

  it('movement cost: 1 for adjacent, 2 for diagonal', () => {
    expect(getMovementCost({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(1);
    expect(getMovementCost({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(2);
    expect(getMovementCost({ row: 0, col: 0 }, { row: 2, col: 2 })).toBe(Infinity);
  });

  it('canMoveTo validates cardinal and diagonal only', () => {
    expect(canMoveTo({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
    expect(canMoveTo({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(true);
    expect(canMoveTo({ row: 0, col: 0 }, { row: 2, col: 2 })).toBe(false);
  });

  it('start node is revealed', () => {
    const grid = generateGrid(1);
    const startNode = grid.flat().find(n => n.type === 'start');
    expect(startNode!.revealed).toBe(true);
  });
});
