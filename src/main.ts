import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene';
import { PreloadScene } from './scenes/PreloadScene';

const scaleObject: Phaser.Types.Core.ScaleConfig = {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  parent: 'app',
  width: 1000,
  height: 800,
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: 0x222222,
  scale: scaleObject,
  scene: [PreloadScene, GameScene],
}

export default new Phaser.Game(gameConfig)
