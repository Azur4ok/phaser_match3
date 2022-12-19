import { Scene } from 'phaser'

export class PreloadScene extends Scene {
  images!: {}

  public constructor() {
    super('preload-scene')
  }

  private preload(): void {
    this.load.baseURL = 'assets/'
    this.load.atlas({
      key: 'items',
      textureURL: 'spritesheets/spritesheet.png',
      atlasURL: 'spritesheets/spritesheet.json',
    })
  }

  private create(): void {
    this.scene.start('game-scene')
  }
}
