import Phaser from 'phaser';

export abstract class GameSceneBase extends Phaser.Scene {
  protected centerX = 0;
  protected centerY = 0;
  protected gameWidth = 0;
  protected gameHeight = 0;

  protected constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  create(): void {
    this.updateSceneSize();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
  }

  protected updateSceneSize(): void {
    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;
    this.centerX = this.gameWidth / 2;
    this.centerY = this.gameHeight / 2;
  }

  protected handleResize(): void {
    this.updateSceneSize();
    this.onResize();
  }

  protected onResize(): void {
    // Override in child scenes.
  }

  protected announce(message: string): void {
    const panel = document.getElementById('accessibility-panel');
    if (panel) panel.textContent = message;
  }

  protected makeText(
    x: number,
    y: number,
    text: string,
    size = 24,
    color = '#f9fafb',
    originX = 0.5,
    originY = 0.5
  ): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, text, {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: `${size}px`,
        color,
        align: 'center'
      })
      .setOrigin(originX, originY);
  }
}
