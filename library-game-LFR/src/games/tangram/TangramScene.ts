import Phaser from "phaser";
import { Button } from "../../shared/Button";
import { GameSceneBase } from "../../shared/GameSceneBase";
import { SCENE_KEYS } from "../../shared/sceneKeys";
import {
  FIGURES,
  PIECES,
  TANGRAM_SCENE_KEY,
  type TangramFigure,
  type TangramPieceDefinition,
  type TangramPieceId,
  type TangramPlacement,
  type TangramPoint,
} from "./tangramConfig";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TangramPieceRuntime {
  id: TangramPieceId;
  definition: TangramPieceDefinition;
  container: Phaser.GameObjects.Container;
  graphics: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  placedInCenter: boolean;
  flipped: boolean;
}

export class TangramScene extends GameSceneBase {
  private leftArea: Area = { x: 0, y: 0, width: 0, height: 0 };
  private centerArea: Area = { x: 0, y: 0, width: 0, height: 0 };
  private rightArea: Area = { x: 0, y: 0, width: 0, height: 0 };
  private figureIndex = 0;
  private currentFigure: TangramFigure = FIGURES[0];
  private pieces = new Map<TangramPieceId, TangramPieceRuntime>();
  private selectedPiece?: TangramPieceRuntime;
  private guideVisible = false;
  private completed = false;
  private titleText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private leftTitle?: Phaser.GameObjects.Text;
  private centerTitle?: Phaser.GameObjects.Text;
  private rightTitle?: Phaser.GameObjects.Text;
  private leftPanel?: Phaser.GameObjects.Rectangle;
  private centerPanel?: Phaser.GameObjects.Rectangle;
  private rightPanel?: Phaser.GameObjects.Rectangle;
  private guideGraphics?: Phaser.GameObjects.Graphics;
  private targetGraphics?: Phaser.GameObjects.Graphics;
  private guideImage?: Phaser.GameObjects.Image;
  private targetImage?: Phaser.GameObjects.Image;
  private selectedHalo?: Phaser.GameObjects.Rectangle;
  private rotateLeftButton?: Button;
  private rotateRightButton?: Button;
  private flipButton?: Button;
  private helpButton?: Button;
  private nextButton?: Button;
  private menuButton?: Button;
  private dragOffset = new Phaser.Math.Vector2(0, 0);
  private draggingPieceId?: TangramPieceId;

  constructor() {
    super(TANGRAM_SCENE_KEY);
  }

  preload(): void {
    FIGURES.forEach((figure) => {
      this.load.image(`tangram-help-${figure.id}`, `tangram/help/${figure.id}.png`);
      this.load.image(`tangram-target-${figure.id}`, `tangram/target/${figure.id}.png`);
    });
  }

  create(): void {
    super.create();
    this.cameras.main.setBackgroundColor("#07111f");
    this.input.topOnly = true;
    this.createStaticUi();
    this.createPieces();
    this.input.on(
      Phaser.Input.Events.POINTER_DOWN,
      (
        pointer: Phaser.Input.Pointer,
        currentlyOver: Phaser.GameObjects.GameObject[] = [],
      ) => this.handlePointerDown(pointer, currentlyOver),
    );
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => this.dragActivePiece(pointer));
    this.input.on(Phaser.Input.Events.POINTER_UP, () => this.endActiveDrag());
    this.loadFigure(0);
    this.createKeyboardControls();
    this.announce(
      "Tangram game. Drag pieces into the center, rotate selected pieces, and match the target figure.",
    );
  }

  protected onResize(): void {
    this.layoutScene();
    this.resetFigure(false);
  }

  private createStaticUi(): void {
    this.add.rectangle(
      this.centerX,
      this.centerY,
      this.gameWidth,
      this.gameHeight,
      0x07111f,
    );
    this.add.circle(
      this.gameWidth * 0.1,
      this.gameHeight * 0.16,
      Math.max(90, this.gameWidth * 0.1),
      0x0ea5e9,
      0.14,
    );
    this.add.circle(
      this.gameWidth * 0.9,
      this.gameHeight * 0.82,
      Math.max(120, this.gameWidth * 0.14),
      0x8b5cf6,
      0.12,
    );

    this.leftPanel = this.add
      .rectangle(0, 0, 10, 10, 0x0f172a, 0.92)
      .setStrokeStyle(2, 0xffffff, 0.11);
    this.centerPanel = this.add
      .rectangle(0, 0, 10, 10, 0x111827, 0.9)
      .setStrokeStyle(2, 0x38bdf8, 0.28);
    this.rightPanel = this.add
      .rectangle(0, 0, 10, 10, 0x0f172a, 0.92)
      .setStrokeStyle(2, 0xffffff, 0.11);
    [this.leftPanel, this.centerPanel, this.rightPanel].forEach((panel) => {
      if (panel && "setRounded" in panel)
        (
          panel as Phaser.GameObjects.Rectangle & {
            setRounded: (r: number) => void;
          }
        ).setRounded(24);
    });

    this.titleText = this.makeText(
      this.centerX,
      30,
      "Tangram Puzzle",
      27,
      "#f8fafc",
    );
    this.leftTitle = this.makeText(0, 0, "Pieces", 17, "#dbeafe");
    this.centerTitle = this.makeText(0, 0, "Build the figure", 17, "#dbeafe");
    this.rightTitle = this.makeText(0, 0, "Target", 17, "#dbeafe");
    this.statusText = this.makeText(
      this.centerX,
      this.gameHeight - 22,
      "Drag pieces to the center. Select one, rotate 45° with Q/E, or flip it with F.",
      14,
      "#cbd5e1",
    );

    this.guideGraphics = this.add.graphics().setDepth(2);
    this.targetGraphics = this.add.graphics().setDepth(2);
    this.guideImage = this.add.image(0, 0, `tangram-help-${this.currentFigure.id}`).setDepth(2).setVisible(false).setAlpha(0.72);
    this.targetImage = this.add.image(0, 0, `tangram-target-${this.currentFigure.id}`).setDepth(2).setVisible(false).setAlpha(0.95);
    this.selectedHalo = this.add
      .rectangle(0, 0, 10, 10, 0xffffff, 0)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setVisible(false)
      .setDepth(20);

    this.centerPanel?.setInteractive({ useHandCursor: false });
    this.rightPanel?.setInteractive({ useHandCursor: false });
    this.centerPanel?.on(Phaser.Input.Events.POINTER_DOWN, () =>
      this.deselectPiece(),
    );
    this.rightPanel?.on(Phaser.Input.Events.POINTER_DOWN, () =>
      this.deselectPiece(),
    );

    this.menuButton = new Button(
      this,
      76,
      34,
      "Menu",
      () => this.returnToMenu(),
      {
        width: 112,
        height: 40,
        backgroundColor: 0x475569,
        hoverColor: 0x64748b,
        activeColor: 0x334155,
      },
    ).setDepth(1000);
    this.helpButton = new Button(
      this,
      0,
      0,
      "Help: Off",
      () => this.toggleGuide(),
      {
        width: 118,
        height: 40,
        backgroundColor: 0x7c3aed,
        hoverColor: 0x8b5cf6,
        activeColor: 0x6d28d9,
      },
    ).setDepth(1000);
    this.nextButton = new Button(
      this,
      0,
      0,
      "Next Figure",
      () => this.nextFigure(),
      { width: 138, height: 40 },
    ).setDepth(1000);
    this.rotateLeftButton = new Button(
      this,
      0,
      0,
      "↺45°",
      () => this.rotateSelected(-45),
      {
        width: 58,
        height: 38,
        fontSize: 15,
        backgroundColor: 0x0ea5e9,
        hoverColor: 0x38bdf8,
        activeColor: 0x0284c7,
      },
    ).setDepth(1000);
    this.rotateRightButton = new Button(
      this,
      0,
      0,
      "↻45°",
      () => this.rotateSelected(45),
      {
        width: 58,
        height: 38,
        fontSize: 15,
        backgroundColor: 0x0ea5e9,
        hoverColor: 0x38bdf8,
        activeColor: 0x0284c7,
      },
    ).setDepth(1000);
    this.flipButton = new Button(
      this,
      0,
      0,
      "Flip",
      () => this.flipSelected(),
      {
        width: 64,
        height: 38,
        fontSize: 15,
        backgroundColor: 0xf97316,
        hoverColor: 0xfb923c,
        activeColor: 0xea580c,
      },
    ).setDepth(1000);

    this.layoutScene();
  }

  private layoutScene(): void {
    this.updateSceneSize();
    const top = 72;
    const bottom = this.gameHeight >= 650 ? 58 : 42;
    const gap = this.gameWidth >= 920 ? 18 : 10;
    const availableHeight = Math.max(360, this.gameHeight - top - bottom);
    const isWide = this.gameWidth >= 900;

    if (isWide) {
      const availableWidth = this.gameWidth - gap * 4;
      const leftW = availableWidth * 0.25;
      const centerW = availableWidth * 0.5;
      const rightW = availableWidth * 0.25;
      this.leftArea = { x: gap, y: top, width: leftW, height: availableHeight };
      this.centerArea = {
        x: gap * 2 + leftW,
        y: top,
        width: centerW,
        height: availableHeight,
      };
      this.rightArea = {
        x: gap * 3 + leftW + centerW,
        y: top,
        width: rightW,
        height: availableHeight,
      };
    } else {
      const sideW = Math.floor((this.gameWidth - gap * 3) / 2);
      const sideH = Math.max(118, availableHeight * 0.27);
      this.centerArea = {
        x: gap,
        y: top,
        width: this.gameWidth - gap * 2,
        height: availableHeight - sideH - gap,
      };
      this.leftArea = {
        x: gap,
        y: top + this.centerArea.height + gap,
        width: sideW,
        height: sideH,
      };
      this.rightArea = {
        x: gap * 2 + sideW,
        y: this.leftArea.y,
        width: sideW,
        height: sideH,
      };
    }

    this.layoutPanel(this.leftPanel, this.leftArea);
    this.layoutPanel(this.centerPanel, this.centerArea);
    this.layoutPanel(this.rightPanel, this.rightArea);
    this.titleText?.setPosition(this.centerX, 30);
    this.leftTitle?.setPosition(
      this.leftArea.x + this.leftArea.width / 2,
      this.leftArea.y + 24,
    );
    this.centerTitle?.setPosition(
      this.centerArea.x + this.centerArea.width / 2,
      this.centerArea.y + 24,
    );
    this.rightTitle?.setPosition(
      this.rightArea.x + this.rightArea.width / 2,
      this.rightArea.y + 24,
    );
    this.statusText?.setPosition(this.centerX, this.gameHeight - 21);
    this.statusText?.setFontSize(this.gameWidth < 760 ? 12 : 14);
    this.menuButton?.setPosition(76, 34);

    const controlsY = 32;
    const edgePadding = 18;
    const nextWidth = 138;
    const helpWidth = 118;
    const buttonGap = 12;
    const nextX = this.gameWidth - edgePadding - nextWidth / 2;
    const helpX = nextX - nextWidth / 2 - buttonGap - helpWidth / 2;
    this.helpButton?.setPosition(helpX, controlsY);
    this.nextButton?.setPosition(nextX, controlsY);

    this.drawGuide();
    this.drawTarget();
    this.updateRotateControls();
  }

  private layoutPanel(
    panel: Phaser.GameObjects.Rectangle | undefined,
    area: Area,
  ): void {
    panel
      ?.setPosition(area.x + area.width / 2, area.y + area.height / 2)
      .setSize(area.width, area.height);
  }

  private createPieces(): void {
    PIECES.forEach((definition) => {
      const container = this.add.container(0, 0).setDepth(10);
      const graphics = this.add.graphics();
      const label = this.add
        .text(0, 0, definition.shortLabel, {
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "16px",
          color: "#082f49",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      container.add([graphics, label]);
      const hitPolygon = new Phaser.Geom.Polygon(
        definition.points.map(
          (point) => new Phaser.Geom.Point(point.x, point.y),
        ),
      );
      container.setSize(180, 180);
      void hitPolygon;
      const runtime = {
        id: definition.id,
        definition,
        container,
        graphics,
        label,
        placedInCenter: false,
        flipped: false,
      };
      this.pieces.set(definition.id, runtime);
      this.drawPiece(runtime);
    });
  }

  private loadFigure(index: number): void {
    this.figureIndex = Phaser.Math.Wrap(index, 0, FIGURES.length);
    this.currentFigure = FIGURES[this.figureIndex];
    this.resetFigure(false);
    this.setStatus(
      `${this.currentFigure.name}: ${this.currentFigure.description}`,
    );
    this.announce(
      `Tangram figure ${this.currentFigure.name}. ${this.currentFigure.description}`,
    );
  }

  private resetFigure(announce = true): void {
    this.completed = false;
    this.guideVisible = false;
    this.helpButton?.setText("Help: Off");
    this.selectedPiece = undefined;
    const slots = this.getTraySlots();
    PIECES.forEach((definition, index) => {
      const runtime = this.pieces.get(definition.id);
      if (!runtime) return;
      runtime.placedInCenter = false;
      runtime.flipped = false;
      runtime.container.setPosition(slots[index].x, slots[index].y);
      runtime.container.setRotation(0);
      this.applyPieceScale(runtime, this.getTrayScale());
      runtime.container.setDepth(10 + index);
      this.drawPiece(runtime);
    });
    this.drawGuide();
    this.drawTarget();
    this.updateRotateControls();
    if (announce)
      this.announce(
        `${this.currentFigure.name} reset. All pieces returned to the tray.`,
      );
  }

  private getPlayableScale(): number {
    return Phaser.Math.Clamp(
      Math.min(this.centerArea.width / 620, this.centerArea.height / 470),
      0.46,
      1,
    );
  }

  private getTrayScale(): number {
    const playable = this.getPlayableScale();
    const maxPieceSize = 170;
    const small = this.gameWidth < 900;
    const cols = small ? 4 : 2;
    const rows = small ? 2 : 4;
    const byWidth = (this.leftArea.width - 36) / (cols * maxPieceSize);
    const byHeight = (this.leftArea.height - 82) / (rows * maxPieceSize);
    return Phaser.Math.Clamp(
      Math.min(playable, byWidth, byHeight),
      0.33,
      playable,
    );
  }

  private getTraySlots(): Array<{ x: number; y: number }> {
    const small = this.gameWidth < 900;
    const cols = small ? 4 : 2;
    const rows = Math.ceil(PIECES.length / cols);
    const slotW = (this.leftArea.width - 28) / cols;
    const slotH = (this.leftArea.height - 76) / rows;
    return PIECES.map((_, i) => ({
      x: this.leftArea.x + 14 + slotW * (i % cols) + slotW / 2,
      y: this.leftArea.y + 58 + slotH * Math.floor(i / cols) + slotH / 2,
    }));
  }

  private handlePointerDown(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Phaser.GameObjects.GameObject[] = [],
  ): void {
    const overUi = currentlyOver.some((object) =>
      [
        this.menuButton,
        this.helpButton,
        this.nextButton,
        this.rotateLeftButton,
        this.rotateRightButton,
        this.flipButton,
      ].includes(object as Button),
    );
    if (overUi) return;

    const piece = this.findTopPieceAt(pointer.worldX, pointer.worldY);
    if (piece) {
      this.startDrag(piece.id, pointer);
      return;
    }

    if (
      this.isPointInArea(pointer.worldX, pointer.worldY, this.centerArea) ||
      this.isPointInArea(pointer.worldX, pointer.worldY, this.rightArea)
    ) {
      this.deselectPiece();
    }
  }

  private findTopPieceAt(x: number, y: number): TangramPieceRuntime | undefined {
    return Array.from(this.pieces.values())
      .sort((a, b) => b.container.depth - a.container.depth)
      .find((piece) => this.pointInPolygon(x, y, this.getWorldPoints(piece)));
  }

  private pointInPolygon(
    x: number,
    y: number,
    polygon: Phaser.Math.Vector2[],
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersects =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 0.00001) + xi;
      if (intersects) inside = !inside;
    }
    return inside;
  }

  private startDrag(id: TangramPieceId, pointer: Phaser.Input.Pointer): void {
    const piece = this.pieces.get(id);
    if (!piece || this.completed) return;

    this.selectPiece(piece);
    this.draggingPieceId = id;
    this.dragOffset.set(
      piece.container.x - pointer.worldX,
      piece.container.y - pointer.worldY,
    );
    piece.container.setDepth(40);
    this.updateRotateControls();
  }

  private dragActivePiece(pointer: Phaser.Input.Pointer): void {
    if (!this.draggingPieceId || !pointer.isDown || this.completed) return;
    const piece = this.pieces.get(this.draggingPieceId);
    if (!piece || this.selectedPiece?.id !== piece.id) return;

    const nextX = pointer.worldX + this.dragOffset.x;
    const nextY = pointer.worldY + this.dragOffset.y;
    piece.container.setPosition(nextX, nextY);

    const inCenter = this.pieceTouchesArea(piece, this.centerArea);
    piece.placedInCenter = inCenter;
    this.applyPieceScale(piece, inCenter ? this.getPlayableScale() : this.getTrayScale());
    if (inCenter) this.keepPieceInsideBounds(piece);
    this.updateRotateControls();
  }

  private endActiveDrag(): void {
    if (!this.draggingPieceId) return;
    const piece = this.pieces.get(this.draggingPieceId);
    this.draggingPieceId = undefined;
    if (!piece || this.selectedPiece?.id !== piece.id) return;

    piece.placedInCenter = this.pieceTouchesArea(piece, this.centerArea);
    if (piece.placedInCenter) {
      this.applyPieceScale(piece, this.getPlayableScale());
      this.resolvePlacement(piece);
    } else {
      this.snapPieceToTray(piece);
    }
    piece.container.setDepth(18);
    this.updateRotateControls();
    this.checkCompletion();
  }

  private selectPiece(piece: TangramPieceRuntime): void {
    // Selecting a new piece never moves or resets the previous one.
    // The previously active piece simply stays wherever the player left it.
    this.selectedPiece = piece;
    this.pieces.forEach((runtime) =>
      this.drawPiece(runtime, runtime.id === piece.id),
    );
    this.updateRotateControls();
    this.announce(`${piece.definition.label} selected.`);
  }

  private deselectPiece(): void {
    if (!this.selectedPiece) return;
    this.draggingPieceId = undefined;
    this.selectedPiece = undefined;
    this.pieces.forEach((runtime) => this.drawPiece(runtime));
    this.updateRotateControls();
  }

  private rotateSelected(delta: number): void {
    if (!this.selectedPiece || this.completed) return;
    this.draggingPieceId = undefined;
    const piece = this.selectedPiece;
    const oldRotation = piece.container.angle;
    piece.container.setAngle(
      Phaser.Math.Angle.WrapDegrees(oldRotation + delta),
    );
    this.keepPieceInsideBounds(piece);
    this.resolvePlacement(piece);
    this.tweens.add({
      targets: piece.container,
      scaleY: Math.abs(piece.container.scaleY) * 1.025,
      yoyo: true,
      duration: 90,
    });
    this.updateRotateControls();
    this.checkCompletion();
  }

  private applyPieceScale(piece: TangramPieceRuntime, scale: number): void {
    const safeScale = Math.abs(scale);
    piece.container.setScale(piece.flipped ? -safeScale : safeScale, safeScale);
  }

  private flipSelected(): void {
    if (!this.selectedPiece || this.completed) return;
    this.draggingPieceId = undefined;
    const piece = this.selectedPiece;
    piece.flipped = !piece.flipped;
    this.applyPieceScale(piece, Math.abs(piece.container.scaleX));
    this.keepPieceInsideBounds(piece);
    this.resolvePlacement(piece);
    this.tweens.add({
      targets: piece.container,
      scaleY: Math.abs(piece.container.scaleY) * 1.04,
      yoyo: true,
      duration: 100,
    });
    this.updateRotateControls();
    this.checkCompletion();
    this.announce(`${piece.definition.label} flipped.`);
  }

  private snapPieceToTray(piece: TangramPieceRuntime): void {
    const index = PIECES.findIndex((candidate) => candidate.id === piece.id);
    const slot = this.getTraySlots()[index];
    piece.placedInCenter = false;
    this.applyPieceScale(piece, this.getTrayScale());
    this.tweens.add({
      targets: piece.container,
      x: slot.x,
      y: slot.y,
      angle: 0,
      duration: 150,
      ease: "Sine.easeOut",
      onComplete: () => this.updateRotateControls(),
    });
  }

  private resolvePlacement(piece: TangramPieceRuntime): void {
    this.keepPieceInsideBounds(piece);
    if (!piece.placedInCenter) return;
    if (!this.overlapsAny(piece)) return;
    const original = new Phaser.Math.Vector2(
      piece.container.x,
      piece.container.y,
    );
    const step = 12;
    const maxRadius = 132;
    for (let radius = step; radius <= maxRadius; radius += step) {
      for (let angle = 0; angle < 360; angle += 30) {
        piece.container.setPosition(
          original.x + Math.cos(Phaser.Math.DegToRad(angle)) * radius,
          original.y + Math.sin(Phaser.Math.DegToRad(angle)) * radius,
        );
        this.keepPieceInsideBounds(piece);
        if (!this.overlapsAny(piece)) return;
      }
    }
    this.snapPieceToTray(piece);
    this.setStatus(
      "That spot overlaps another piece. The piece was returned safely to the tray.",
    );
  }

  private keepPieceInsideBounds(piece: TangramPieceRuntime): void {
    if (!piece.placedInCenter) return;
    const bounds = this.getWorldBounds(piece);
    let dx = 0;
    let dy = 0;
    if (bounds.left < this.centerArea.x + 10)
      dx = this.centerArea.x + 10 - bounds.left;
    if (bounds.right > this.centerArea.x + this.centerArea.width - 10)
      dx = this.centerArea.x + this.centerArea.width - 10 - bounds.right;
    if (bounds.top < this.centerArea.y + 48)
      dy = this.centerArea.y + 48 - bounds.top;
    if (bounds.bottom > this.centerArea.y + this.centerArea.height - 10)
      dy = this.centerArea.y + this.centerArea.height - 10 - bounds.bottom;
    if (dx !== 0 || dy !== 0)
      piece.container.setPosition(
        piece.container.x + dx,
        piece.container.y + dy,
      );
  }

  private overlapsAny(piece: TangramPieceRuntime): boolean {
    return Array.from(this.pieces.values()).some(
      (other) =>
        other.id !== piece.id &&
        other.placedInCenter &&
        this.polygonsOverlap(
          this.getWorldPoints(piece),
          this.getWorldPoints(other),
        ),
    );
  }

  private polygonsOverlap(
    a: Phaser.Math.Vector2[],
    b: Phaser.Math.Vector2[],
  ): boolean {
    return (
      this.hasSeparatingAxis(a, b) === false &&
      this.hasSeparatingAxis(b, a) === false
    );
  }

  private hasSeparatingAxis(
    a: Phaser.Math.Vector2[],
    b: Phaser.Math.Vector2[],
  ): boolean {
    for (let i = 0; i < a.length; i += 1) {
      const p1 = a[i];
      const p2 = a[(i + 1) % a.length];
      const axis = new Phaser.Math.Vector2(
        -(p2.y - p1.y),
        p2.x - p1.x,
      ).normalize();
      const rangeA = this.projectPolygon(a, axis);
      const rangeB = this.projectPolygon(b, axis);
      if (rangeA.max < rangeB.min + 1 || rangeB.max < rangeA.min + 1)
        return true;
    }
    return false;
  }

  private projectPolygon(
    points: Phaser.Math.Vector2[],
    axis: Phaser.Math.Vector2,
  ): { min: number; max: number } {
    let min = points[0].dot(axis);
    let max = min;
    points.slice(1).forEach((point) => {
      const projection = point.dot(axis);
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    });
    return { min, max };
  }

  private getWorldPoints(
    piece: TangramPieceRuntime,
    placement?: TangramPlacement,
    scale = Math.abs(piece.container.scaleX),
  ): Phaser.Math.Vector2[] {
    const angle = Phaser.Math.DegToRad(
      placement ? placement.rotation : piece.container.angle,
    );
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = placement ? this.modelToWorld(placement).x : piece.container.x;
    const y = placement ? this.modelToWorld(placement).y : piece.container.y;
    const flipSign = (placement?.flipped ?? piece.flipped) ? -1 : 1;
    return piece.definition.points.map((point) => {
      const localX = point.x * flipSign;
      const localY = point.y;
      return new Phaser.Math.Vector2(
        x + (localX * cos - localY * sin) * scale,
        y + (localX * sin + localY * cos) * scale,
      );
    });
  }

  private getWorldBounds(piece: TangramPieceRuntime): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    const points = this.getWorldPoints(piece);
    return {
      left: Math.min(...points.map((point) => point.x)),
      right: Math.max(...points.map((point) => point.x)),
      top: Math.min(...points.map((point) => point.y)),
      bottom: Math.max(...points.map((point) => point.y)),
    };
  }

  private checkCompletion(): void {
    if (this.completed) return;
    const positionTolerance = 28 * this.getPlayableScale();
    const rotationTolerance = 12;
    const solved = Array.from(this.pieces.values()).every((piece) => {
      if (!piece.placedInCenter) return false;
      const expected = this.currentFigure.solution[piece.id];
      const expectedWorld = this.modelToWorld(expected);
      const distance = Phaser.Math.Distance.Between(
        piece.container.x,
        piece.container.y,
        expectedWorld.x,
        expectedWorld.y,
      );
      const rotationDelta = Math.abs(
        Phaser.Math.Angle.ShortestBetween(
          piece.container.angle,
          expected.rotation,
        ),
      );
      const flipMatches = expected.flipped === undefined || expected.flipped === piece.flipped;
      return (
        distance <= positionTolerance &&
        rotationDelta <= rotationTolerance &&
        flipMatches
      );
    });
    if (!solved) return;
    this.completed = true;
    this.setStatus(
      `Great job! ${this.currentFigure.name} completed. Choose Next Figure to continue.`,
    );
    this.announce(`${this.currentFigure.name} completed.`);
    this.tweens.add({
      targets: Array.from(this.pieces.values()).map((p) => p.container),
      scale: this.getPlayableScale() * 1.04,
      yoyo: true,
      duration: 180,
    });
  }

  private toggleGuide(): void {
    this.guideVisible = !this.guideVisible;
    this.helpButton?.setText(this.guideVisible ? "Help: On" : "Help: Off");
    this.drawGuide();
    this.announce(
      this.guideVisible ? "Help guide visible." : "Help guide hidden.",
    );
  }

  private nextFigure(): void {
    this.loadFigure(this.figureIndex + 1);
  }

  private drawPiece(piece: TangramPieceRuntime, selected = false): void {
    const graphics = piece.graphics;
    graphics.clear();
    graphics.lineStyle(
      selected ? 4 : 2,
      selected ? 0xffffff : 0x0f172a,
      selected ? 0.96 : 0.7,
    );
    graphics.fillStyle(piece.definition.color, 0.96);
    const points = piece.definition.points;
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    piece.label.setText(piece.definition.shortLabel);
    piece.label.setPosition(0, 0);
    if (selected) {
      this.selectedHalo
        ?.setVisible(true)
        .setPosition(piece.container.x, piece.container.y)
        .setSize(118 * Math.abs(piece.container.scaleX), 118 * Math.abs(piece.container.scaleY))
        .setRotation(piece.container.rotation);
    }
  }

  private drawGuide(): void {
    this.guideGraphics?.clear();
    if (!this.guideImage) return;

    if (!this.guideVisible) {
      this.guideImage.setVisible(false);
      return;
    }

    const textureKey = `tangram-help-${this.currentFigure.id}`;
    if (this.textures.exists(textureKey)) {
      this.guideImage.setTexture(textureKey);
      this.fitImageInArea(this.guideImage, this.centerArea, 0.9, 0.78, 16);
      this.guideImage.setVisible(true);
    }
  }

  private drawTarget(): void {
    this.targetGraphics?.clear();
    const textureKey = `tangram-target-${this.currentFigure.id}`;
    if (this.targetImage && this.textures.exists(textureKey)) {
      this.targetImage.setTexture(textureKey);
      this.fitImageInArea(this.targetImage, this.rightArea, 0.82, 0.58, 20);
      this.targetImage.setVisible(true);
    }
    const name = `${this.currentFigure.name} ${this.figureIndex + 1}/${FIGURES.length}`;
    this.rightTitle?.setText(`Target: ${name}`);
  }

  private fitImageInArea(
    image: Phaser.GameObjects.Image,
    area: Area,
    maxWidthRatio: number,
    maxHeightRatio: number,
    verticalOffset = 0,
  ): void {
    const source = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const sourceWidth = source.width || image.width || 1;
    const sourceHeight = source.height || image.height || 1;
    const maxWidth = area.width * maxWidthRatio;
    const maxHeight = Math.max(60, area.height * maxHeightRatio);
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
    image
      .setPosition(area.x + area.width / 2, area.y + area.height / 2 + verticalOffset)
      .setDisplaySize(sourceWidth * scale, sourceHeight * scale);
  }

  private getFigureOutlinePoints(
    mode: "world" | "preview",
  ): Phaser.Math.Vector2[] {
    if (this.currentFigure.outline.length === 0) {
      return this.getFigureHullPoints(mode);
    }
    if (mode === "world")
      return this.currentFigure.outline.map((point) =>
        this.modelPointToWorld(point),
      );
    return this.currentFigure.outline.map((point) =>
      this.modelPointToPreview(point),
    );
  }

  private getFigureHullPoints(
    mode: "world" | "preview",
  ): Phaser.Math.Vector2[] {
    const points: Phaser.Math.Vector2[] = [];
    PIECES.forEach((definition) => {
      const placement = this.currentFigure.solution[definition.id];
      const runtime = this.pieces.get(definition.id);
      if (!runtime) return;
      if (mode === "world") {
        points.push(
          ...this.getWorldPoints(runtime, placement, this.getPlayableScale()),
        );
      } else {
        points.push(
          ...this.modelToPreviewPoints(
            definition,
            placement,
            this.getPlayableScale() / 3,
          ),
        );
      }
    });
    return this.convexHull(points);
  }

  private convexHull(points: Phaser.Math.Vector2[]): Phaser.Math.Vector2[] {
    if (points.length <= 3) return points;
    const sorted = [...points].sort((a, b) =>
      a.x === b.x ? a.y - b.y : a.x - b.x,
    );
    const cross = (
      o: Phaser.Math.Vector2,
      a: Phaser.Math.Vector2,
      b: Phaser.Math.Vector2,
    ) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower: Phaser.Math.Vector2[] = [];
    sorted.forEach((point) => {
      while (
        lower.length >= 2 &&
        cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
      )
        lower.pop();
      lower.push(point);
    });
    const upper: Phaser.Math.Vector2[] = [];
    [...sorted].reverse().forEach((point) => {
      while (
        upper.length >= 2 &&
        cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
      )
        upper.pop();
      upper.push(point);
    });
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

  private modelToPreviewPoints(
    definition: TangramPieceDefinition,
    placement: TangramPlacement,
    scale: number,
  ): Phaser.Math.Vector2[] {
    const targetCenterX = this.rightArea.x + this.rightArea.width / 2;
    const targetCenterY = this.rightArea.y + this.rightArea.height / 2 + 8;
    const baseCenter = { x: 310, y: 245 };
    const areaScale = Phaser.Math.Clamp(
      Math.min(this.rightArea.width / 260, this.rightArea.height / 220),
      0.55,
      1.4,
    );
    const angle = Phaser.Math.DegToRad(placement.rotation);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const px = targetCenterX + (placement.x - baseCenter.x) * scale * areaScale;
    const py = targetCenterY + (placement.y - baseCenter.y) * scale * areaScale;
    return definition.points.map(
      (point) =>
        new Phaser.Math.Vector2(
          px + (point.x * cos - point.y * sin) * scale * areaScale,
          py + (point.x * sin + point.y * cos) * scale * areaScale,
        ),
    );
  }

  private modelPointToWorld(point: TangramPoint): Phaser.Math.Vector2 {
    const scale = this.getPlayableScale();
    const baseCenter = { x: 310, y: 245 };
    return new Phaser.Math.Vector2(
      this.centerArea.x +
        this.centerArea.width / 2 +
        (point.x - baseCenter.x) * scale,
      this.centerArea.y +
        this.centerArea.height / 2 +
        (point.y - baseCenter.y) * scale +
        12,
    );
  }

  private modelPointToPreview(point: TangramPoint): Phaser.Math.Vector2 {
    const targetCenterX = this.rightArea.x + this.rightArea.width / 2;
    const targetCenterY = this.rightArea.y + this.rightArea.height / 2 + 8;
    const baseCenter = { x: 310, y: 245 };
    const scale = this.getPlayableScale() / 3;
    const areaScale = Phaser.Math.Clamp(
      Math.min(this.rightArea.width / 260, this.rightArea.height / 220),
      0.55,
      1.4,
    );
    return new Phaser.Math.Vector2(
      targetCenterX + (point.x - baseCenter.x) * scale * areaScale,
      targetCenterY + (point.y - baseCenter.y) * scale * areaScale,
    );
  }

  private modelToWorld(placement: TangramPlacement): Phaser.Math.Vector2 {
    const scale = this.getPlayableScale();
    const baseCenter = { x: 310, y: 245 };
    return new Phaser.Math.Vector2(
      this.centerArea.x +
        this.centerArea.width / 2 +
        (placement.x - baseCenter.x) * scale,
      this.centerArea.y +
        this.centerArea.height / 2 +
        (placement.y - baseCenter.y) * scale +
        12,
    );
  }

  private updateRotateControls(): void {
    if (!this.selectedPiece || this.completed) {
      this.rotateLeftButton?.setVisible(false);
      this.rotateRightButton?.setVisible(false);
      this.flipButton?.setVisible(false);
      this.selectedHalo?.setVisible(false);
      return;
    }

    const piece = this.selectedPiece;
    const bounds = this.getWorldBounds(piece);
    const proposedY = bounds.top - 26;
    const y = Phaser.Math.Clamp(proposedY, 74, this.gameHeight - 68);
    const x = Phaser.Math.Clamp(piece.container.x, 62, this.gameWidth - 62);

    this.rotateLeftButton?.setVisible(true).setPosition(x - 72, y);
    this.flipButton?.setVisible(true).setPosition(x, y);
    this.rotateRightButton?.setVisible(true).setPosition(x + 72, y);
    this.selectedHalo
      ?.setVisible(true)
      .setPosition(piece.container.x, piece.container.y)
      .setSize(132 * Math.abs(piece.container.scaleX), 132 * Math.abs(piece.container.scaleY))
      .setRotation(piece.container.rotation);
  }

  private returnToMenu(): void {
    this.draggingPieceId = undefined;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.POINTER_UP);
    this.scene.start(SCENE_KEYS.menu);
  }

  private createKeyboardControls(): void {
    this.input.keyboard?.on("keydown-Q", () => this.rotateSelected(-45));
    this.input.keyboard?.on("keydown-E", () => this.rotateSelected(45));
    this.input.keyboard?.on("keydown-F", () => this.flipSelected());
    this.input.keyboard?.on("keydown-H", () => this.toggleGuide());
    this.input.keyboard?.on("keydown-R", () => this.resetFigure());
    this.input.keyboard?.on("keydown-N", () => this.nextFigure());
    this.input.keyboard?.on("keydown-ESC", () => this.returnToMenu());
    this.input.keyboard?.on("keydown-TAB", (event: KeyboardEvent) => {
      event.preventDefault();
      const list = Array.from(this.pieces.values());
      const current = this.selectedPiece
        ? list.findIndex((piece) => piece.id === this.selectedPiece?.id)
        : -1;
      this.selectPiece(list[(current + 1) % list.length]);
    });
    this.input.keyboard?.on("keydown-LEFT", () => this.nudgeSelected(-10, 0));
    this.input.keyboard?.on("keydown-RIGHT", () => this.nudgeSelected(10, 0));
    this.input.keyboard?.on("keydown-UP", () => this.nudgeSelected(0, -10));
    this.input.keyboard?.on("keydown-DOWN", () => this.nudgeSelected(0, 10));
  }

  private nudgeSelected(dx: number, dy: number): void {
    if (!this.selectedPiece || this.completed) return;
    const piece = this.selectedPiece;
    piece.container.setPosition(piece.container.x + dx, piece.container.y + dy);
    piece.placedInCenter = this.pieceTouchesArea(piece, this.centerArea);
    if (piece.placedInCenter) this.resolvePlacement(piece);
    else this.snapPieceToTray(piece);
    this.updateRotateControls();
    this.checkCompletion();
  }

  private pieceTouchesArea(piece: TangramPieceRuntime, area: Area): boolean {
    const margin = 8;
    const expanded = {
      x: area.x - margin,
      y: area.y - margin,
      width: area.width + margin * 2,
      height: area.height + margin * 2,
    };
    return this.getWorldPoints(piece).some((point) =>
      this.isPointInArea(point.x, point.y, expanded),
    );
  }

  private isPointInArea(x: number, y: number, area: Area): boolean {
    return (
      x >= area.x &&
      x <= area.x + area.width &&
      y >= area.y &&
      y <= area.y + area.height
    );
  }

  private setStatus(message: string): void {
    this.statusText?.setText(message);
  }
}
