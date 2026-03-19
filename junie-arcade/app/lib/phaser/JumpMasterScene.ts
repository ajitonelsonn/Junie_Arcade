import * as Phaser from "phaser";

export default class JumpMasterScene extends Phaser.Scene {
  private player!: any;
  private score = 0;
  private distance = 0;
  private timeLeft = 50;
  private gameSpeed = 500;
  private isGameOver = false;
  private scoreText!: any;
  private timerText!: any;
  private distanceText!: any;
  private jumpCountText!: any; // NEW: Display remaining jumps
  private jumpIndicators: Phaser.GameObjects.Image[] = []; // NEW: Visual jump indicators using junie-jump image
  private obstacles!: any;
  private collectibles!: any;
  private onGameEnd?: (score: number, distance: number) => void;
  private ground!: any;
  private jumpsRemaining = 3; // NEW: Changed from hasDoubleJump boolean to jump counter
  private maxJumps = 3; // NEW: Maximum jumps allowed
  private obstacleSpawnDelay = 1800;
  private collectibleSpawnDelay = 1200;
  private gameTimer!: Phaser.Time.TimerEvent;
  private obstacleTimer!: Phaser.Time.TimerEvent;
  private collectibleTimer!: Phaser.Time.TimerEvent;
  private gameStarted = false; // NEW: Track if game has started after countdown
  private lives = 3; // Lives system: player gets 3 lives
  private maxLives = 3;
  private lifeIndicators: Phaser.GameObjects.Image[] = [];
  private isInvincible = false; // Brief invincibility after taking a hit

  constructor() {
    super({ key: "JumpMasterScene" });
  }

  init(data: { onGameEnd?: (score: number, distance: number) => void }) {
    this.onGameEnd = data.onGameEnd;
  }

  preload() {
    this.load.image("junie-idle", "/assets/images/junie/junie-idle.png");
    this.load.image("junie-run-1", "/assets/images/junie/junie-run-1.png");
    this.load.image("junie-run-2", "/assets/images/junie/junie-run-2.png");
    this.load.image("junie-run-3", "/assets/images/junie/junie-run-3.png");
    this.load.image("junie-jump", "/assets/images/junie/junie-jump.png");
    this.load.image("junie-sad", "/assets/images/junie/junie-sad.png");
    this.load.image("junie-happy", "/assets/images/junie/junie-happy.png");
    this.load.image("background", "/assets/images/backgrounds/Gemini_Generated_Image_4crhid4crhid4crh.webp");
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
    this.jumpsRemaining = this.maxJumps; // NEW: Reset jumps
    this.obstacleSpawnDelay = 1800;
    this.collectibleSpawnDelay = 1200;
    this.gameStarted = false; // NEW: Game hasn't started yet
    this.lives = this.maxLives;
    this.lifeIndicators = [];
    this.isInvincible = false;

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

    // Player - start with idle texture during countdown
    this.player = this.physics.add.sprite(
      150,
      this.scale.height - 200,
      "junie-idle",
    );
    this.player.setScale(0.35);

    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(2000);

    // Collisions
    this.physics.add.collider(this.player, this.ground);

    // Adjust hitbox
    if (this.player.body) {
      this.player.body.setSize(
        this.player.width * 0.7,
        this.player.height * 0.8,
      );
      this.player.body.setOffset(
        this.player.width * 0.15,
        this.player.height * 0.1,
      );
    }

    // Groups
    this.obstacles = this.physics.add.group();
    this.collectibles = this.physics.add.group();

    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.hitObstacle,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      (p: any, c: any) => {
        const collectible = c as any;
        const type = collectible.getData("type");
        const points = type === "cloud9" ? 50 : 20;

        this.score += points;
        this.sound.play("coin", { volume: 0.6 });
        this.showPoints(collectible.x, collectible.y, "+" + points);
        collectible.destroy();
      },
      undefined,
      this,
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

    // NEW: UI - Jump Indicators (visual Junie icons below score)
    const jumpIndicatorY = 70;
    const jumpIndicatorStartX = 30;
    const jumpIndicatorSpacing = 35;

    for (let i = 0; i < this.maxJumps; i++) {
      const junieIcon = this.add.image(
        jumpIndicatorStartX + i * jumpIndicatorSpacing,
        jumpIndicatorY,
        "junie-jump",
      );
      junieIcon.setScale(0.08);
      junieIcon.setAlpha(1);
      this.jumpIndicators.push(junieIcon);
    }

    // Life Indicators (hearts) - top right area below distance
    const lifeIndicatorY = 65;
    const lifeIndicatorStartX = this.scale.width - 30;
    const lifeIndicatorSpacing = 40;

    for (let i = 0; i < this.maxLives; i++) {
      const heart = this.add.text(
        lifeIndicatorStartX - i * lifeIndicatorSpacing,
        lifeIndicatorY,
        "❤️",
        { fontSize: "28px" },
      );
      heart.setOrigin(0.5);
      this.lifeIndicators.push(heart as any);
    }

    // Instructions
    const instructions = this.add
      .text(
        this.scale.width / 2,
        100,
        "Press SPACE or CLICK to Jump!\n3 Jumps Available in Air!\n❤️ 3 Lives!",
        {
          fontSize: "24px",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(100);

    // NEW: Countdown before game starts
    this.startCountdown(instructions);

    // Input
    this.input.keyboard?.on("keydown-SPACE", () => this.jump());
    this.input.on("pointerdown", () => this.jump());

    // Don't start timers yet - will start after countdown
  }

  // NEW: Countdown from 3 to GO before starting the game
  private startCountdown(instructions: Phaser.GameObjects.Text) {
    let countdownValue = 3;

    const countdownText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "3", {
        fontSize: "120px",
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(101);

    const countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdownValue--;

        if (countdownValue > 0) {
          countdownText.setText(countdownValue.toString());
          // Pulse animation
          countdownText.setScale(0.5);
          this.tweens.add({
            targets: countdownText,
            scale: 1.2,
            duration: 500,
            ease: "Back.easeOut",
          });
          // Play sound
          this.sound.play("jump", { volume: 0.3 });
        } else {
          // Show "GO!"
          countdownText.setText("GO!");
          countdownText.setTint(0x00ff00); // Use tint instead of setColor
          countdownText.setScale(0.5);
          this.tweens.add({
            targets: countdownText,
            scale: 1.5,
            alpha: 0,
            duration: 800,
            ease: "Power2",
            onComplete: () => {
              countdownText.destroy();
            },
          });

          // Start the game
          this.gameStarted = true;
          instructions.destroy();
          this.startGameTimers();

          // Play sound
          this.sound.play("coin", { volume: 0.5 });
        }
      },
      repeat: 3,
    });
  }

  // NEW: Start all game timers after countdown
  private startGameTimers() {
    // Start running animation when game begins
    if (!this.isGameOver) {
      this.player.play("run");
    }

    // Game Timer
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Spawn obstacles
    this.obstacleTimer = this.time.addEvent({
      delay: this.obstacleSpawnDelay,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Spawn collectibles
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
        if (!this.isGameOver && this.gameStarted) {
          this.distance += 1;

          if (this.distance % 10 === 0) {
            this.score += 1;
          }

          this.scoreText.setText(`Score: ${this.score}`);
          this.distanceText.setText(`Distance: ${this.distance}m`);

          if (
            this.timeLeft % 10 === 0 &&
            this.timeLeft > 0 &&
            this.timeLeft < 50
          ) {
            this.increaseDifficulty();
          }

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
    if (this.gameSpeed < 700) {
      this.gameSpeed += 40;
    }

    if (this.obstacleSpawnDelay > 1000) {
      this.obstacleSpawnDelay -= 150;
      this.obstacleTimer.reset({
        delay: this.obstacleSpawnDelay,
        callback: this.spawnObstacle,
        callbackScope: this,
        loop: true,
      });
    }

    if (this.collectibleSpawnDelay > 700) {
      this.collectibleSpawnDelay -= 100;
      this.collectibleTimer.reset({
        delay: this.collectibleSpawnDelay,
        callback: this.spawnCollectible,
        callbackScope: this,
        loop: true,
      });
    }

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
    if (this.isGameOver || !this.gameStarted) return; // NEW: Don't update until game starts

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

    // NEW: Reset jumps when landed
    if (this.player.body?.touching.down) {
      this.jumpsRemaining = this.maxJumps;
      this.updateJumpCounter();

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

  // NEW: Update jump counter display
  private updateJumpCounter() {
    // Update visual indicators
    for (let i = 0; i < this.maxJumps; i++) {
      if (i < this.jumpsRemaining) {
        // Jump available - full brightness with green tint
        this.jumpIndicators[i].setAlpha(1);
        this.jumpIndicators[i].setTint(0x00ff00);
      } else {
        // Jump used - faded and darkened
        this.jumpIndicators[i].setAlpha(0.3);
        this.jumpIndicators[i].setTint(0x666666);
      }
    }
  }

  // MODIFIED: Jump function for 5 jumps
  private jump() {
    if (this.isGameOver) return;

    // First jump - from ground
    if (this.player.body?.touching.down) {
      this.player.setVelocityY(-1000);
      this.jumpsRemaining = this.maxJumps - 1; // Use 1 jump
      this.updateJumpCounter();
      this.sound.play("jump", { volume: 0.5 });
    }
    // Air jumps - can jump up to 5 times total
    else if (this.jumpsRemaining > 0 && !this.player.body?.touching.down) {
      this.player.setVelocityY(-1000);
      this.jumpsRemaining--;
      this.updateJumpCounter();
      this.sound.play("jump", {
        volume: 0.5 + 0.1 * (this.maxJumps - this.jumpsRemaining),
      }); // Slightly louder for each jump

      // Visual feedback for air jumps
      const jumpEffect = this.add.circle(
        this.player.x,
        this.player.y + 20,
        15,
        0x00ffff,
        0.6,
      );
      this.tweens.add({
        targets: jumpEffect,
        scale: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => jumpEffect.destroy(),
      });
    }
  }

  private spawnObstacle() {
    if (this.isGameOver || !this.gameStarted) return; // NEW: Don't spawn during countdown

    const obstacle = this.obstacles.create(
      this.scale.width + 50,
      this.scale.height - 125,
      "bug",
    ) as any;

    obstacle.setScale(0.13);

    if (obstacle.body) {
      obstacle.body.setSize(obstacle.width * 0.65, obstacle.height * 0.65);
    }

    if (Math.random() < 0.35 && this.distance > 100) {
      this.time.delayedCall(400, () => {
        if (!this.isGameOver) {
          const obstacle2 = this.obstacles.create(
            this.scale.width + 50,
            this.scale.height - 125,
            "bug",
          ) as any;
          obstacle2.setScale(0.13);
          if (obstacle2.body) {
            obstacle2.body.setSize(
              obstacle2.width * 0.65,
              obstacle2.height * 0.65,
            );
          }
        }
      });
    }
  }

  private spawnCollectible() {
    if (this.isGameOver || !this.gameStarted) return; // NEW: Don't spawn during countdown

    const type = Math.random() > 0.6 ? "cloud9" : "coin";
    const y = Phaser.Math.Between(
      this.scale.height - 380,
      this.scale.height - 200,
    );

    const collectible = this.collectibles.create(
      this.scale.width + 50,
      y,
      type,
    ) as any;

    collectible.setScale(0.17).setData("type", type);

    if (collectible.body) {
      collectible.body.setSize(
        collectible.width * 1.3,
        collectible.height * 1.3,
      );
    }

    if (Math.random() < 0.25) {
      this.time.delayedCall(300, () => {
        if (!this.isGameOver) {
          const followUp = this.collectibles.create(
            this.scale.width + 50,
            y + Phaser.Math.Between(-80, 80),
            type,
          ) as any;
          followUp.setScale(0.17).setData("type", type);
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
        },
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

  private hitObstacle(_player: any, obstacle: any) {
    if (this.isGameOver || this.isInvincible) return;

    // Destroy the obstacle that was hit
    obstacle.destroy();

    this.lives--;
    this.sound.play("gameover", { volume: 0.4 });

    // Update life indicators
    for (let i = 0; i < this.maxLives; i++) {
      if (i < this.lives) {
        (this.lifeIndicators[i] as any).setText("❤️");
        (this.lifeIndicators[i] as any).setAlpha(1);
      } else {
        (this.lifeIndicators[i] as any).setText("🖤");
        (this.lifeIndicators[i] as any).setAlpha(0.4);
      }
    }

    if (this.lives <= 0) {
      // No lives left — game over
      this.endGame();
      return;
    }

    // Brief invincibility (1.5 seconds) with flashing effect
    this.isInvincible = true;
    this.player.setTint(0xff0000);
    this.cameras.main.shake(200, 0.005);

    // Show damage text
    const dmgText = this.add
      .text(this.player.x, this.player.y - 40, `❤️ ${this.lives} LEFT`, {
        fontSize: "24px",
        color: "#ff4444",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => dmgText.destroy(),
    });

    // Flash player during invincibility
    const flashTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        this.player.setAlpha(this.player.alpha === 1 ? 0.3 : 1);
      },
      repeat: 14, // 1.5 seconds of flashing
    });

    this.time.delayedCall(1500, () => {
      this.isInvincible = false;
      this.player.setAlpha(1);
      this.player.clearTint();
      flashTimer.destroy();
    });
  }

  private endGameByTime() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.gameTimer) this.gameTimer.destroy();
    if (this.obstacleTimer) this.obstacleTimer.destroy();
    if (this.collectibleTimer) this.collectibleTimer.destroy();

    this.sound.stopByKey("bgm");
    this.sound.play("victory", { volume: 0.6 });

    this.physics.pause();
    this.player.stop();
    this.player.setTexture("junie-happy");

    const distanceBonus = Math.floor(this.distance / 10);
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
        },
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

    if (this.gameTimer) this.gameTimer.destroy();
    if (this.obstacleTimer) this.obstacleTimer.destroy();
    if (this.collectibleTimer) this.collectibleTimer.destroy();

    this.sound.stopByKey("bgm");
    this.sound.play("gameover", { volume: 0.7 });

    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.stop();
    this.player.setTexture("junie-sad");

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
        },
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
