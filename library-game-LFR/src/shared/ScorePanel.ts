import Phaser from 'phaser';

export class ScorePanel extends Phaser.GameObjects.Container {
  private readonly moveText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly bestText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const bg = scene.add.rectangle(0, 0, 360, 48, 0x111827, 0.78).setStrokeStyle(1, 0xffffff, 0.16);
    if ('setRounded' in bg) {
      (bg as Phaser.GameObjects.Rectangle & { setRounded: (r: number) => void }).setRounded(14);
    }

    this.moveText = this.makeLabel(scene, -158, 0, 'Moves: 0', 0);
    this.timerText = this.makeLabel(scene, -28, 0, 'Time: 00:00', 0);
    this.bestText = this.makeLabel(scene, 154, 0, 'Best: —', 1);

    this.add([bg, this.moveText, this.timerText, this.bestText]);
    scene.add.existing(this);
  }

  updateValues(moves: number, seconds: number, bestLabel: string): void {
    this.moveText.setText(`Moves: ${moves}`);
    this.timerText.setText(`Time: ${this.formatSeconds(seconds)}`);
    this.bestText.setText(`Best: ${bestLabel}`);
  }

  private makeLabel(scene: Phaser.Scene, x: number, y: number, text: string, originX: number): Phaser.GameObjects.Text {
    return scene.add
      .text(x, y, text, {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '15px',
        color: '#f9fafb'
      })
      .setOrigin(originX, 0.5);
  }

  private formatSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
