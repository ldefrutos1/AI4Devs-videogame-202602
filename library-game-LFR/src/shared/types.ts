export type DifficultyId = 'easy' | 'medium' | 'hard';
export type ThemeId = 'animals' | 'trees' | 'flowers';

export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  pairs: number;
  columns: number;
}

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  symbols: string[];
}
