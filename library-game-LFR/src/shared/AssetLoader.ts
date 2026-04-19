import Phaser from 'phaser';

export class AssetLoader {
  static createTone(scene: Phaser.Scene, key: string, frequency: number, duration = 0.08): void {
    // Tiny generated sounds keep the starter project asset-free and easy to import.
    const sampleRate = 22050;
    const length = Math.floor(sampleRate * duration);
    const wavBytes = this.createWavBytes(frequency, length, sampleRate);
    const blob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    scene.load.audio(key, url);
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => URL.revokeObjectURL(url));
  }

  private static createWavBytes(frequency: number, length: number, sampleRate: number): Uint8Array {
    const headerSize = 44;
    const dataSize = length * 2;
    const buffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < length; i += 1) {
      const envelope = 1 - i / length;
      const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * envelope * 0.25;
      view.setInt16(headerSize + i * 2, sample * 32767, true);
    }

    return new Uint8Array(buffer);
  }

  private static writeString(view: DataView, offset: number, value: string): void {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }
}
