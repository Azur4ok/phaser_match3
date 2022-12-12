import { Scene } from 'phaser'
import { gameState } from '../constants'

export class GameScene extends Scene {
  private currentState!: gameState
  public constructor() {
    super('game-scene')
  }

  private create(): void {

  }
}
