import Phaser from 'phaser'

export default class JumpMasterScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image
  private score = 0
  private distance = 0
  private gameSpeed = 300
  private isJumping = false
  private isGameOver = false
  private scoreText!: Phaser.GameObjects.Text
  private obstacles: Phaser.GameObjects.Image[] = []
  private collectibles: Phaser.GameObjects.Image[] = []
  private onGameEnd?: (score: number, distance: number) => void
  private ground!: Phaser.GameObjects.Rectangle

  constructor() {
    super({ key: 'JumpMasterScene' })
  }

  init(data: { onGameEnd?: (score: number, distance: number) => void }) {
    this.onGameEnd = data.onGameEnd
  }

  preload() {
    this.load.image('junie-run', '/assets/images/junie/junie-run-1.png')
    this.load.image('junie-jump', '/assets/images/junie/junie-jump.png')
    this.load.image('bug', '/assets/images/targets/target-bug.png')
    this.load.image('coin', '/assets/images/targets/target-coin.png')
    this.load.image('cloud9', '/assets/images/logos/cloud9-icon.png')
  }

  create() {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x87CEEB).setOrigin(0)

    // Ground
    this.ground = this.add.rectangle(0, this.scale.height - 100, this.scale.width, 100, 0x8B4513).setOrigin(0)

    // Player
    this.player = this.add.image(150, this.scale.height - 200, 'junie-run').setScale(0.8)

    // UI
    this.scoreText = this.add.text(20, 20, 'Score: 0 | Distance: 0m', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })

    // Instructions
    const instructions = this.add.text(this.scale.width / 2, 100, 'Press SPACE or CLICK to Jump!', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    this.time.delayedCall(3000, () => instructions.destroy())

    // Input
    this.input.keyboard?.on('keydown-SPACE', () => this.jump())
    this.input.on('pointerdown', () => this.jump())

    // Spawn obstacles and collectibles
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    })

    this.time.addEvent({
      delay: 3000,
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true
    })

    // Update distance
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.isGameOver) {
          this.distance += 1
          this.scoreText.setText(`Score: ${this.score} | Distance: ${this.distance}m`)

          // Increase difficulty
          if (this.distance % 100 === 0) {
            this.gameSpeed += 20
          }
        }
      },
      loop: true
    })
  }

  update() {
    if (this.isGameOver) return

    // Move obstacles
    this.obstacles.forEach((obstacle, index) => {
      obstacle.x -= this.gameSpeed / 60

      if (obstacle.x < -50) {
        obstacle.destroy()
        this.obstacles.splice(index, 1)
      }

      // Collision detection
      if (this.checkCollision(this.player, obstacle)) {
        this.endGame()
      }
    })

    // Move collectibles
    this.collectibles.forEach((collectible, index) => {
      collectible.x -= this.gameSpeed / 60

      if (collectible.x < -50) {
        collectible.destroy()
        this.collectibles.splice(index, 1)
      }

      // Collection detection
      if (this.checkCollision(this.player, collectible)) {
        const type = collectible.getData('type')
        const points = type === 'cloud9' ? 25 : 10

        this.score += points
        this.showPoints(collectible.x, collectible.y, '+' + points)

        collectible.destroy()
        this.collectibles.splice(index, 1)
      }
    })
  }

  private jump() {
    if (this.isJumping || this.isGameOver) return

    this.isJumping = true
    this.player.setTexture('junie-jump')

    const jumpHeight = 150
    const jumpDuration = 500

    this.tweens.add({
      targets: this.player,
      y: this.player.y - jumpHeight,
      duration: jumpDuration / 2,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.player,
          y: this.scale.height - 200,
          duration: jumpDuration / 2,
          ease: 'Quad.easeIn',
          onComplete: () => {
            this.isJumping = false
            this.player.setTexture('junie-run')
          }
        })
      }
    })
  }

  private spawnObstacle() {
    if (this.isGameOver) return

    const obstacle = this.add.image(
      this.scale.width + 50,
      this.scale.height - 150,
      'bug'
    ).setScale(0.6)

    this.obstacles.push(obstacle)
  }

  private spawnCollectible() {
    if (this.isGameOver) return

    const type = Math.random() > 0.5 ? 'cloud9' : 'coin'
    const y = Phaser.Math.Between(this.scale.height - 300, this.scale.height - 200)

    const collectible = this.add.image(
      this.scale.width + 50,
      y,
      type
    ).setScale(0.5).setData('type', type)

    this.collectibles.push(collectible)
  }

  private checkCollision(obj1: Phaser.GameObjects.Image, obj2: Phaser.GameObjects.Image): boolean {
    const bounds1 = obj1.getBounds()
    const bounds2 = obj2.getBounds()

    return Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2)
  }

  private showPoints(x: number, y: number, text: string) {
    const pointsText = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    this.tweens.add({
      targets: pointsText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => pointsText.destroy()
    })
  }

  private endGame() {
    this.isGameOver = true

    // Clear all objects
    this.obstacles.forEach(obj => obj.destroy())
    this.collectibles.forEach(obj => obj.destroy())
    this.obstacles = []
    this.collectibles = []

    // Show game over
    this.add.text(this.scale.width / 2, this.scale.height / 2,
      `GAME OVER!\nScore: ${this.score}\nDistance: ${this.distance}m`, {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5)

    // Call onGameEnd callback
    if (this.onGameEnd) {
      this.time.delayedCall(2000, () => {
        if (this.onGameEnd) {
          this.onGameEnd(this.score, this.distance)
        }
      })
    }
  }
}
