import { BingoWinningPattern } from '../types';

/**
 * Returns the column letter for a 1-75 bingo ball
 */
export function getLetterForNumber(num: number): 'B' | 'I' | 'N' | 'G' | 'O' {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

/**
 * Generates an array of N unique random numbers in range [min, max]
 */
function getRandomUnique(min: number, max: number, count: number): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) pool.push(i);
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

/**
 * Generates standard 5x5 B-I-N-G-O matrix
 * Column B: 1-15
 * Column I: 16-30
 * Column N: 31-45 (center 2,2 is 0 / FREE)
 * Column G: 46-60
 * Column O: 61-75
 */
export function generateBingoMatrix(): number[][] {
  const colB = getRandomUnique(1, 15, 5);
  const colI = getRandomUnique(16, 30, 5);
  const colN = getRandomUnique(31, 45, 5);
  const colG = getRandomUnique(46, 60, 5);
  const colO = getRandomUnique(61, 75, 5);

  const matrix: number[][] = [];
  for (let row = 0; row < 5; row++) {
    matrix.push([
      colB[row],
      colI[row],
      row === 2 ? 0 : colN[row], // Center FREE
      colG[row],
      colO[row],
    ]);
  }
  return matrix;
}

/**
 * Checks deterministically whether a card has achieved the winning pattern
 * against the list of drawn numbers
 */
export function checkWinningBingo(
  matrix: number[][],
  drawnNumbers: number[],
  pattern: BingoWinningPattern
): { isWinner: boolean; winningCells?: [number, number][] } {
  const drawnSet = new Set(drawnNumbers);
  drawnSet.add(0); // 0 is free center

  const isDrawn = (r: number, c: number) => drawnSet.has(matrix[r][c]);

  if (pattern === 'FOUR_CORNERS') {
    const corners: [number, number][] = [
      [0, 0],
      [0, 4],
      [4, 0],
      [4, 4],
    ];
    const won = corners.every(([r, c]) => isDrawn(r, c));
    return { isWinner: won, winningCells: won ? corners : undefined };
  }

  if (pattern === 'FULL_HOUSE') {
    const allCells: [number, number][] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!isDrawn(r, c)) return { isWinner: false };
        allCells.push([r, c]);
      }
    }
    return { isWinner: true, winningCells: allCells };
  }

  // Pattern LINE (Horizontal, Vertical, or Diagonal)
  // Check rows
  for (let r = 0; r < 5; r++) {
    let rowWon = true;
    const cells: [number, number][] = [];
    for (let c = 0; c < 5; c++) {
      cells.push([r, c]);
      if (!isDrawn(r, c)) {
        rowWon = false;
        break;
      }
    }
    if (rowWon) return { isWinner: true, winningCells: cells };
  }

  // Check columns
  for (let c = 0; c < 5; c++) {
    let colWon = true;
    const cells: [number, number][] = [];
    for (let r = 0; r < 5; r++) {
      cells.push([r, c]);
      if (!isDrawn(r, c)) {
        colWon = false;
        break;
      }
    }
    if (colWon) return { isWinner: true, winningCells: cells };
  }

  // Check diagonal 1 (top-left to bottom-right)
  let diag1Won = true;
  const diag1Cells: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    diag1Cells.push([i, i]);
    if (!isDrawn(i, i)) {
      diag1Won = false;
      break;
    }
  }
  if (diag1Won) return { isWinner: true, winningCells: diag1Cells };

  // Check diagonal 2 (top-right to bottom-left)
  let diag2Won = true;
  const diag2Cells: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    diag2Cells.push([i, 4 - i]);
    if (!isDrawn(i, 4 - i)) {
      diag2Won = false;
      break;
    }
  }
  if (diag2Won) return { isWinner: true, winningCells: diag2Cells };

  return { isWinner: false };
}
