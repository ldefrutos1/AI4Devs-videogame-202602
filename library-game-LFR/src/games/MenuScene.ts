import Phaser from 'phaser';
import { Button } from '../shared/Button';
import { GameSceneBase } from '../shared/GameSceneBase';
import { SCENE_KEYS } from '../shared/sceneKeys';

export class MenuScene extends GameSceneBase {
  private title?: Phaser.GameObjects.Text;
  private subtitle?: Phaser.GameObjects.Text;
  private footer?: Phaser.GameObjects.Text;
  private cards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super(SCENE_KEYS.menu);
  }

  create(): void {
    super.create();
    this.cameras.main.setBackgroundColor('#08111f');
    this.build();
    this.input.keyboard?.on('keydown-ONE', () => this.launchGame(SCENE_KEYS.memory));
    this.input.keyboard?.on('keydown-TWO', () => this.launchGame(SCENE_KEYS.tetris));
    this.input.keyboard?.on('keydown-THREE', () => this.launchGame(SCENE_KEYS.tangram));
    this.input.keyboard?.on('keydown-M', () => this.launchGame(SCENE_KEYS.memory));
    this.input.keyboard?.on('keydown-T', () => this.launchGame(SCENE_KEYS.tetris));
    this.input.keyboard?.on('keydown-G', () => this.launchGame(SCENE_KEYS.tangram));
    this.announce('Game library menu. Choose Memory Game, Tetris, or Tangram.');
  }

  protected onResize(): void {
    this.children.removeAll(true);
    this.cards = [];
    this.build();
  }

  private build(): void {
    const safeBottom = 78;
    this.add.rectangle(this.centerX, this.centerY, this.gameWidth, this.gameHeight, 0x08111f);
    this.add.circle(this.gameWidth * 0.14, this.gameHeight * 0.18, Math.max(90, this.gameWidth * 0.12), 0x1d4ed8, 0.18);
    this.add.circle(this.gameWidth * 0.86, this.gameHeight * 0.78, Math.max(110, this.gameWidth * 0.16), 0x7c3aed, 0.14);

    this.title = this.makeText(this.centerX, Math.max(54, this.gameHeight * 0.11), 'HTML5 Game Library', Phaser.Math.Clamp(this.gameWidth * 0.045, 32, 54), '#f8fafc');
    this.subtitle = this.makeText(
      this.centerX,
      (this.title.y ?? 60) + 48,
      'Choose a polished browser game built with Phaser, TypeScript and Vite',
      Phaser.Math.Clamp(this.gameWidth * 0.018, 15, 20),
      '#cbd5e1'
    );

    const availableBottom = this.gameHeight - safeBottom;
    const wide = this.gameWidth >= 1120;
    const medium = this.gameWidth >= 760 && !wide;
    const columns = wide ? 3 : medium ? 2 : 1;
    const cardWidth = Phaser.Math.Clamp(this.gameWidth * (wide ? 0.25 : 0.36), 260, 370);
    const cardHeight = Phaser.Math.Clamp(this.gameHeight * (wide ? 0.34 : 0.30), 245, 320);
    const horizontalGap = 24;
    const verticalGap = 22;
    const rows = Math.ceil(3 / columns);
    const totalWidth = columns * cardWidth + (columns - 1) * horizontalGap;
    const totalHeight = rows * cardHeight + (rows - 1) * verticalGap;
    const minGridCenterY = (this.subtitle?.y ?? 112) + 52 + totalHeight / 2;
    const gridCenterY = Phaser.Math.Clamp(this.gameHeight * 0.58, minGridCenterY, availableBottom - totalHeight / 2);
    const gridStartX = this.centerX - totalWidth / 2 + cardWidth / 2;
    const gridStartY = gridCenterY - totalHeight / 2 + cardHeight / 2;

    const positions = [0, 1, 2].map((index) => ({
      x: gridStartX + (index % columns) * (cardWidth + horizontalGap),
      y: gridStartY + Math.floor(index / columns) * (cardHeight + verticalGap)
    }));

    this.cards.push(this.createGameCard(positions[0].x, positions[0].y, cardWidth, cardHeight, 'Memory Game', '🧠', 'Match pairs, beat your moves and time.', 'Play Memory', () => this.launchGame(SCENE_KEYS.memory), '1 or M'));
    this.cards.push(this.createGameCard(positions[1].x, positions[1].y, cardWidth, cardHeight, 'Tetris', '▣', 'Clear lines, use hold, ghost piece and hard drop.', 'Play Tetris', () => this.launchGame(SCENE_KEYS.tetris), '2 or T'));
    this.cards.push(this.createGameCard(positions[2].x, positions[2].y, cardWidth, cardHeight, 'Tangram', '▲', 'Build classic silhouette puzzles with seven pieces.', 'Play Tangram', () => this.launchGame(SCENE_KEYS.tangram), '3 or G'));

    this.footer = this.makeText(this.centerX, this.gameHeight - 22, 'Keyboard: 1/M Memory · 2/T Tetris · 3/G Tangram', 14, '#94a3b8');
  }

  private createGameCard(x: number, y: number, width: number, height: number, title: string, icon: string, description: string, buttonText: string, callback: () => void, shortcut: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, width, height, 0x0f172a, 0.9).setStrokeStyle(2, 0xffffff, 0.14);
    if ('setRounded' in bg) (bg as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(24);
    const iconText = this.add.text(0, -height * 0.25, icon, { fontFamily: 'Arial, sans-serif', fontSize: `${Math.floor(height * 0.2)}px` }).setOrigin(0.5);
    const titleText = this.add.text(0, -height * 0.03, title, { fontFamily: 'Inter, Arial, sans-serif', fontSize: '28px', color: '#f8fafc', fontStyle: 'bold' }).setOrigin(0.5);
    const descText = this.add.text(0, height * 0.08, description, { fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px', color: '#cbd5e1', align: 'center', wordWrap: { width: width - 48 } }).setOrigin(0.5);
    const shortcutText = this.add.text(0, height * 0.21, `Shortcut: ${shortcut}`, { fontFamily: 'Inter, Arial, sans-serif', fontSize: '13px', color: '#93c5fd' }).setOrigin(0.5);
    const button = new Button(this, 0, height * 0.34, buttonText, callback, { width: Math.min(190, width - 64), height: 44 });
    container.add([bg, iconText, titleText, descText, shortcutText, button]);
    return container;
  }

  private launchGame(sceneKey: string): void {
    this.scene.start(sceneKey);
  }
}
