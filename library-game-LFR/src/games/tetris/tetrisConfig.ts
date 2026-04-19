import { SCENE_KEYS } from '../../shared/sceneKeys';

export const TETRIS_SCENE_KEY = SCENE_KEYS.tetris;
export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface TetrominoDefinition {
  type: TetrominoType;
  color: number;
  label: string;
  matrix: number[][];
}

export const TETROMINOES: Record<TetrominoType, TetrominoDefinition> = {
  I: { type: 'I', color: 0x22d3ee, label: 'I cyan line', matrix: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { type: 'O', color: 0xfacc15, label: 'O yellow square', matrix: [[1, 1], [1, 1]] },
  T: { type: 'T', color: 0xc084fc, label: 'T purple tee', matrix: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { type: 'S', color: 0x4ade80, label: 'S green skew', matrix: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { type: 'Z', color: 0xf87171, label: 'Z red skew', matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { type: 'J', color: 0x60a5fa, label: 'J blue hook', matrix: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { type: 'L', color: 0xfb923c, label: 'L orange hook', matrix: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] }
};

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
