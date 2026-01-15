import * as Phaser from "phaser";

interface Target {
  sprite: Phaser.GameObjects.Image;
  isGood: boolean;
  value: number;
  spawnTime: number;
  lifetime: number;
}

export default class ReflexArenaScene extends Phaser.Scene {
  private score = 0;
  private timeLeft = 50; // Changed from 60 to 50
  private combo = 0;
  private targets: Target[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private gameTimer!: Phaser.Time.TimerEvent;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private onGameEnd?: (score: number) => void;
  private spawnDelay = 600; // Faster initial spawn (was 900)
  private targetLifetime = 2000; // Slightly longer to accommodate more targets
  private badTargetChance = 0.3; // Slightly fewer bad targets

  constructor() {
    super({ key: "ReflexArenaScene" });
  }

  init(data: { onGameEnd?: (score: number) => void }) {
    this.onGameEnd = data.onGameEnd;
  }

  preload() {
    // Load target images
    this.load.image("target-star", "/assets/images/targets/target-star.png");
    this.load.image(
      "target-trophy",
      "/assets/images/targets/target-trophy.png"
    );
    this.load.image("target-gem", "/assets/images/targets/target-gem.png");
    this.load.image("target-coin", "/assets/images/targets/target-coin.png");
    this.load.image("target-bug", "/assets/images/targets/target-bug.png");
    this.load.image("target-virus", "/assets/images/targets/target-virus.png");
    this.load.image("target-bomb", "/assets/images/targets/target-bomb.png");

    // Load Junie sprites
    this.load.image("junie-happy", "/assets/images/junie/junie-happy.png");
    this.load.image("junie-sad", "/assets/images/junie/junie-sad.png");
  }

  create() {
    // Reset difficulty variables
    this.spawnDelay = 600;
    this.targetLifetime = 2000;
    this.badTargetChance = 0.3;
    this.score = 0;
    this.timeLeft = 50;
    this.combo = 0;
    this.targets = [];

    // Background with gradient effect
    const bg = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x1e40af)
      .setOrigin(0);

    // Add darker overlay for visual intensity
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.2)
      .setOrigin(0);

    // UI
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "32px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });

    this.timerText = this.add
      .text(this.scale.width - 20, 20, "Time: 50", {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(1, 0);

    this.comboText = this.add
      .text(this.scale.width / 2, 20, "Combo: 0x", {
        fontSize: "28px",
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);

    // Game timer
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Spawn timer - faster initial spawn
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnTarget,
      callbackScope: this,
      loop: true,
    });
  }

  private updateTimer() {
    this.timeLeft--;
    this.timerText.setText(`Time: ${this.timeLeft}`);

    // Progressive difficulty every 10 seconds
    if (this.timeLeft % 10 === 0 && this.timeLeft > 0) {
      // Increase spawn rate (decrease delay)
      if (this.spawnDelay > 300) {
        this.spawnDelay -= 80;
        this.spawnTimer.reset({
          delay: this.spawnDelay,
          callback: this.spawnTarget,
          callbackScope: this,
          loop: true,
        });
      }

      // Decrease target lifetime
      if (this.targetLifetime > 1000) {
        this.targetLifetime -= 150;
      }

      // Increase bad target chance
      if (this.badTargetChance < 0.45) {
        this.badTargetChance += 0.03;
      }

      // Visual feedback for difficulty increase
      this.cameras.main.shake(200, 0.003);
      this.showDifficultyWarning();
    }

    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }

  private showDifficultyWarning() {
    const warning = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "SPEED UP!", {
        fontSize: "48px",
        color: "#ff0000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: warning,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 300,
      yoyo: true,
      onComplete: () => warning.destroy(),
    });
  }

  private spawnTarget() {
    // Remove old targets based on their individual lifetime
    this.targets = this.targets.filter((target) => {
      if (this.time.now - target.spawnTime > target.lifetime) {
        // Penalty for missing good targets
        if (target.isGood) {
          this.combo = 0;
          this.comboText.setText("Combo: 0x");
          this.showFeedback(target.sprite.x, target.sprite.y, "MISS!", false);
        }
        target.sprite.destroy();
        return false;
      }
      return true;
    });

    // Spawn new target with some randomization
    const x = Phaser.Math.Between(120, this.scale.width - 120);
    const y = Phaser.Math.Between(120, this.scale.height - 120);

    const isGood = Math.random() > this.badTargetChance;
    let targetKey: string;
    let value: number;

    if (isGood) {
      const goodTargets = [
        { key: "target-star", value: 10 },
        { key: "target-trophy", value: 50 },
        { key: "target-gem", value: 30 },
        { key: "target-coin", value: 20 },
      ];
      const selected = Phaser.Utils.Array.GetRandom(goodTargets);
      targetKey = selected.key;
      value = selected.value;
    } else {
      const badTargets = ["target-bug", "target-virus", "target-bomb"];
      targetKey = Phaser.Utils.Array.GetRandom(badTargets);
      value = -25;
    }

    const sprite = this.add
      .image(x, y, targetKey)
      .setInteractive({ cursor: "pointer" })
      .setScale(0)
      .setDepth(10);

    // Faster spawn animation
    this.tweens.add({
      targets: sprite,
      scale: 0.45,
      duration: 150,
      ease: "Back.easeOut",
    });

    // Add pulsing effect for urgency
    this.tweens.add({
      targets: sprite,
      alpha: { from: 1, to: 0.7 },
      duration: 300,
      yoyo: true,
      repeat: -1,
    });

    sprite.on("pointerdown", () => this.onTargetClick(target));

    const target: Target = {
      sprite,
      isGood,
      value,
      spawnTime: this.time.now,
      lifetime: this.targetLifetime + Phaser.Math.Between(-200, 200),
    };

    this.targets.push(target);
  }

  private onTargetClick(target: Target) {
    const reactionTime = this.time.now - target.spawnTime;
    let points = target.value;

    if (target.isGood) {
      // Time bonus - stricter timing
      if (reactionTime < 250) {
        points *= 2;
        this.showFeedback(target.sprite.x, target.sprite.y, "FAST!", true);
      }

      // Combo multiplier
      this.combo++;
      const comboMultiplier = Math.min(this.combo, 5);
      points *= comboMultiplier;

      // Show happy feedback
      this.showFeedback(target.sprite.x, target.sprite.y, "+" + points, true);

      // Camera flash for good hits
      if (this.combo >= 3) {
        this.cameras.main.flash(100, 255, 255, 255, false, undefined, 0.1);
      }
    } else {
      // Bad target clicked - harsher penalty
      this.combo = 0;
      this.showFeedback(
        target.sprite.x,
        target.sprite.y,
        points.toString(),
        false
      );

      // Camera shake for bad hits
      this.cameras.main.shake(200, 0.01);
    }

    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    this.comboText.setText(`Combo: ${this.combo}x`);

    // Remove target with faster animation
    this.tweens.add({
      targets: target.sprite,
      scale: 0,
      alpha: 0,
      duration: 150,
      onComplete: () => target.sprite.destroy(),
    });

    this.targets = this.targets.filter((t) => t !== target);
  }

  private showFeedback(x: number, y: number, text: string, isGood: boolean) {
    const feedback = this.add
      .text(x, y, text, {
        fontSize: "28px",
        color: isGood ? "#00ff00" : "#ff0000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.tweens.add({
      targets: feedback,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: "Power2",
      onComplete: () => feedback.destroy(),
    });
  }

  private endGame() {
    this.gameTimer.destroy();
    this.spawnTimer.destroy();

    // Clear all targets
    this.targets.forEach((target) => target.sprite.destroy());
    this.targets = [];

    // Show final score briefly
    const finalText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `GAME OVER!\nFinal Score: ${this.score}`,
        {
          fontSize: "48px",
          color: "#ffffff",
          fontStyle: "bold",
          align: "center",
          stroke: "#000000",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    // Fade in effect
    finalText.setAlpha(0);
    this.tweens.add({
      targets: finalText,
      alpha: 1,
      duration: 500,
    });

    // Call onGameEnd callback
    if (this.onGameEnd) {
      this.time.delayedCall(1500, () => {
        if (this.onGameEnd) {
          this.onGameEnd(this.score);
        }
      });
    }
  }
}
