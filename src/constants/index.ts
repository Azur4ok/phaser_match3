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

export const initialField = [
  ['skully', 'eggHead', 'flowerTop', 'helmlok', 'eggHead', 'skully', 'eggHead'],
  ['helmlok', 'flowerTop', 'helmlok', 'helmlok', 'eggHead', 'skully', 'skully'],
  ['flowerTop', 'skully', 'skully', 'flowerTop', 'skully', 'helmlok', 'helmlok'],
  ['skully', 'eggHead', 'helmlok', 'flowerTop', 'helmlok', 'eggHead', 'skully'],
  ['helmlok', 'skully', 'flowerTop', 'helmlok', 'helmlok', 'eggHead', 'flowerTop'],
  ['skully', 'helmlok', 'helmlok', 'flowerTop', 'eggHead', 'flowerTop', 'skully'],
  ['flowerTop', 'flowerTop', 'helmlok', 'flowerTop', 'skully', 'helmlok', 'eggHead'],
]

export const TEXT_CONFIG = {
  x: 80,
  y: 550,
  text: '↑  ↔  ↑\nSwap these two elements',
  textStyle: {
    fill: '#fff',
    fontSize: '36px',
    align: 'center',
  },
}

interface TextAnimation {
  targets: null | Phaser.GameObjects.Text
  scaleX: number
  scaleY: number
  ease: string
  yoyo: boolean
  duration: number
  repeat: number
}

export const TEXT_ANIMATION: TextAnimation = {
  targets: null,
  scaleX: 1.1,
  scaleY: 1.1,
  ease: 'Circle',
  yoyo: true,
  duration: 800,
  repeat: -1,
}

export const imageNames = ['helmlok', 'skully', 'flowerTop', 'eggHead']
