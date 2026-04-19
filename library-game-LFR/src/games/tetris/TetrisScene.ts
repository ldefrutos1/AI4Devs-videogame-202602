import Phaser from 'phaser';
import { AssetLoader } from '../../shared/AssetLoader';
import { Button } from '../../shared/Button';
import { GameSceneBase } from '../../shared/GameSceneBase';
import { SCENE_KEYS } from '../../shared/sceneKeys';
import { BOARD_COLS, BOARD_ROWS, TETRIS_SCENE_KEY, TETROMINOES, TETROMINO_TYPES, type TetrominoType } from './tetrisConfig';

type BoardCell = TetrominoType | null;

interface Piece {
  type: TetrominoType;
  matrix: number[][];
  row: number;
  col: number;
}

const SCORES: Record<number, number> = { 1: 100, 2: 300, 3: 500, 4: 800 };

export class TetrisScene extends GameSceneBase {
  private board: BoardCell[][] = [];
  private current?: Piece;
  private nextType: TetrominoType = 'I';
  private holdType: TetrominoType | null = null;
  private holdUsed = false;
  private score = 0;
  private level = 1;
  private lines = 0;
  private highScore = 0;
  private paused = false;
  private isGameOver = false;
  private dropAccumulator = 0;
  private lastUpdate = 0;
  private cellSize = 28;
  private boardX = 0;
  private boardY = 0;
  private boardBg?: Phaser.GameObjects.Rectangle;
  private gridGraphics?: Phaser.GameObjects.Graphics;
  private fixedBlocks?: Phaser.GameObjects.Container;
  private ghostBlocks?: Phaser.GameObjects.Container;
  private activeBlocks?: Phaser.GameObjects.Container;
  private hudPanel?: Phaser.GameObjects.Container;
  private nextPanel?: Phaser.GameObjects.Container;
  private holdPanel?: Phaser.GameObjects.Container;
  private messageText?: Phaser.GameObjects.Text;
  private controlsText?: Phaser.GameObjects.Text;
  private menuButton?: Button;
  private restartButton?: Button;
  private touchControls: Button[] = [];

  constructor() {
    super(TETRIS_SCENE_KEY);
  }

  preload(): void {
    AssetLoader.createTone(this, 'tetris-move', 330, 0.035);
    AssetLoader.createTone(this, 'tetris-rotate', 520, 0.045);
    AssetLoader.createTone(this, 'tetris-line', 780, 0.12);
    AssetLoader.createTone(this, 'tetris-over', 140, 0.22);
  }

  create(): void {
    super.create();
    this.cameras.main.setBackgroundColor('#08111f');
    this.highScore = Number(localStorage.getItem('tetris-high-score') ?? '0');
    this.createKeyboardControls();
    this.createStaticUi();
    this.restartGame();
  }

  update(time: number): void {
    if (!this.current || this.paused || this.isGameOver) {
      this.lastUpdate = time;
      return;
    }
    const delta = this.lastUpdate === 0 ? 0 : time - this.lastUpdate;
    this.lastUpdate = time;
    this.dropAccumulator += delta;
    if (this.dropAccumulator >= this.getDropInterval()) {
      this.dropAccumulator = 0;
      this.softDrop(false);
    }
  }

  protected onResize(): void {
    this.layoutScene();
    this.drawAll();
  }

  private createStaticUi(): void {
    this.menuButton = new Button(this, 76, 34, 'Menu', () => this.scene.start(SCENE_KEYS.menu), { width: 112, height: 40, backgroundColor: 0x475569, hoverColor: 0x64748b, activeColor: 0x334155 }).setDepth(50);
    this.restartButton = new Button(this, this.gameWidth - 86, 34, 'Restart', () => this.restartGame(), { width: 132, height: 40 }).setDepth(50);
    this.messageText = this.makeText(this.centerX, 36, 'Tetris', 28, '#f8fafc');
    this.controlsText = this.makeText(this.centerX, this.gameHeight - 22, '←/→ move · ↑ rotate · ↓ soft drop · Space hard drop · C hold · P pause', 14, '#cbd5e1');

    this.boardBg = this.add.rectangle(0, 0, 10, 10, 0x020617, 0.92).setStrokeStyle(3, 0x38bdf8, 0.42);
    if ('setRounded' in this.boardBg) (this.boardBg as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(14);
    this.gridGraphics = this.add.graphics();
    this.fixedBlocks = this.add.container(0, 0);
    this.ghostBlocks = this.add.container(0, 0);
    this.activeBlocks = this.add.container(0, 0);
    this.hudPanel = this.add.container(0, 0);
    this.nextPanel = this.add.container(0, 0);
    this.holdPanel = this.add.container(0, 0);
    this.createTouchControls();
    this.layoutScene();
  }

  private createKeyboardControls(): void {
    this.input.keyboard?.on('keydown-LEFT', () => this.tryMove(-1, 0));
    this.input.keyboard?.on('keydown-RIGHT', () => this.tryMove(1, 0));
    this.input.keyboard?.on('keydown-DOWN', () => this.softDrop(true));
    this.input.keyboard?.on('keydown-UP', () => this.tryRotate());
    this.input.keyboard?.on('keydown-X', () => this.tryRotate());
    this.input.keyboard?.on('keydown-SPACE', () => this.hardDrop());
    this.input.keyboard?.on('keydown-C', () => this.holdPiece());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-R', () => this.restartGame());
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start(SCENE_KEYS.menu));
  }

  private createTouchControls(): void {
    this.touchControls = [
      new Button(this, 0, 0, '◀', () => this.tryMove(-1, 0), { width: 48, height: 42 }),
      new Button(this, 0, 0, '▶', () => this.tryMove(1, 0), { width: 48, height: 42 }),
      new Button(this, 0, 0, '⟳', () => this.tryRotate(), { width: 48, height: 42 }),
      new Button(this, 0, 0, '▼', () => this.softDrop(true), { width: 48, height: 42 }),
      new Button(this, 0, 0, 'DROP', () => this.hardDrop(), { width: 74, height: 42, fontSize: 13 }),
      new Button(this, 0, 0, 'HOLD', () => this.holdPiece(), { width: 74, height: 42, fontSize: 13 })
    ];
  }

  private restartGame(): void {
    this.board = Array.from({ length: BOARD_ROWS }, () => Array<BoardCell>(BOARD_COLS).fill(null));
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.holdType = null;
    this.holdUsed = false;
    this.paused = false;
    this.isGameOver = false;
    this.dropAccumulator = 0;
    this.lastUpdate = 0;
    this.nextType = this.randomType();
    this.spawnPiece();
    this.setMessage('Tetris');
    this.announce('Tetris started. Use arrow keys, space for hard drop, C to hold, P to pause.');
    this.drawAll();
  }

  private layoutScene(): void {
    const compact = this.gameWidth < 860;
    const reservedTop = compact ? 128 : 84;
    // Reserve real space for touch controls on tablets / compact screens.
    const reservedBottom = compact ? 118 : 96;
    const maxBoardHeight = Math.max(260, this.gameHeight - reservedTop - reservedBottom);
    const sideSpace = compact ? 26 : 320;
    const maxBoardWidth = this.gameWidth - sideSpace;
    this.cellSize = Math.floor(Math.max(13, Math.min(maxBoardWidth / BOARD_COLS, maxBoardHeight / BOARD_ROWS, compact ? 28 : 34)));
    const boardW = this.cellSize * BOARD_COLS;
    const boardH = this.cellSize * BOARD_ROWS;
    this.boardX = Math.floor(this.centerX - boardW / 2);
    this.boardY = Math.floor(reservedTop + Math.max(0, (maxBoardHeight - boardH) / 2));
    if (!compact) this.boardX = Math.floor(this.centerX - boardW / 2 - 22);

    this.boardBg?.setPosition(this.boardX + boardW / 2, this.boardY + boardH / 2).setSize(boardW + 20, boardH + 20);
    this.menuButton?.setPosition(76, 34);
    this.restartButton?.setPosition(this.gameWidth - 86, 34);
    this.messageText?.setPosition(this.centerX, 36);
    this.controlsText?.setPosition(this.centerX, this.gameHeight - 22);
    this.controlsText?.setVisible(!compact && this.gameHeight >= 560);

    if (compact) {
      this.hudPanel?.setVisible(true).setPosition(this.centerX, 88);
      this.nextPanel?.setVisible(false);
      this.holdPanel?.setVisible(false);
    } else {
      const sideX = this.boardX + boardW + 112;
      const sideY = this.boardY + 48;
      this.hudPanel?.setVisible(true).setPosition(sideX, sideY);
      this.nextPanel?.setVisible(true).setPosition(sideX, sideY + 156);
      this.holdPanel?.setVisible(true).setPosition(sideX, sideY + 302);
    }

    // Keep tablet/mobile controls visible without overlapping the board or footer.
    const showTouch = this.gameWidth < 1180 || this.gameHeight >= 660;
    const touchY = this.gameHeight - 68;
    const totalWidth = 48 * 4 + 74 * 2 + 12 * 5;
    let x = this.centerX - totalWidth / 2;
    this.touchControls.forEach((button, index) => {
      const width = index < 4 ? 48 : 74;
      button.setPosition(x + width / 2, touchY);
      x += width + 12;
    });
    this.touchControls.forEach((button) => button.setVisible(showTouch && this.gameHeight >= 520));
  }

  private spawnPiece(type = this.nextType): void {
    this.current = { type, matrix: this.cloneMatrix(TETROMINOES[type].matrix), row: -1, col: Math.floor(BOARD_COLS / 2) - 2 };
    this.nextType = this.randomType();
    this.holdUsed = false;
    if (!this.isValid(this.current, 0, 0)) this.endGame();
  }

  private tryMove(dx: number, dy: number): boolean {
    if (!this.current || this.paused || this.isGameOver) return false;
    if (!this.isValid(this.current, dx, dy)) return false;
    this.current.col += dx;
    this.current.row += dy;
    if (dx !== 0) this.sound.play('tetris-move', { volume: 0.25 });
    this.drawAll();
    return true;
  }

  private softDrop(manual: boolean): void {
    if (!this.current || this.paused || this.isGameOver) return;
    if (this.tryMove(0, 1)) {
      if (manual) this.score += 1;
      return;
    }
    this.lockPiece();
  }

  private hardDrop(): void {
    if (!this.current || this.paused || this.isGameOver) return;
    let distance = 0;
    while (this.isValid(this.current, 0, 1)) {
      this.current.row += 1;
      distance += 1;
    }
    this.score += distance * 2;
    this.lockPiece();
  }

  private tryRotate(): void {
    if (!this.current || this.paused || this.isGameOver) return;
    if (this.current.type === 'O') return;
    const rotated = this.rotateMatrix(this.current.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      const test: Piece = { ...this.current, matrix: rotated, col: this.current.col + kick };
      if (this.isValid(test, 0, 0)) {
        this.current.matrix = rotated;
        this.current.col += kick;
        this.sound.play('tetris-rotate', { volume: 0.28 });
        this.drawAll();
        return;
      }
    }
  }

  private holdPiece(): void {
    if (!this.current || this.paused || this.isGameOver || this.holdUsed) return;
    const previous = this.holdType;
    this.holdType = this.current.type;
    this.holdUsed = true;
    if (previous) {
      this.current = { type: previous, matrix: this.cloneMatrix(TETROMINOES[previous].matrix), row: -1, col: Math.floor(BOARD_COLS / 2) - 2 };
      if (!this.isValid(this.current, 0, 0)) this.endGame();
    } else {
      this.spawnPiece();
      this.holdUsed = true;
    }
    this.announce(`Held ${TETROMINOES[this.holdType].label}.`);
    this.drawAll();
  }

  private togglePause(): void {
    if (this.isGameOver) return;
    this.paused = !this.paused;
    this.setMessage(this.paused ? 'Paused' : 'Tetris');
    this.announce(this.paused ? 'Game paused.' : 'Game resumed.');
  }

  private lockPiece(): void {
    if (!this.current) return;
    this.forEachBlock(this.current, (col, row) => {
      if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) this.board[row][col] = this.current!.type;
    });
    const cleared = this.clearLines();
    if (cleared > 0) {
      this.lines += cleared;
      this.level = Math.floor(this.lines / 10) + 1;
      this.score += (SCORES[cleared] ?? cleared * 200) * this.level;
      this.sound.play('tetris-line', { volume: 0.45 });
      this.announce(`${cleared} line${cleared > 1 ? 's' : ''} cleared. Score ${this.score}.`);
    }
    this.spawnPiece();
    this.drawAll();
  }

  private clearLines(): number {
    const remaining = this.board.filter((row) => row.some((cell) => cell === null));
    const cleared = BOARD_ROWS - remaining.length;
    while (remaining.length < BOARD_ROWS) remaining.unshift(Array<BoardCell>(BOARD_COLS).fill(null));
    this.board = remaining;
    return cleared;
  }

  private endGame(): void {
    this.isGameOver = true;
    this.current = undefined;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('tetris-high-score', String(this.highScore));
    }
    this.sound.play('tetris-over', { volume: 0.45 });
    this.setMessage('Game Over · Press R to restart');
    this.announce(`Game over. Final score ${this.score}. High score ${this.highScore}.`);
    this.drawAll();
  }

  private isValid(piece: Piece, dx: number, dy: number): boolean {
    let valid = true;
    this.forEachBlock(piece, (col, row) => {
      const nextCol = col + dx;
      const nextRow = row + dy;
      if (nextCol < 0 || nextCol >= BOARD_COLS || nextRow >= BOARD_ROWS) valid = false;
      if (nextRow >= 0 && this.board[nextRow]?.[nextCol]) valid = false;
    });
    return valid;
  }

  private drawAll(): void {
    this.drawGrid();
    this.drawBoardBlocks();
    this.drawGhost();
    this.drawCurrent();
    this.drawHud();
  }

  private drawGrid(): void {
    if (!this.gridGraphics) return;
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0xffffff, 0.08);
    for (let c = 0; c <= BOARD_COLS; c += 1) {
      const x = this.boardX + c * this.cellSize;
      this.gridGraphics.lineBetween(x, this.boardY, x, this.boardY + BOARD_ROWS * this.cellSize);
    }
    for (let r = 0; r <= BOARD_ROWS; r += 1) {
      const y = this.boardY + r * this.cellSize;
      this.gridGraphics.lineBetween(this.boardX, y, this.boardX + BOARD_COLS * this.cellSize, y);
    }
  }

  private drawBoardBlocks(): void {
    this.fixedBlocks?.removeAll(true);
    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const type = this.board[row][col];
        if (type) this.fixedBlocks?.add(this.createBlock(col, row, type));
      }
    }
  }

  private drawCurrent(): void {
    this.activeBlocks?.removeAll(true);
    if (!this.current) return;
    this.forEachBlock(this.current, (col, row) => {
      if (row >= 0) this.activeBlocks?.add(this.createBlock(col, row, this.current!.type));
    });
  }

  private drawGhost(): void {
    this.ghostBlocks?.removeAll(true);
    if (!this.current || this.isGameOver) return;
    const ghost = { ...this.current, matrix: this.cloneMatrix(this.current.matrix) };
    while (this.isValid(ghost, 0, 1)) ghost.row += 1;
    this.forEachBlock(ghost, (col, row) => {
      if (row >= 0) this.ghostBlocks?.add(this.createBlock(col, row, ghost.type, 0.18, true));
    });
  }

  private drawHud(): void {
    this.hudPanel?.removeAll(true);
    this.nextPanel?.removeAll(true);
    this.holdPanel?.removeAll(true);
    const compact = this.gameWidth < 860;
    if (compact) {
      this.hudPanel?.add(this.makeInfoPanel(0, 0, 300, 54, `Score ${this.score}   Level ${this.level}   Lines ${this.lines}`));
      this.nextPanel?.setVisible(false);
      this.holdPanel?.setVisible(false);
    } else {
      this.nextPanel?.setVisible(true);
      this.holdPanel?.setVisible(true);
      this.hudPanel?.add(this.makeInfoPanel(0, 0, 190, 122, `Score\n${this.score}\nLevel ${this.level} · Lines ${this.lines}\nBest ${this.highScore}`));
      this.drawMiniPiece(this.nextPanel!, 'Next', this.nextType);
      this.drawMiniPiece(this.holdPanel!, 'Hold', this.holdType);
    }
  }

  private createBlock(col: number, row: number, type: TetrominoType, alpha = 1, ghost = false): Phaser.GameObjects.Container {
    const x = this.boardX + col * this.cellSize + this.cellSize / 2;
    const y = this.boardY + row * this.cellSize + this.cellSize / 2;
    const container = this.add.container(x, y).setAlpha(alpha);
    const pad = Math.max(1, Math.floor(this.cellSize * 0.08));
    const rect = this.add.rectangle(0, 0, this.cellSize - pad * 2, this.cellSize - pad * 2, TETROMINOES[type].color).setStrokeStyle(ghost ? 2 : 1, ghost ? 0xffffff : 0x020617, ghost ? 0.7 : 0.4);
    const label = this.add.text(0, 0, type, { fontFamily: 'Inter, Arial, sans-serif', fontSize: `${Math.max(10, Math.floor(this.cellSize * 0.42))}px`, color: '#020617', fontStyle: 'bold' }).setOrigin(0.5);
    if ('setRounded' in rect) (rect as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(Math.max(3, this.cellSize * 0.12));
    container.add([rect, label]);
    return container;
  }

  private makeInfoPanel(x: number, y: number, w: number, h: number, text: string): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x0f172a, 0.9).setStrokeStyle(1, 0xffffff, 0.14);
    if ('setRounded' in bg) (bg as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(18);
    const t = this.add.text(0, 0, text, { fontFamily: 'Inter, Arial, sans-serif', fontSize: '16px', color: '#f8fafc', align: 'center', lineSpacing: 6 }).setOrigin(0.5);
    c.add([bg, t]);
    return c;
  }

  private drawMiniPiece(panel: Phaser.GameObjects.Container, title: string, type: TetrominoType | null): void {
    const width = 190;
    const height = 126;
    const bg = this.add.rectangle(0, 0, width, height, 0x0f172a, 0.9).setStrokeStyle(1, 0xffffff, 0.14);
    if ('setRounded' in bg) (bg as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(18);
    const label = this.add.text(0, -44, title, { fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px', color: '#cbd5e1' }).setOrigin(0.5);
    panel.add([bg, label]);
    if (!type) {
      panel.add(this.add.text(0, 12, '—', { fontFamily: 'Inter, Arial, sans-serif', fontSize: '24px', color: '#94a3b8' }).setOrigin(0.5));
      return;
    }
    const matrix = TETROMINOES[type].matrix;
    const mini = 20;
    const offsetX = -(matrix[0].length * mini) / 2 + mini / 2;
    const offsetY = -10;
    matrix.forEach((row, r) => row.forEach((cell, c) => {
      if (!cell) return;
      const block = this.add.rectangle(offsetX + c * mini, offsetY + r * mini, mini - 3, mini - 3, TETROMINOES[type].color).setStrokeStyle(1, 0x020617, 0.3);
      const letter = this.add.text(offsetX + c * mini, offsetY + r * mini, type, { fontFamily: 'Inter, Arial, sans-serif', fontSize: '10px', color: '#020617', fontStyle: 'bold' }).setOrigin(0.5);
      panel.add([block, letter]);
    }));
  }

  private forEachBlock(piece: Piece, callback: (col: number, row: number) => void): void {
    piece.matrix.forEach((line, r) => line.forEach((cell, c) => {
      if (cell) callback(piece.col + c, piece.row + r);
    }));
  }

  private rotateMatrix(matrix: number[][]): number[][] {
    return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
  }

  private cloneMatrix(matrix: number[][]): number[][] {
    return matrix.map((row) => [...row]);
  }

  private randomType(): TetrominoType {
    return Phaser.Utils.Array.GetRandom(TETROMINO_TYPES);
  }

  private getDropInterval(): number {
    return Math.max(90, 760 - (this.level - 1) * 62);
  }

  private setMessage(message: string): void {
    this.messageText?.setText(message);
  }
}
