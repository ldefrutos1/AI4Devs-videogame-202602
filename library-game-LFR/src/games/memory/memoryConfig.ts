import type { DifficultyConfig, ThemeConfig } from '../../shared/types';
import { SCENE_KEYS } from '../../shared/sceneKeys';

export const DIFFICULTIES: DifficultyConfig[] = [
  { id: 'easy', label: 'Easy', pairs: 4, columns: 4 },
  { id: 'medium', label: 'Medium', pairs: 8, columns: 4 },
  { id: 'hard', label: 'Hard', pairs: 12, columns: 6 }
];

export const THEMES: ThemeConfig[] = [
  { id: 'animals', label: 'Animals', symbols: ['🐶', '🐱', '🦊', '🐼', '🐸', '🐵', '🐧', '🦁', '🐯', '🐨', '🐰', '🦉', '🐢', '🦋'] },
  { id: 'trees', label: 'Trees', symbols: ['🌳', '🌲', '🌴', '🌵', '🍁', '🍂', '🍃', '🌿', '☘️', '🍀', '🎋', '🪴', '🌾', '🌱'] },
  { id: 'flowers', label: 'Flowers', symbols: ['🌹', '🌷', '🌻', '🌼', '🌸', '💐', '🪷', '🏵️', '🥀', '🌺', '🪻', '🍄', '🌞', '✨'] }
];

export const MEMORY_SCENE_KEY = SCENE_KEYS.memory;
