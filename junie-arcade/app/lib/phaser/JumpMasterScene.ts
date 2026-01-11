import * as Phaser from "phaser";

export default class JumpMasterScene extends Phaser.Scene {
  private player!: any;
  private score = 0;
  private distance = 0;
  private gameSpeed = 400; // Increased starting speed for more dynamic feel
  private isGameOver = false;
  private scoreText!: any;
  private obstacles!: any;
  private collectibles!: any;
  private onGameEnd?: (score: number, distance: number) => void;
  private ground!: any;

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
    this.load.image("junie-idle", "/assets/images/junie/junie-idle.png");
    this.load.image("background", "/assets/images/backgrounds/bg-space.jpg");
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
    this.score = 0;
    this.distance = 0;
    this.gameSpeed = 400;
    this.isGameOver = false;

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
    // Scale background to fit screen
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    // Add a dark overlay to make sure Junie and other objects are visible
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.2).setOrigin(0);

    // Ground
    this.ground = this.add
      .rectangle(0, this.scale.height - 100, this.scale.width, 100, 0x8b4513)
      .setOrigin(0);
    this.physics.add.existing(this.ground, true);

    // Player
    this.player = this.physics.add.sprite(
      150,
      this.scale.height - 200,
      "junie-idle"
    );
    this.player.setScale(0.35); // Reduced from 0.5
    
    // Start animation after a short delay to use idle
    this.time.delayedCall(500, () => {
        if (!this.isGameOver) {
            this.player.play("run");
        }
    });

    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1600); // Increased from 1200 for even faster fall

    // Collisions
    this.physics.add.collider(this.player, this.ground);
    
    // Adjust hitbox for fairer gameplay
    if (this.player.body) {
      this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.8);
      this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.1);
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
        const points = type === "cloud9" ? 25 : 10;

        this.score += points;
        this.sound.play("coin", { volume: 0.6 });
        this.showPoints(collectible.x, collectible.y, "+" + points);
        collectible.destroy();
      },
      undefined,
      this
    );

    // UI
    this.scoreText = this.add.text(20, 20, "Score: 0 | Distance: 0m", {
      fontSize: "28px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });

    // Instructions
    const instructions = this.add
      .text(this.scale.width / 2, 100, "Press SPACE or CLICK to Jump!", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.time.delayedCall(3000, () => instructions.destroy());

    // Input
    this.input.keyboard?.on("keydown-SPACE", () => this.jump());
    this.input.on("pointerdown", () => this.jump());

    // Spawn obstacles and collectibles
    this.time.addEvent({
      delay: 2500, // Increased from 2000 to give more space
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 2000, // Reduced from 3000 to spawn more coins
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true,
    });

    // Update distance
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.isGameOver) {
          this.distance += 1;
          this.scoreText.setText(
            `Score: ${this.score} | Distance: ${this.distance}m`
          );

          // Increase difficulty
          if (this.distance % 100 === 0) {
            this.gameSpeed += 20;
          }

          // Milestone celebration
          if (this.distance > 0 && this.distance % 500 === 0) {
            this.celebrateMilestone();
          }
        }
      },
      loop: true,
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
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run") {
        this.player.play("run", true);
      }
    } else if (!this.player.body?.touching.down && !this.isGameOver) {
      // In air - show jump texture if not already set (and stop animations)
      if (this.player.anims.isPlaying) {
        this.player.stop();
      }
      this.player.setTexture("junie-jump");
    }
  }

  private jump() {
    if (this.isGameOver) return;

    if (this.player.body?.touching.down) {
      this.player.setVelocityY(-900); // Increased from -750 to match higher gravity
      this.sound.play("jump", { volume: 0.5 });
      // update() loop will handle the texture change to "junie-jump"
    }
  }

  private spawnObstacle() {
    if (this.isGameOver) return;

    const obstacle = this.obstacles.create(
      this.scale.width + 50,
      this.scale.height - 125, // Adjusted from 135 to sit better on ground
      "bug"
    ) as any;

    obstacle.setScale(0.12); // Reduced from 0.15
    
    // Adjust obstacle hitbox
    if (obstacle.body) {
      obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.6);
    }
  }

  private spawnCollectible() {
    if (this.isGameOver) return;

    const type = Math.random() > 0.5 ? "cloud9" : "coin";
    const y = Phaser.Math.Between(
      this.scale.height - 350, // Higher range
      this.scale.height - 200
    );

    const collectible = this.collectibles.create(
      this.scale.width + 50,
      y,
      type
    ) as any;

    collectible.setScale(0.2).setData("type", type); // Reduced from 0.25
    
    // Make collectibles easier to pick up (larger hitbox than visual)
    if (collectible.body) {
      collectible.body.setSize(collectible.width * 1.2, collectible.height * 1.2);
    }
  }

  private showPoints(x: number, y: number, text: string) {
    const pointsText = this.add
      .text(x, y, text, {
        fontSize: "24px",
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
    const text = this.add.text(this.scale.width / 2, this.scale.height / 2, "AWESOME!", {
      fontSize: "64px",
      color: "#ffff00",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    const happyJunie = this.add.image(this.scale.width / 2, this.scale.height / 2 + 100, "junie-happy").setScale(0.5).setAlpha(0);

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
      }
    });
  }

  private endGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    
    // Stop background music
    this.sound.stopByKey("bgm");
    this.sound.play("gameover", { volume: 0.7 });

    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.stop();
    this.player.setTexture("junie-sad");

    this.time.delayedCall(1000, () => {
      if (this.onGameEnd) {
        this.onGameEnd(this.score, this.distance);
      }
    });
  }
}
