import { Scene } from 'phaser'

export class PreloadScene extends Scene {
  images!: {}
  keys: string[] = []
  public constructor() {
    super('preload-scene')
  }

  private preload(): void {
    this.load.baseURL = 'assets/'

    this.images = {
      img0: '/eggHead.png',
      img1: '/flowerTop.png',
      img2: '/helmlok.png',
      img3: '/skully.png',
    }

    this.keys = Object.keys(this.images)

    for (let i = 0; i < this.keys.length; i++) {
      this.load.image(this.keys[i], this.images[this.keys[i] as keyof typeof this.images])
    }
  }

  private create(): void {
    this.scene.start('game-scene')
  }
}
