import { SCENE_KEYS } from '../../shared/sceneKeys';

export const TANGRAM_SCENE_KEY = SCENE_KEYS.tangram;

export type TangramPieceId = 'largeA' | 'largeB' | 'medium' | 'smallA' | 'smallB' | 'square' | 'parallelogram';

export interface TangramPoint {
  x: number;
  y: number;
}

export interface TangramPieceDefinition {
  id: TangramPieceId;
  label: string;
  shortLabel: string;
  color: number;
  points: TangramPoint[];
}

export interface TangramPlacement {
  x: number;
  y: number;
  rotation: number;
  flipped?: boolean;
}

export interface TangramFigure {
  id: string;
  name: string;
  description: string;
  /** External silhouette used for the right target panel and the center Help background. */
  outline: TangramPoint[];
  /** Real playable solution. When Help is enabled, these placements draw the internal piece divisions. */
  solution: Record<TangramPieceId, TangramPlacement>;
}

const rightTriangle = (legs: number): TangramPoint[] => [
  { x: -legs / 3, y: -legs / 3 },
  { x: (2 * legs) / 3, y: -legs / 3 },
  { x: -legs / 3, y: (2 * legs) / 3 }
];

export const PIECES: TangramPieceDefinition[] = [
  { id: 'largeA', label: 'Large triangle one', shortLabel: 'L1', color: 0x38bdf8, points: rightTriangle(154) },
  { id: 'largeB', label: 'Large triangle two', shortLabel: 'L2', color: 0x60a5fa, points: rightTriangle(154) },
  { id: 'medium', label: 'Medium triangle', shortLabel: 'M', color: 0xa78bfa, points: rightTriangle(110) },
  { id: 'smallA', label: 'Small triangle one', shortLabel: 'S1', color: 0x34d399, points: rightTriangle(78) },
  { id: 'smallB', label: 'Small triangle two', shortLabel: 'S2', color: 0xfbbf24, points: rightTriangle(78) },
  { id: 'square', label: 'Square', shortLabel: 'SQ', color: 0xf472b6, points: [{ x: 0, y: -48 }, { x: 48, y: 0 }, { x: 0, y: 48 }, { x: -48, y: 0 }] },
  { id: 'parallelogram', label: 'Parallelogram', shortLabel: 'P', color: 0xfb7185, points: [{ x: -70, y: -34 }, { x: 20, y: -34 }, { x: 70, y: 34 }, { x: -20, y: 34 }] }
];

const fig = (
  id: string,
  name: string,
  description: string,
  outline: TangramPoint[],
  solution: Record<TangramPieceId, TangramPlacement>
): TangramFigure => ({ id, name, description, outline, solution });

// The figures below are the only Tangram templates enabled in the game.
// They correspond to the 12-model reference sheet supplied in the chat:
// Lion, Seal, Camel, Panda, Horse, Crab, Bear, Kangaroo, Turtle, Cow, Fox and Frog.
// Older templates from previous iterations were removed intentionally.
export const FIGURES: TangramFigure[] = [
  fig('conejo', 'Conejo', 'Modelo basado en la imagen JPG proporcionada por el usuario.', [], {
    largeA: { x: 270, y: 250, rotation: 315 },
    largeB: { x: 340, y: 330, rotation: 45 },
    medium: { x: 310, y: 170, rotation: 90 },
    smallA: { x: 245, y: 230, rotation: 225 },
    smallB: { x: 330, y: 90, rotation: 315 },
    square: { x: 250, y: 110, rotation: 0 },
    parallelogram: { x: 315, y: 275, rotation: 90 }
  }),
  fig('cisne', 'Cisne', 'Modelo basado en la imagen JPG proporcionada por el usuario.', [], {
    largeA: { x: 290, y: 330, rotation: 45 },
    largeB: { x: 430, y: 300, rotation: 315 },
    medium: { x: 235, y: 250, rotation: 135 },
    smallA: { x: 210, y: 120, rotation: 0 },
    smallB: { x: 265, y: 360, rotation: 225 },
    square: { x: 260, y: 220, rotation: 0 },
    parallelogram: { x: 300, y: 150, rotation: 90 }
  }),
  fig('cuadrado', 'Cuadrado', 'Plantilla clásica del cuadrado tangram proporcionada por el usuario.', [], {
    largeA: { x: 250, y: 220, rotation: 0 },
    largeB: { x: 370, y: 220, rotation: 180 },
    medium: { x: 310, y: 310, rotation: 225 },
    smallA: { x: 235, y: 315, rotation: 90 },
    smallB: { x: 385, y: 125, rotation: 270 },
    square: { x: 310, y: 220, rotation: 0 },
    parallelogram: { x: 255, y: 130, rotation: 90 }
  })
];
