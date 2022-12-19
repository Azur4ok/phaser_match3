import { Scene } from 'phaser'
import { directionType, GameItem, gameOptions } from '../constants'
import { imageNames } from './../constants/index'

export class GameScene extends Scene {
  private pickState: boolean = true
  private isDragging: boolean = false
  private selectedItem: GameItem | null = null
  private gameArray: GameItem[][] = []
  private poolArray: Phaser.GameObjects.Sprite[] = []
  private itemGroup!: Phaser.GameObjects.Group
  private swappingItems: number = 0
  private removeMap: [][] = []

  public constructor() {
    super('game-scene')
  }
  //eslint-ignore-next-line
  private create(): void {
    this.drawField()
    this.input.on('pointerdown', this.handleSelectItem, this)
    this.input.on('pointermove', this.handleStartSwap, this)
    this.input.on('pointerup', this.handleStopSwap, this)
  }

  private handleSelectItem(pointer: Phaser.Input.Pointer): void {
    if (this.pickState) {
      this.isDragging = true
      const row = Math.floor(pointer.y / gameOptions.imageSize)
      const column = Math.floor(pointer.x / gameOptions.imageSize)
      let pickedItem = this.itemAt(row, column)
      if (pickedItem !== -1) {
        if (!this.selectedItem) {
          pickedItem = pickedItem as GameItem
          pickedItem.sprite.setScale(1.2)
          pickedItem.sprite.setDepth(1)
          this.selectedItem = pickedItem
        } else {
          if (this.areTheSame(pickedItem as GameItem, this.selectedItem)) {
            this.selectedItem.sprite.setScale(1)
            this.selectedItem = null
          } else {
            if (this.areNext(pickedItem as GameItem, this.selectedItem)) {
              this.selectedItem.sprite.setScale(1)
              this.swapItems(this.selectedItem, pickedItem as GameItem, true)
            } else {
              this.selectedItem.sprite.setScale(1)
              pickedItem = pickedItem as GameItem
              pickedItem.sprite.setScale(1.2)
              this.selectedItem = pickedItem
            }
          }
        }
      }
    }
  }

  private handleStartSwap(pointer: Phaser.Input.Pointer): void {
    if (this.isDragging && this.selectedItem) {
      const deltaX = pointer.downX - pointer.x
      const deltaY = pointer.downY - pointer.y
      let deltaRow = 0
      let deltaColumn = 0
      if (deltaX > gameOptions.imageSize / 2 && Math.abs(deltaY) < gameOptions.imageSize / 4) {
        deltaColumn = -1
      }
      if (deltaX < -gameOptions.imageSize / 2 && Math.abs(deltaY) < gameOptions.imageSize / 4) {
        deltaColumn = 1
      }
      if (deltaY > gameOptions.imageSize / 2 && Math.abs(deltaX) < gameOptions.imageSize / 4) {
        deltaRow = -1
      }
      if (deltaY < -gameOptions.imageSize / 2 && Math.abs(deltaX) < gameOptions.imageSize / 4) {
        deltaRow = 1
      }

      if (deltaRow + deltaColumn) {
        const pickedItem = this.itemAt(
          this.getItemRow(this.selectedItem) + deltaRow,
          this.getItemColumn(this.selectedItem) + deltaColumn,
        )
        if (pickedItem !== -1) {
          this.selectedItem.sprite.setScale(1)
          this.swapItems(this.selectedItem, pickedItem as GameItem, true)
        }
      }
    }
  }

  private handleStopSwap(): void {
    this.isDragging = false
  }

  private drawField(): void {
    this.itemGroup = this.add.group()
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      this.gameArray[i] = []
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        const item = this.add.sprite(
          gameOptions.imageSize * j + gameOptions.imageSize / 2,
          gameOptions.imageSize * i + gameOptions.imageSize / 2,
          'items',
        )
        this.itemGroup.add(item)
        do {
          const randomType = imageNames[Math.floor(Math.random() * imageNames.length)]
          item.setFrame(randomType)
          this.gameArray[i][j] = {
            imageType: randomType,
            sprite: item,
            isEmpty: false,
          }
        } while (this.isMatch(i, j))
      }
    }
  }

  private removeItems(): void {
    let removed = 0
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (this.removeMap[i][j] > 0) {
          removed++
          this.tweens.add({
            targets: this.gameArray[i][j].sprite,
            alpha: 0.5,
            duration: gameOptions.destroySpeed,
            callbackScope: this,
            onComplete: () => {
              removed--
              this.gameArray[i][j].sprite.visible = false
              this.poolArray.push(this.gameArray[i][j].sprite)
              if (!removed) {
                this.makeItemsFall()
                this.replenishField()
              }
            },
          })
          this.gameArray[i][j].isEmpty = true
        }
      }
    }
  }

  private isMatch(row: number, column: number): boolean {
    return this.isHorizontalMatch(row, column) || this.isVerticalMatch(row, column)
  }

  private isHorizontalMatch(row: number, column: number): boolean {
    const firstItem = this.itemAt(row, column) as GameItem
    const secondItem = this.itemAt(row, column - 1) as GameItem
    const thirthItem = this.itemAt(row, column - 2) as GameItem
    return (
      firstItem.imageType === secondItem.imageType && firstItem.imageType === thirthItem.imageType
    )
  }

  private isVerticalMatch(row: number, column: number): boolean {
    const firstItem = this.itemAt(row, column) as GameItem
    const secondItem = this.itemAt(row - 1, column) as GameItem
    const thirthItem = this.itemAt(row - 2, column) as GameItem
    return (
      firstItem.imageType === secondItem.imageType && firstItem.imageType == thirthItem.imageType
    )
  }

  private areTheSame(firstItem: GameItem, secondItem: GameItem): boolean {
    return (
      this.getItemRow(firstItem) === this.getItemRow(secondItem) &&
      this.getItemColumn(firstItem) === this.getItemColumn(secondItem)
    )
  }

  private areNext(firstItem: GameItem, secondItem: GameItem): boolean {
    return (
      Math.abs(this.getItemRow(firstItem) - this.getItemRow(secondItem)) +
        Math.abs(this.getItemColumn(firstItem) - this.getItemColumn(secondItem)) ===
      1
    )
  }

  private swapItems(firstItem: GameItem, secondItem: GameItem, swapBack: boolean): void {
    this.swappingItems = 2
    this.pickState = false
    this.isDragging = false
    const typeFrom = firstItem.imageType
    const spriteFrom = firstItem.sprite
    const typeTo = secondItem.imageType
    const spriteTo = secondItem.sprite
    const firstItemRow = this.getItemRow(firstItem)
    const firstItemColumn = this.getItemColumn(firstItem)
    const secondItemRow = this.getItemRow(secondItem)
    const secondItemColumn = this.getItemColumn(secondItem)
    this.gameArray[firstItemRow][firstItemColumn].imageType = typeTo
    this.gameArray[firstItemRow][firstItemColumn].sprite = spriteTo
    this.gameArray[secondItemRow][secondItemColumn].imageType = typeFrom
    this.gameArray[secondItemRow][secondItemColumn].sprite = spriteFrom
    this.tweenItem(firstItem, secondItem, swapBack)
    this.tweenItem(secondItem, firstItem, swapBack)
  }

  private tweenItem(firstItem: GameItem, secondItem: GameItem, swapBack: boolean): void {
    const row = this.getItemRow(firstItem)
    const column = this.getItemColumn(firstItem)
    this.tweens.add({
      targets: this.gameArray[row][column].sprite,
      x: column * gameOptions.imageSize + gameOptions.imageSize / 2,
      y: row * gameOptions.imageSize + gameOptions.imageSize / 2,
      duration: gameOptions.swapSpeed,
      callbackScope: this,
      onComplete: () => {
        this.swappingItems--
        if (!this.swappingItems) {
          if (!this.matchInBoard() && swapBack) {
            this.swapItems(firstItem, secondItem, false)
          } else {
            if (this.matchInBoard()) {
              this.handleMatches()
            } else {
              this.pickState = true
              this.selectedItem = null
            }
          }
        }
      },
    })
  }

  private makeItemsFall(): void {
    for (let i = gameOptions.fieldSize - 2; i >= 0; i--) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (!this.gameArray[i][j].isEmpty) {
          const fallItems = this.emptyBelow(i, j)
          if (fallItems) {
            this.tweens.add({
              targets: this.gameArray[i][j].sprite,
              y: this.gameArray[i][j].sprite.y + fallItems * gameOptions.imageSize,
              duration: gameOptions.fallSpeed * fallItems,
            })
            this.gameArray[i + fallItems][j] = {
              sprite: this.gameArray[i][j].sprite,
              imageType: this.gameArray[i][j].imageType,
              isEmpty: false,
            }
            this.gameArray[i][j].isEmpty = true
          }
        }
      }
    }
  }

  private replenishField(): void {
    let replenished = 0
    for (let j = 0; j < gameOptions.fieldSize; j++) {
      const emptySpots = this.emptyInColumn(j)
      if (emptySpots) {
        for (let i = 0; i < emptySpots; i++) {
          replenished++
          const randomType = imageNames[Math.floor(Math.random() * imageNames.length)]
          const item = this.add.sprite(
            gameOptions.imageSize * j + gameOptions.imageSize / 2,
            -(gameOptions.imageSize * (emptySpots - 1 - i) + gameOptions.imageSize / 2),
            'items',
          )
          item.setFrame(randomType)
          this.gameArray[i][j] = { imageType: randomType, sprite: item, isEmpty: false }
          this.itemGroup.add(item)
          this.tweens.add({
            targets: this.gameArray[i][j].sprite,
            y: gameOptions.imageSize * i + gameOptions.imageSize / 2,
            duration: gameOptions.fallSpeed * emptySpots,
            callbackScope: this,
            onComplete: () => {
              replenished--
              if (!replenished) {
                if (this.matchInBoard()) {
                  this.time.addEvent({
                    delay: 250,
                    callback: this.handleMatches()!,
                  })
                } else {
                  this.pickState = true
                  this.selectedItem = null
                }
              }
            },
          })
        }
      }
    }
  }

  private matchInBoard(): boolean {
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (this.isMatch(i, j)) {
          return true
        }
      }
    }
    return false
  }

  private handleMatches(): void {
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      this.removeMap[i] = []
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        this.removeMap[i].push(0 as never)
      }
    }
    this.markMatches(directionType.HORIZONTAL)
    this.markMatches(directionType.VERTICAL)
    this.removeItems()
  }

  private markMatches(direction: directionType): void {
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      let itemsStreak = 1
      let currentItemType = 'helmlok'
      let startStreak = 0
      let typeToWatch: string
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (direction === directionType.HORIZONTAL) {
          typeToWatch = (this.itemAt(i, j) as GameItem).imageType
        } else {
          typeToWatch = (this.itemAt(j, i) as GameItem).imageType
        }
        if (typeToWatch === currentItemType) {
          itemsStreak++
        }
        if (typeToWatch !== currentItemType || j === gameOptions.fieldSize - 1) {
          if (itemsStreak >= 3) {
            for (let k = 0; k < itemsStreak; k++) {
              if (direction === directionType.HORIZONTAL) {
                this.removeMap[i][startStreak + k]++
              } else {
                this.removeMap[startStreak + k][i]++
              }
            }
          }
          startStreak = j
          itemsStreak = 1
          currentItemType = typeToWatch
        }
      }
    }
  }

  private itemAt(row: number, column: number) {
    if (row < 0 || row >= gameOptions.fieldSize || column < 0 || column >= gameOptions.fieldSize) {
      return -1
    }
    return this.gameArray[row][column]
  }

  private getItemRow(item: GameItem): number {
    return Math.floor(item.sprite.y / gameOptions.imageSize)
  }

  private getItemColumn(item: GameItem): number {
    return Math.floor(item.sprite.x / gameOptions.imageSize)
  }

  private emptyBelow(row: number, column: number): number {
    let result = 0
    for (let i = row + 1; i < gameOptions.fieldSize; i++) {
      if (this.gameArray[i][column].isEmpty) {
        result++
      }
    }
    return result
  }

  private emptyInColumn(column: number): number {
    let result = 0
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      if (this.gameArray[i][column].isEmpty) {
        result++
      }
    }
    return result
  }
}
