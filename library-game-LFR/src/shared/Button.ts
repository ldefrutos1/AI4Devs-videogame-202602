import Phaser from 'phaser';

export interface ButtonOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
  hoverColor?: number;
  activeColor?: number;
  disabledColor?: number;
  textColor?: string;
  fontSize?: number;
  radius?: number;
  ariaLabel?: string;
}

export class Button extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly defaultColor: number;
  private readonly hoverColor: number;
  private readonly activeColor: number;
  private readonly disabledColor: number;
  private readonly callback: () => void;
  private disabled = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    options: ButtonOptions = {}
  ) {
    super(scene, x, y);

    const width = options.width ?? 148;
    const height = options.height ?? 44;
    const radius = options.radius ?? 12;
    this.defaultColor = options.backgroundColor ?? 0x2563eb;
    this.hoverColor = options.hoverColor ?? 0x3b82f6;
    this.activeColor = options.activeColor ?? 0x1d4ed8;
    this.disabledColor = options.disabledColor ?? 0x6b7280;
    this.callback = callback;

    this.bg = scene.add.rectangle(0, 0, width, height, this.defaultColor).setStrokeStyle(2, 0xffffff, 0.18);
    if ('setRounded' in this.bg) {
      // Phaser 3.90+ supports rounded rectangles on shape objects.
      (this.bg as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(radius);
    }

    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: `${options.fontSize ?? 16}px`,
        color: options.textColor ?? '#ffffff'
      })
      .setOrigin(0.5);

    this.add([this.bg, this.label]);
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });

    this.on(Phaser.Input.Events.POINTER_OVER, () => !this.disabled && this.bg.setFillStyle(this.hoverColor));
    this.on(Phaser.Input.Events.POINTER_OUT, () => !this.disabled && this.bg.setFillStyle(this.defaultColor));
    this.on(Phaser.Input.Events.POINTER_DOWN, () => !this.disabled && this.bg.setFillStyle(this.activeColor));
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      if (this.disabled) return;
      this.bg.setFillStyle(this.hoverColor);
      this.callback();
    });

    scene.add.existing(this);
  }

  setText(text: string): this {
    this.label.setText(text);
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    this.bg.setFillStyle(disabled ? this.disabledColor : this.defaultColor);
    this.setAlpha(disabled ? 0.65 : 1);
    return this;
  }
}
