export interface GameItem {
  imageType: string
  sprite: Phaser.GameObjects.Sprite
  isEmpty: boolean
}

export enum directionType {
  NONE,
  HORIZONTAL,
  VERTICAL,
}

export const gameOptions = {
  fieldSize: 7,
  imageTypes: 4,
  imageSize: 110,
  swapSpeed: 200,
  fallSpeed: 100,
  destroySpeed: 200,
}

export const imageNames = ['helmlok', 'skully', 'flowerTop', 'eggHead']
