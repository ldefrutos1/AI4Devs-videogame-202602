import Phaser from 'phaser';
import './style.css';
import { MenuScene } from './games/MenuScene';
import { MemoryScene } from './games/memory/MemoryScene';
import { TangramScene } from './games/tangram/TangramScene';
import { TetrisScene } from './games/tetris/TetrisScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0f172a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  input: {
    keyboard: true
  },
  render: {
    antialias: true,
    pixelArt: false
  },
  scene: [MenuScene, MemoryScene, TetrisScene, TangramScene]
};

new Phaser.Game(config);
