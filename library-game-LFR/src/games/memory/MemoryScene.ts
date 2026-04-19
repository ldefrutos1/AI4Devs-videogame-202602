import Phaser from 'phaser';
import { AssetLoader } from '../../shared/AssetLoader';
import { Button } from '../../shared/Button';
import { GameSceneBase } from '../../shared/GameSceneBase';
import { ScorePanel } from '../../shared/ScorePanel';
import type { DifficultyConfig, DifficultyId, ThemeConfig, ThemeId } from '../../shared/types';
import { SCENE_KEYS } from '../../shared/sceneKeys';
import { Card, type CardData } from './Card';
import { DIFFICULTIES, MEMORY_SCENE_KEY, THEMES } from './memoryConfig';

interface BestScore {
  moves: number;
  seconds: number;
}

export class MemoryScene extends GameSceneBase {
  private cards: Card[] = [];
  private flippedCards: Card[] = [];
  private inputLocked = false;
  private moves = 0;
  private matchedPairs = 0;
  private elapsedSeconds = 0;
  private timerStarted = false;
  private gameCompleted = false;
  private currentDifficulty: DifficultyConfig = DIFFICULTIES[1];
  private currentTheme: ThemeConfig = THEMES[0];
  private scorePanel?: ScorePanel;
  private titleText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private menuButton?: Button;
  private restartButton?: Button;
  private difficultyButtons: Button[] = [];
  private themeButtons: Button[] = [];
  private focusedIndex = 0;
  private timerEvent?: Phaser.Time.TimerEvent;

  constructor() {
    super(MEMORY_SCENE_KEY);
  }

  preload(): void {
    AssetLoader.createTone(this, 'flip', 440, 0.06);
    AssetLoader.createTone(this, 'match', 660, 0.1);
    AssetLoader.createTone(this, 'complete', 880, 0.18);
  }

  create(): void {
    super.create();
    this.cameras.main.setBackgroundColor('#0f172a');

    this.titleText = this.makeText(this.centerX, 28, 'Memory Game', 28, '#f8fafc');
    this.scorePanel = new ScorePanel(this, this.centerX, 78);
    this.statusText = this.makeText(this.centerX, this.gameHeight - 32, 'Find all matching pairs. Use mouse/touch or keyboard arrows + Enter.', 16, '#dbeafe');

    this.menuButton = new Button(this, 76, 34, 'Menu', () => this.scene.start(SCENE_KEYS.menu), { width: 112, height: 40, backgroundColor: 0x475569, hoverColor: 0x64748b, activeColor: 0x334155 }).setDepth(50);
    this.restartButton = new Button(this, this.gameWidth - 86, 34, 'Restart', () => this.restartGame(), { width: 132, height: 40 }).setDepth(50);
    this.createDifficultyButtons();
    this.createThemeButtons();
    this.createKeyboardControls();

    this.restartGame();
  }

  protected onResize(): void {
    this.titleText?.setPosition(this.centerX, 28);
    this.scorePanel?.setPosition(this.centerX, 78);
    this.statusText?.setPosition(this.centerX, this.gameHeight - 32);
    this.layoutTopActionButtons();
    this.layoutButtons();
    this.layoutCards();
  }

  private createDifficultyButtons(): void {
    this.difficultyButtons.forEach((button) => button.destroy());
    this.difficultyButtons = DIFFICULTIES.map((difficulty) =>
      new Button(this, 0, 0, difficulty.label, () => {
        this.currentDifficulty = difficulty;
        this.restartGame();
      }, { width: 96, height: 36, fontSize: 14 })
    );
    this.layoutButtons();
  }

  private createThemeButtons(): void {
    this.themeButtons.forEach((button) => button.destroy());
    this.themeButtons = THEMES.map((theme) =>
      new Button(this, 0, 0, theme.label, () => {
        this.currentTheme = theme;
        this.restartGame();
      }, { width: 104, height: 36, fontSize: 14, backgroundColor: 0x7c3aed, hoverColor: 0x8b5cf6, activeColor: 0x6d28d9 })
    );
    this.layoutButtons();
  }

  private layoutButtons(): void {
    this.layoutTopActionButtons();

    const difficultyGap = 12;
    const difficultyWidth = 96;
    const difficultyTotalWidth = this.difficultyButtons.length * difficultyWidth + Math.max(0, this.difficultyButtons.length - 1) * difficultyGap;
    const difficultyStartX = this.centerX - difficultyTotalWidth / 2 + difficultyWidth / 2;
    this.difficultyButtons.forEach((button, index) => button.setPosition(difficultyStartX + index * (difficultyWidth + difficultyGap), 126));

    const themeGap = 12;
    const themeWidth = 104;
    const themeTotalWidth = this.themeButtons.length * themeWidth + Math.max(0, this.themeButtons.length - 1) * themeGap;
    const themeStartX = this.centerX - themeTotalWidth / 2 + themeWidth / 2;
    this.themeButtons.forEach((button, index) => button.setPosition(themeStartX + index * (themeWidth + themeGap), 170));
  }

  private layoutTopActionButtons(): void {
    this.menuButton?.setPosition(76, 34);
    this.restartButton?.setPosition(this.gameWidth - 86, 34);
  }

  private createKeyboardControls(): void {
    this.input.keyboard?.on('keydown-LEFT', () => this.moveFocus(-1, 0));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveFocus(1, 0));
    this.input.keyboard?.on('keydown-UP', () => this.moveFocus(0, -1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveFocus(0, 1));
    this.input.keyboard?.on('keydown-ENTER', () => this.selectFocusedCard());
    this.input.keyboard?.on('keydown-SPACE', () => this.selectFocusedCard());
    this.input.keyboard?.on('keydown-R', () => this.restartGame());
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start(SCENE_KEYS.menu));
  }

  private restartGame(): void {
    this.cards.forEach((card) => card.destroy());
    this.cards = [];
    this.flippedCards = [];
    this.inputLocked = false;
    this.moves = 0;
    this.matchedPairs = 0;
    this.elapsedSeconds = 0;
    this.timerStarted = false;
    this.gameCompleted = false;
    this.focusedIndex = 0;
    this.timerEvent?.remove(false);
    this.timerEvent = undefined;

    const deck = this.makeDeck(this.currentDifficulty, this.currentTheme);
    this.cards = deck.map((data) => {
      const card = new Card(this, data, 100, 130);
      card.on(Phaser.Input.Events.POINTER_UP, () => this.tryFlipCard(card));
      return card;
    });

    this.layoutCards();
    this.updateFocusedCard();
    this.updateHud();
    this.updateSelectionButtons();
    this.setStatus('New game. Find all matching pairs.');
    this.announce(`Memory game restarted. ${this.currentDifficulty.label}, ${this.currentTheme.label}. ${deck.length} cards.`);
  }

  private makeDeck(difficulty: DifficultyConfig, theme: ThemeConfig): CardData[] {
    const symbols = theme.symbols.slice(0, difficulty.pairs);
    const cards = symbols.flatMap((symbol, pairIndex) => [
      { pairId: `${theme.id}-${pairIndex}`, symbol, label: `${theme.label} symbol ${pairIndex + 1}` },
      { pairId: `${theme.id}-${pairIndex}`, symbol, label: `${theme.label} symbol ${pairIndex + 1}` }
    ]);

    return Phaser.Utils.Array.Shuffle(cards).map((card, id) => ({ ...card, id }));
  }

  private layoutCards(): void {
    if (this.cards.length === 0) return;

    const cols = this.currentDifficulty.columns;
    const rows = Math.ceil(this.cards.length / cols);
    const availableWidth = Math.min(this.gameWidth - 28, 900);
    const boardTop = 214;
    const statusY = this.statusText?.y ?? this.gameHeight - 32;
    const boardBottom = statusY - 44;
    const availableHeight = Math.max(110, boardBottom - boardTop);
    const gap = Phaser.Math.Clamp(Math.min(availableWidth, availableHeight) * 0.025, 7, 14);
    const maxCardWidth = Math.floor((availableWidth - gap * (cols - 1)) / cols);
    const maxCardHeight = Math.floor((availableHeight - gap * (rows - 1)) / rows);
    const size = Math.floor(Math.min(maxCardWidth, maxCardHeight / 1.18, 118));
    const finalWidth = size;
    const finalHeight = Math.floor(size * 1.18);
    const boardWidth = cols * finalWidth + (cols - 1) * gap;
    const boardHeight = rows * finalHeight + (rows - 1) * gap;
    const startX = this.centerX - boardWidth / 2 + finalWidth / 2;
    const startY = boardTop + Math.max(0, (availableHeight - boardHeight) / 2) + finalHeight / 2;

    this.cards.forEach((card, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      card.setPosition(startX + col * (finalWidth + gap), startY + row * (finalHeight + gap));
      card.updateLayout(finalWidth, finalHeight);
    });
  }

  private async tryFlipCard(card: Card): Promise<void> {
    if (this.inputLocked || this.gameCompleted || !card.isSelectable() || this.flippedCards.includes(card)) return;

    if (!this.timerStarted) this.startTimer();

    this.sound.play('flip', { volume: 0.35 });
    this.inputLocked = true;
    await card.reveal();
    this.flippedCards.push(card);
    this.focusedIndex = this.cards.indexOf(card);
    this.updateFocusedCard();

    if (this.flippedCards.length < 2) {
      this.inputLocked = false;
      this.setStatus(`${card.cardData.label} revealed. Pick another card.`);
      return;
    }

    this.moves += 1;
    this.updateHud();
    await this.checkMatch();
  }

  private async checkMatch(): Promise<void> {
    const [first, second] = this.flippedCards;
    const matched = first.cardData.pairId === second.cardData.pairId;

    if (matched) {
      first.markMatched();
      second.markMatched();
      this.sound.play('match', { volume: 0.45 });
      this.matchedPairs += 1;
      this.flippedCards = [];
      this.setStatus(`Matched ${first.cardData.label}.`);
      this.announce(`Match found: ${first.cardData.label}.`);
      this.inputLocked = false;
      this.checkCompletion();
      return;
    }

    this.setStatus('No match. Cards will flip back.');
    this.announce('No match. Try again.');
    await new Promise((resolve) => this.time.delayedCall(720, resolve));
    await Promise.all([first.hide(), second.hide()]);
    this.flippedCards = [];
    this.inputLocked = false;
    this.updateFocusedCard();
  }

  private checkCompletion(): void {
    if (this.matchedPairs !== this.currentDifficulty.pairs) return;

    this.gameCompleted = true;
    this.timerEvent?.remove(false);
    this.sound.play('complete', { volume: 0.5 });
    const score = this.calculateScore();
    const bestWasUpdated = this.saveBestScore();
    const message = `Completed in ${this.moves} moves and ${this.formatSeconds(this.elapsedSeconds)}. Score: ${score}.${bestWasUpdated ? ' New best!' : ''}`;
    this.setStatus(message);
    this.announce(`Game complete. ${message}`);
    this.updateHud();
  }

  private startTimer(): void {
    this.timerStarted = true;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.elapsedSeconds += 1;
        this.updateHud();
      }
    });
  }

  private updateHud(): void {
    this.scorePanel?.updateValues(this.moves, this.elapsedSeconds, this.getBestScoreLabel());
  }

  private setStatus(message: string): void {
    this.statusText?.setText(message);
  }

  private updateSelectionButtons(): void {
    this.difficultyButtons.forEach((button) => button.setAlpha(button === this.difficultyButtons.find((_, i) => DIFFICULTIES[i].id === this.currentDifficulty.id) ? 1 : 0.78));
    this.themeButtons.forEach((button) => button.setAlpha(button === this.themeButtons.find((_, i) => THEMES[i].id === this.currentTheme.id) ? 1 : 0.78));
  }

  private moveFocus(dx: number, dy: number): void {
    if (this.cards.length === 0) return;
    const cols = this.currentDifficulty.columns;
    const rows = Math.ceil(this.cards.length / cols);
    const currentCol = this.focusedIndex % cols;
    const currentRow = Math.floor(this.focusedIndex / cols);
    const nextCol = Phaser.Math.Wrap(currentCol + dx, 0, cols);
    const nextRow = Phaser.Math.Wrap(currentRow + dy, 0, rows);
    this.focusedIndex = Phaser.Math.Clamp(nextRow * cols + nextCol, 0, this.cards.length - 1);
    this.updateFocusedCard();
  }

  private updateFocusedCard(): void {
    this.cards.forEach((card, index) => card.setFocused(index === this.focusedIndex));
    const card = this.cards[this.focusedIndex];
    if (card) this.announce(`Focused card ${this.focusedIndex + 1}. ${card.cardState === 'hidden' ? 'Face down.' : card.cardData.label}.`);
  }

  private selectFocusedCard(): void {
    const card = this.cards[this.focusedIndex];
    if (card) void this.tryFlipCard(card);
  }

  private getBestStorageKey(): string {
    return `memory-best-${this.currentDifficulty.id}-${this.currentTheme.id}`;
  }

  private getBestScore(): BestScore | null {
    const raw = localStorage.getItem(this.getBestStorageKey());
    if (!raw) return null;
    try {
      return JSON.parse(raw) as BestScore;
    } catch {
      return null;
    }
  }

  private saveBestScore(): boolean {
    const current: BestScore = { moves: this.moves, seconds: this.elapsedSeconds };
    const best = this.getBestScore();
    const isBetter = !best || current.moves < best.moves || (current.moves === best.moves && current.seconds < best.seconds);
    if (isBetter) localStorage.setItem(this.getBestStorageKey(), JSON.stringify(current));
    return isBetter;
  }

  private getBestScoreLabel(): string {
    const best = this.getBestScore();
    return best ? `${best.moves} / ${this.formatSeconds(best.seconds)}` : '—';
  }

  private calculateScore(): number {
    return Math.max(100, 10000 - this.moves * 160 - this.elapsedSeconds * 20);
  }

  private formatSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
