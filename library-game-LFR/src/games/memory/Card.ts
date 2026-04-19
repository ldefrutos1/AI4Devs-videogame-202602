import Phaser from 'phaser';

export type CardState = 'hidden' | 'revealed' | 'matched';

export interface CardData {
  id: number;
  pairId: string;
  symbol: string;
  label: string;
}

export class Card extends Phaser.GameObjects.Container {
  readonly cardData: CardData;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly symbolText: Phaser.GameObjects.Text;
  private readonly indexText: Phaser.GameObjects.Text;
  private currentState: CardState = 'hidden';
  private readonly baseWidth: number;
  private readonly baseHeight: number;

  constructor(scene: Phaser.Scene, data: CardData, width: number, height: number) {
    super(scene, 0, 0);
    this.cardData = data;
    this.baseWidth = width;
    this.baseHeight = height;

    this.bg = scene.add.rectangle(0, 0, width, height, 0x334155).setStrokeStyle(3, 0x93c5fd, 0.85);
    if ('setRounded' in this.bg) {
      (this.bg as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(16);
    }

    this.symbolText = scene.add
      .text(0, -4, data.symbol, {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${Math.floor(Math.min(width, height) * 0.46)}px`
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.indexText = scene.add
      .text(0, height * 0.32, `${data.id + 1}`, {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '14px',
        color: '#cbd5e1'
      })
      .setOrigin(0.5);

    this.add([this.bg, this.symbolText, this.indexText]);
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });
    scene.add.existing(this);
    this.renderState();
  }

  get cardState(): CardState {
    return this.currentState;
  }

  isSelectable(): boolean {
    return this.currentState === 'hidden';
  }

  reveal(): Promise<void> {
    if (this.currentState !== 'hidden') return Promise.resolve();
    this.currentState = 'revealed';
    return this.flip(true);
  }

  hide(): Promise<void> {
    if (this.currentState !== 'revealed') return Promise.resolve();
    this.currentState = 'hidden';
    return this.flip(false);
  }

  markMatched(): void {
    this.currentState = 'matched';
    this.renderState();
    this.scene.tweens.add({
      targets: this,
      scale: 1.06,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  setFocused(focused: boolean): void {
    this.bg.setStrokeStyle(focused ? 5 : 3, focused ? 0xfacc15 : this.currentState === 'matched' ? 0x86efac : 0x93c5fd, focused ? 1 : 0.85);
  }

  updateLayout(width: number, height: number): void {
    this.setSize(width, height);
    this.bg.setSize(width, height);
    this.indexText.setPosition(0, height * 0.32);
    this.symbolText.setFontSize(Math.floor(Math.min(width, height) * 0.46));
  }

  private flip(showFace: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0,
        duration: 110,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.renderState(showFace ? 'revealed' : 'hidden');
          this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            duration: 110,
            ease: 'Sine.easeOut',
            onComplete: () => resolve()
          });
        }
      });
    });
  }

  private renderState(force?: CardState): void {
    const state = force ?? this.currentState;
    const visible = state === 'revealed' || state === 'matched';

    this.symbolText.setVisible(visible);
    this.indexText.setVisible(!visible);

    if (state === 'matched') {
      this.bg.setFillStyle(0x14532d);
      this.bg.setStrokeStyle(3, 0x86efac, 0.95);
      this.setAlpha(0.95);
    } else if (state === 'revealed') {
      this.bg.setFillStyle(0xfffbeb);
      this.bg.setStrokeStyle(3, 0xfbbf24, 0.95);
      this.setAlpha(1);
    } else {
      this.bg.setFillStyle(0x334155);
      this.bg.setStrokeStyle(3, 0x93c5fd, 0.85);
      this.setAlpha(1);
    }
  }
}
