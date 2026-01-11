import Phaser from 'phaser'

interface Target {
  sprite: Phaser.GameObjects.Image
  isGood: boolean
  value: number
  spawnTime: number
}

export default class ReflexArenaScene extends Phaser.Scene {
  private score = 0
  private timeLeft = 60
  private combo = 0
  private targets: Target[] = []
  private scoreText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private comboText!: Phaser.GameObjects.Text
  private gameTimer!: Phaser.Time.TimerEvent
  private spawnTimer!: Phaser.Time.TimerEvent
  private onGameEnd?: (score: number) => void

  constructor() {
    super({ key: 'ReflexArenaScene' })
  }

  init(data: { onGameEnd?: (score: number) => void }) {
    this.onGameEnd = data.onGameEnd
  }

  preload() {
    // Load target images
    this.load.image('target-star', '/assets/images/targets/target-star.png')
    this.load.image('target-trophy', '/assets/images/targets/target-trophy.png')
    this.load.image('target-gem', '/assets/images/targets/target-gem.png')
    this.load.image('target-coin', '/assets/images/targets/target-coin.png')
    this.load.image('target-bug', '/assets/images/targets/target-bug.png')
    this.load.image('target-virus', '/assets/images/targets/target-virus.png')
    this.load.image('target-bomb', '/assets/images/targets/target-bomb.png')

    // Load Junie sprites
    this.load.image('junie-happy', '/assets/images/junie/junie-happy.png')
    this.load.image('junie-sad', '/assets/images/junie/junie-sad.png')
  }

  create() {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1e40af).setOrigin(0)

    // UI
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    })

    this.timerText = this.add.text(this.scale.width - 20, 20, 'Time: 60', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(1, 0)

    this.comboText = this.add.text(this.scale.width / 2, 20, 'Combo: 0x', {
      fontSize: '28px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0)

    // Game timer
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    })

    // Spawn timer
    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnTarget,
      callbackScope: this,
      loop: true
    })
  }

  private updateTimer() {
    this.timeLeft--
    this.timerText.setText(`Time: ${this.timeLeft}`)

    if (this.timeLeft <= 0) {
      this.endGame()
    }
  }

  private spawnTarget() {
    // Remove old targets
    this.targets = this.targets.filter(target => {
      if (this.time.now - target.spawnTime > 2000) {
        target.sprite.destroy()
        return false
      }
      return true
    })

    // Spawn new target
    const x = Phaser.Math.Between(100, this.scale.width - 100)
    const y = Phaser.Math.Between(100, this.scale.height - 100)

    const isGood = Math.random() > 0.3
    let targetKey: string
    let value: number

    if (isGood) {
      const goodTargets = [
        { key: 'target-star', value: 10 },
        { key: 'target-trophy', value: 50 },
        { key: 'target-gem', value: 30 },
        { key: 'target-coin', value: 20 }
      ]
      const selected = Phaser.Utils.Array.GetRandom(goodTargets)
      targetKey = selected.key
      value = selected.value
    } else {
      const badTargets = ['target-bug', 'target-virus', 'target-bomb']
      targetKey = Phaser.Utils.Array.GetRandom(badTargets)
      value = -20
    }

    const sprite = this.add.image(x, y, targetKey)
      .setInteractive({ cursor: 'pointer' })
      .setScale(0)

    this.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    })

    sprite.on('pointerdown', () => this.onTargetClick(target))

    const target: Target = {
      sprite,
      isGood,
      value,
      spawnTime: this.time.now
    }

    this.targets.push(target)

    // Speed up spawning over time
    if (this.timeLeft < 40 && this.spawnTimer.delay > 600) {
      this.spawnTimer.delay = 800
    }
    if (this.timeLeft < 20 && this.spawnTimer.delay > 400) {
      this.spawnTimer.delay = 600
    }
  }

  private onTargetClick(target: Target) {
    const reactionTime = this.time.now - target.spawnTime
    let points = target.value

    if (target.isGood) {
      // Time bonus
      if (reactionTime < 300) {
        points *= 2
      }

      // Combo multiplier
      this.combo++
      const comboMultiplier = Math.min(this.combo, 5)
      points *= comboMultiplier

      // Show happy Junie
      this.showFeedback(target.sprite.x, target.sprite.y, '+' + points, true)
    } else {
      // Bad target clicked
      this.combo = 0
      this.showFeedback(target.sprite.x, target.sprite.y, points.toString(), false)
    }

    this.score += points
    this.scoreText.setText(`Score: ${this.score}`)
    this.comboText.setText(`Combo: ${this.combo}x`)

    // Remove target
    this.tweens.add({
      targets: target.sprite,
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => target.sprite.destroy()
    })

    this.targets = this.targets.filter(t => t !== target)
  }

  private showFeedback(x: number, y: number, text: string, isGood: boolean) {
    const feedback = this.add.text(x, y, text, {
      fontSize: '32px',
      color: isGood ? '#00ff00' : '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.tweens.add({
      targets: feedback,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => feedback.destroy()
    })
  }

  private endGame() {
    this.gameTimer.destroy()
    this.spawnTimer.destroy()

    // Clear all targets
    this.targets.forEach(target => target.sprite.destroy())
    this.targets = []

    // Show final score
    const finalText = this.add.text(this.scale.width / 2, this.scale.height / 2,
      `GAME OVER!\nFinal Score: ${this.score}`, {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5)

    // Call onGameEnd callback
    if (this.onGameEnd) {
      this.time.delayedCall(2000, () => {
        if (this.onGameEnd) {
          this.onGameEnd(this.score)
        }
      })
    }
  }
}
