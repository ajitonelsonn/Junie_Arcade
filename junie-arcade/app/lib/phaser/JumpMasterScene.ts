import * as Phaser from "phaser";

export default class JumpMasterScene extends Phaser.Scene {
  private player!: any;
  private score = 0;
  private distance = 0;
  private timeLeft = 50; // Added timer
  private gameSpeed = 500; // Increased for faster gameplay
  private isGameOver = false;
  private scoreText!: any;
  private timerText!: any;
  private distanceText!: any;
  private obstacles!: any;
  private collectibles!: any;
  private onGameEnd?: (score: number, distance: number) => void;
  private ground!: any;
  private hasDoubleJump = false;
  private obstacleSpawnDelay = 1800; // Faster initial spawn
  private collectibleSpawnDelay = 1200; // Faster collectible spawn
  private gameTimer!: Phaser.Time.TimerEvent;
  private obstacleTimer!: Phaser.Time.TimerEvent;
  private collectibleTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: "JumpMasterScene" });
  }

  init(data: { onGameEnd?: (score: number, distance: number) => void }) {
    this.onGameEnd = data.onGameEnd;
  }

  preload() {
    this.load.image("junie-run-1", "/assets/images/junie/junie-run-1.png");
    this.load.image("junie-run-2", "/assets/images/junie/junie-run-2.png");
    this.load.image("junie-run-3", "/assets/images/junie/junie-run-3.png");
    this.load.image("junie-jump", "/assets/images/junie/junie-jump.png");
    this.load.image("junie-sad", "/assets/images/junie/junie-sad.png");
    this.load.image("junie-happy", "/assets/images/junie/junie-happy.png");
    this.load.image("background", "/assets/images/backgrounds/valorant.webp");
    this.load.image("bug", "/assets/images/targets/target-bug.png");
    this.load.image("coin", "/assets/images/targets/target-coin.png");
    this.load.image("cloud9", "/assets/images/logos/cloud9-icon.png");

    // Audio
    this.load.audio("jump", "/assets/sounds/sfx/jump.mp3");
    this.load.audio("coin", "/assets/sounds/sfx/coin.mp3");
    this.load.audio("gameover", "/assets/sounds/sfx/gameover.mp3");
    this.load.audio("bgm", "/assets/sounds/music/music-game.mp3");
    this.load.audio("victory", "/assets/sounds/music/music-victory.mp3");
  }

  create() {
    // Reset all variables
    this.score = 0;
    this.distance = 0;
    this.timeLeft = 50;
    this.gameSpeed = 500;
    this.isGameOver = false;
    this.obstacleSpawnDelay = 1800;
    this.collectibleSpawnDelay = 1200;

    // Background Music
    const music = this.sound.add("bgm", { loop: true, volume: 0.5 });
    music.play();
    this.events.on("shutdown", () => music.stop());
    this.events.on("destroy", () => music.stop());

    // Animations
    this.anims.create({
      key: "run",
      frames: [
        { key: "junie-run-1" },
        { key: "junie-run-2" },
        { key: "junie-run-3" },
      ],
      frameRate: 10,
      repeat: -1,
    });

    // Background
    const bg = this.add.image(0, 0, "background").setOrigin(0);
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.2)
      .setOrigin(0);

    // Ground
    this.ground = this.add
      .rectangle(0, this.scale.height - 100, this.scale.width, 100, 0x8b4513)
      .setOrigin(0);
    this.physics.add.existing(this.ground, true);

    // Player
    this.player = this.physics.add.sprite(
      150,
      this.scale.height - 200,
      "junie-run-1"
    );
    this.player.setScale(0.35);

    if (!this.isGameOver) {
      this.player.play("run");
    }

    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(2000);

    // Collisions
    this.physics.add.collider(this.player, this.ground);

    // Adjust hitbox
    if (this.player.body) {
      this.player.body.setSize(
        this.player.width * 0.7,
        this.player.height * 0.8
      );
      this.player.body.setOffset(
        this.player.width * 0.15,
        this.player.height * 0.1
      );
    }

    // Groups
    this.obstacles = this.physics.add.group();
    this.collectibles = this.physics.add.group();

    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.endGame,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      (p: any, c: any) => {
        const collectible = c as any;
        const type = collectible.getData("type");
        const points = type === "cloud9" ? 50 : 20; // Increased values

        this.score += points;
        this.sound.play("coin", { volume: 0.6 });
        this.showPoints(collectible.x, collectible.y, "+" + points);
        collectible.destroy();
      },
      undefined,
      this
    );

    // UI - Score
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "28px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });

    // UI - Timer (top center)
    this.timerText = this.add
      .text(this.scale.width / 2, 20, "Time: 50s", {
        fontSize: "32px",
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);

    // UI - Distance (top right)
    this.distanceText = this.add
      .text(this.scale.width - 20, 20, "Distance: 0m", {
        fontSize: "28px",
        color: "#00ffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(1, 0);

    // Instructions
    const instructions = this.add
      .text(
        this.scale.width / 2,
        100,
        "Press SPACE or CLICK to Jump!\nDouble Jump Available!",
        {
          fontSize: "24px",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.time.delayedCall(3000, () => instructions.destroy());

    // Input
    this.input.keyboard?.on("keydown-SPACE", () => this.jump());
    this.input.on("pointerdown", () => this.jump());

    // Game Timer - counts down from 50
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Spawn obstacles with dynamic timing
    this.obstacleTimer = this.time.addEvent({
      delay: this.obstacleSpawnDelay,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Spawn collectibles more frequently
    this.collectibleTimer = this.time.addEvent({
      delay: this.collectibleSpawnDelay,
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true,
    });

    // Update distance and score
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.isGameOver) {
          this.distance += 1;

          // Distance points: 1 point per 10 meters
          if (this.distance % 10 === 0) {
            this.score += 1;
          }

          this.scoreText.setText(`Score: ${this.score}`);
          this.distanceText.setText(`Distance: ${this.distance}m`);

          // Progressive difficulty every 10 seconds (based on timer)
          if (
            this.timeLeft % 10 === 0 &&
            this.timeLeft > 0 &&
            this.timeLeft < 50
          ) {
            this.increaseDifficulty();
          }

          // Milestone every 100m
          if (this.distance > 0 && this.distance % 100 === 0) {
            this.celebrateMilestone();
          }
        }
      },
      loop: true,
    });
  }

  private updateTimer() {
    this.timeLeft--;
    this.timerText.setText(`Time: ${this.timeLeft}s`);

    // Warning when time is low
    if (this.timeLeft <= 10) {
      this.timerText.setColor("#ff0000");
      if (this.timeLeft % 2 === 0) {
        this.cameras.main.shake(100, 0.002);
      }
    }

    if (this.timeLeft <= 0) {
      this.endGameByTime();
    }
  }

  private increaseDifficulty() {
    // Increase game speed
    if (this.gameSpeed < 700) {
      this.gameSpeed += 40;
    }

    // Decrease obstacle spawn delay (more frequent)
    if (this.obstacleSpawnDelay > 1000) {
      this.obstacleSpawnDelay -= 150;
      this.obstacleTimer.reset({
        delay: this.obstacleSpawnDelay,
        callback: this.spawnObstacle,
        callbackScope: this,
        loop: true,
      });
    }

    // Increase collectible spawn rate
    if (this.collectibleSpawnDelay > 700) {
      this.collectibleSpawnDelay -= 100;
      this.collectibleTimer.reset({
        delay: this.collectibleSpawnDelay,
        callback: this.spawnCollectible,
        callbackScope: this,
        loop: true,
      });
    }

    // Visual feedback
    this.cameras.main.flash(200, 255, 255, 0, false, undefined, 0.15);

    const warning = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "FASTER!", {
        fontSize: "48px",
        color: "#ff6600",
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

  update() {
    if (this.isGameOver) return;

    // Movement
    this.obstacles.getChildren().forEach((obj: any) => {
      const obstacle = obj as any;
      obstacle.setVelocityX(-this.gameSpeed);
      if (obstacle.x < -50) {
        obstacle.destroy();
      }
    });

    this.collectibles.getChildren().forEach((obj: any) => {
      const collectible = obj as any;
      collectible.setVelocityX(-this.gameSpeed);
      if (collectible.x < -50) {
        collectible.destroy();
      }
    });

    // Reset animation if landed
    if (this.player.body?.touching.down) {
      this.hasDoubleJump = false;

      if (
        !this.player.anims.isPlaying ||
        this.player.anims.currentAnim?.key !== "run"
      ) {
        this.player.play("run", true);
      }
    } else if (!this.player.body?.touching.down && !this.isGameOver) {
      if (this.player.anims.isPlaying) {
        this.player.stop();
      }
      this.player.setTexture("junie-jump");
    }
  }

  private jump() {
    if (this.isGameOver) return;

    // First jump - from ground
    if (this.player.body?.touching.down) {
      this.player.setVelocityY(-1000);
      this.hasDoubleJump = true;
      this.sound.play("jump", { volume: 0.5 });
    }
    // Double jump - in the air
    else if (this.hasDoubleJump && !this.player.body?.touching.down) {
      this.player.setVelocityY(-1000);
      this.hasDoubleJump = false;
      this.sound.play("jump", { volume: 0.6 });
    }
  }

  private spawnObstacle() {
    if (this.isGameOver) return;

    const obstacle = this.obstacles.create(
      this.scale.width + 50,
      this.scale.height - 125,
      "bug"
    ) as any;

    obstacle.setScale(0.13);

    if (obstacle.body) {
      obstacle.body.setSize(obstacle.width * 0.65, obstacle.height * 0.65);
    }

    // 35% chance for double obstacles after 100m
    if (Math.random() < 0.35 && this.distance > 100) {
      this.time.delayedCall(400, () => {
        if (!this.isGameOver) {
          const obstacle2 = this.obstacles.create(
            this.scale.width + 50,
            this.scale.height - 125,
            "bug"
          ) as any;
          obstacle2.setScale(0.13);
          if (obstacle2.body) {
            obstacle2.body.setSize(
              obstacle2.width * 0.65,
              obstacle2.height * 0.65
            );
          }
        }
      });
    }
  }

  private spawnCollectible() {
    if (this.isGameOver) return;

    // 40% chance for cloud9 (higher value), 60% for coin
    const type = Math.random() > 0.6 ? "cloud9" : "coin";
    const y = Phaser.Math.Between(
      this.scale.height - 380,
      this.scale.height - 200
    );

    const collectible = this.collectibles.create(
      this.scale.width + 50,
      y,
      type
    ) as any;

    collectible.setScale(0.2).setData("type", type);

    // Larger hitbox for easier collection
    if (collectible.body) {
      collectible.body.setSize(
        collectible.width * 1.3,
        collectible.height * 1.3
      );
    }

    // Sometimes spawn collectibles in patterns (chains)
    if (Math.random() < 0.25) {
      this.time.delayedCall(300, () => {
        if (!this.isGameOver) {
          const followUp = this.collectibles.create(
            this.scale.width + 50,
            y + Phaser.Math.Between(-80, 80),
            type
          ) as any;
          followUp.setScale(0.2).setData("type", type);
          if (followUp.body) {
            followUp.body.setSize(followUp.width * 1.3, followUp.height * 1.3);
          }
        }
      });
    }
  }

  private showPoints(x: number, y: number, text: string) {
    const pointsText = this.add
      .text(x, y, text, {
        fontSize: "28px",
        color: "#00ff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: pointsText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => pointsText.destroy(),
    });
  }

  private celebrateMilestone() {
    // Bonus points for milestone
    const bonus = 25;
    this.score += bonus;

    const text = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `${this.distance}m!\n+${bonus} BONUS!`,
        {
          fontSize: "56px",
          color: "#ffff00",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 8,
          align: "center",
        }
      )
      .setOrigin(0.5);

    const happyJunie = this.add
      .image(this.scale.width / 2, this.scale.height / 2 + 120, "junie-happy")
      .setScale(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: [text, happyJunie],
      y: "-=50",
      alpha: { from: 0, to: 1 },
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        text.destroy();
        happyJunie.destroy();
      },
    });
  }

  private endGameByTime() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Stop timers
    if (this.gameTimer) this.gameTimer.destroy();
    if (this.obstacleTimer) this.obstacleTimer.destroy();
    if (this.collectibleTimer) this.collectibleTimer.destroy();

    // Stop background music and play victory
    this.sound.stopByKey("bgm");
    this.sound.play("victory", { volume: 0.6 });

    this.physics.pause();
    this.player.stop();
    this.player.setTexture("junie-happy");

    // Calculate final score with distance bonus
    const distanceBonus = Math.floor(this.distance / 10); // 1 point per 10m
    const finalScore = this.score + distanceBonus;

    const finalText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `TIME'S UP!\nFinal Score: ${finalScore}\nDistance: ${this.distance}m`,
        {
          fontSize: "48px",
          color: "#00ff00",
          fontStyle: "bold",
          align: "center",
          stroke: "#000000",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: finalText,
      alpha: 1,
      duration: 500,
    });

    this.time.delayedCall(2000, () => {
      if (this.onGameEnd) {
        this.onGameEnd(finalScore, this.distance);
      }
    });
  }

  private endGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Stop timers
    if (this.gameTimer) this.gameTimer.destroy();
    if (this.obstacleTimer) this.obstacleTimer.destroy();
    if (this.collectibleTimer) this.collectibleTimer.destroy();

    // Stop background music
    this.sound.stopByKey("bgm");
    this.sound.play("gameover", { volume: 0.7 });

    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.stop();
    this.player.setTexture("junie-sad");

    // Calculate final score with distance bonus
    const distanceBonus = Math.floor(this.distance / 10);
    const finalScore = this.score + distanceBonus;

    const finalText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `GAME OVER!\nFinal Score: ${finalScore}\nDistance: ${this.distance}m`,
        {
          fontSize: "48px",
          color: "#ff0000",
          fontStyle: "bold",
          align: "center",
          stroke: "#000000",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: finalText,
      alpha: 1,
      duration: 500,
    });

    this.time.delayedCall(2000, () => {
      if (this.onGameEnd) {
        this.onGameEnd(finalScore, this.distance);
      }
    });
  }
}
