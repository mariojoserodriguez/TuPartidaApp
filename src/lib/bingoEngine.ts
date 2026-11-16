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
 * Generates standard 5x5 B-I-N-G-O flat matrix of 25 numbers
 * Indices 0-4: Row 0
 * Indices 5-9: Row 1
 * Indices 10-14: Row 2 (index 12 is center FREE = 0)
 * Indices 15-19: Row 3
 * Indices 20-24: Row 4
 */
export function generateBingoMatrix(): number[] {
  const colB = getRandomUnique(1, 15, 5);
  const colI = getRandomUnique(16, 30, 5);
  const colN = getRandomUnique(31, 45, 5);
  const colG = getRandomUnique(46, 60, 5);
  const colO = getRandomUnique(61, 75, 5);

  const flat: number[] = [];
  for (let row = 0; row < 5; row++) {
    flat.push(
      colB[row],
      colI[row],
      row === 2 ? 0 : colN[row], // Center FREE
      colG[row],
      colO[row]
    );
  }
  return flat;
}

/**
 * Checks deterministically whether a card has achieved the winning pattern
 * against the list of drawn numbers
 */
export function checkWinningBingo(
  matrix: number[],
  drawnNumbers: number[],
  pattern: BingoWinningPattern
): { isWinner: boolean; winningCells?: number[] } {
  const drawnSet = new Set(drawnNumbers);
  drawnSet.add(0); // 0 is free center

  const isDrawn = (r: number, c: number) => drawnSet.has(matrix[r * 5 + c]);

  if (pattern === 'FOUR_CORNERS') {
    const corners = [0, 4, 20, 24]; // [0,0], [0,4], [4,0], [4,4]
    const won = corners.every((idx) => drawnSet.has(matrix[idx]));
    return { isWinner: won, winningCells: won ? corners : undefined };
  }

  if (pattern === 'FULL_HOUSE') {
    const allCells: number[] = [];
    for (let i = 0; i < 25; i++) {
      if (!drawnSet.has(matrix[i])) return { isWinner: false };
      allCells.push(i);
    }
    return { isWinner: true, winningCells: allCells };
  }

  if (pattern === 'DIAGONAL') {
    // Check diagonal 1 (top-left to bottom-right: 0, 6, 12, 18, 24)
    let diag1Won = true;
    const diag1Cells = [0, 6, 12, 18, 24];
    for (const idx of diag1Cells) {
      if (!drawnSet.has(matrix[idx])) {
        diag1Won = false;
        break;
      }
    }
    if (diag1Won) return { isWinner: true, winningCells: diag1Cells };

    // Check diagonal 2 (top-right to bottom-left: 4, 8, 12, 16, 20)
    let diag2Won = true;
    const diag2Cells = [4, 8, 12, 16, 20];
    for (const idx of diag2Cells) {
      if (!drawnSet.has(matrix[idx])) {
        diag2Won = false;
        break;
      }
    }
    if (diag2Won) return { isWinner: true, winningCells: diag2Cells };

    return { isWinner: false };
  }

  // Pattern LINE (Horizontal or Vertical Rows and Columns)
  // Check rows
  for (let r = 0; r < 5; r++) {
    let rowWon = true;
    const cells: number[] = [];
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      cells.push(idx);
      if (!drawnSet.has(matrix[idx])) {
        rowWon = false;
        break;
      }
    }
    if (rowWon) return { isWinner: true, winningCells: cells };
  }

  // Check columns
  for (let c = 0; c < 5; c++) {
    let colWon = true;
    const cells: number[] = [];
    for (let r = 0; r < 5; r++) {
      const idx = r * 5 + c;
      cells.push(idx);
      if (!drawnSet.has(matrix[idx])) {
        colWon = false;
        break;
      }
    }
    if (colWon) return { isWinner: true, winningCells: cells };
  }

  return { isWinner: false };
}

export interface NearBingoStatus {
  isNear: boolean;
  missingCount: number;
  missingNumbers: number[];
}

/**
 * Checks if a card is 1 number away from winning ("A tiro de BINGO" / "Casi Bingo")
 */
export function checkNearBingo(
  matrix: number[],
  drawnNumbers: number[],
  pattern: BingoWinningPattern
): NearBingoStatus {
  const drawnSet = new Set(drawnNumbers);
  drawnSet.add(0); // Center free

  const linesToCheck: number[][] = [];

  if (pattern === 'FOUR_CORNERS') {
    linesToCheck.push([0, 4, 20, 24]);
  } else if (pattern === 'FULL_HOUSE') {
    const allCells: number[] = [];
    for (let i = 0; i < 25; i++) allCells.push(i);
    linesToCheck.push(allCells);
  } else if (pattern === 'DIAGONAL') {
    // Diagonals only
    linesToCheck.push([0, 6, 12, 18, 24]);
    linesToCheck.push([4, 8, 12, 16, 20]);
  } else {
    // Pattern LINE: 5 rows and 5 cols
    // Rows
    for (let r = 0; r < 5; r++) {
      linesToCheck.push([r * 5, r * 5 + 1, r * 5 + 2, r * 5 + 3, r * 5 + 4]);
    }
    // Cols
    for (let c = 0; c < 5; c++) {
      linesToCheck.push([c, c + 5, c + 10, c + 15, c + 20]);
    }
  }

  const missingSet = new Set<number>();
  let hasNearLine = false;

  for (const line of linesToCheck) {
    const unDrawn = line.filter((idx) => !drawnSet.has(matrix[idx]));
    if (unDrawn.length === 1) {
      hasNearLine = true;
      missingSet.add(matrix[unDrawn[0]]);
    }
  }

  return {
    isNear: hasNearLine,
    missingCount: missingSet.size,
    missingNumbers: Array.from(missingSet),
  };
}

/**
 * Returns human-readable label for a winning pattern
 */
export function getPatternDisplayName(pattern: BingoWinningPattern): string {
  switch (pattern) {
    case 'LINE':
      return 'Línea (Horizontal o Vertical)';
    case 'DIAGONAL':
      return 'Diagonales (Diagonal X)';
    case 'FOUR_CORNERS':
      return 'Cuatro Esquinas';
    case 'FULL_HOUSE':
      return 'Cartón Lleno';
    default:
      return pattern;
  }
}

/**
 * Suggested winning pattern by round:
 * Ronda 1: Líneas
 * Ronda 2: Diagonales
 * Ronda 3: Cuatro Esquinas
 * Ronda 4+: Cartón Lleno
 */
export function getDefaultPatternForRound(round: number): BingoWinningPattern {
  switch (round) {
    case 1:
      return 'LINE';
    case 2:
      return 'DIAGONAL';
    case 3:
      return 'FOUR_CORNERS';
    default:
      return 'FULL_HOUSE';
  }
}
