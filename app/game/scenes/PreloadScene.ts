import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    private loadingBar?: Phaser.GameObjects.Graphics;
    private progressBar?: Phaser.GameObjects.Graphics;

    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.createLoadingBar();

        // Listen for loading progress
        this.load.on('progress', (value: number) => {
            this.updateProgressBar(value);
        });

        // Load players
        this.load.image('player', 'assets/players/player.png');
        // Load enemies
        this.load.image('enemy-basic', 'assets/enemies/enemy-basic.png');
        this.load.image('enemy-fast', 'assets/enemy-fast.png');
        this.load.image('enemy-tank', 'assets/enemy-tank.png');
        this.load.image('enemy-ranged', 'assets/enemy-ranged.png');
        this.load.image('projectile', 'assets/weapons/projectile-basic.png');

        // Load sounds
        this.load.audio('shoot', 'assets/audio/weapons/shoot.wav');
        this.load.audio('hit', 'assets/audio/weapons/hit21.mp3.flac');
        this.load.audio('player-damage', 'assets/sounds/player-damage.wav');
        // this.load.audio('enemy-death', 'assets/sounds/enemy-death.wav');
        this.load.audio('level-up', 'assets/sounds/level-up.wav');
        this.load.audio('game-over', 'assets/sounds/game-over.wav');
        this.load.audio('music-battle', 'assets/audio/background/musicBattle.mp3');
        // Load bg sounds
        this.load.audio('main-menu', '/assets/audio/background/mainMenu.mp3');
        this.load.audio('music-battle', '/assets/audio/background/musicBattle.mp3');

        // Listen for loading completion
        this.load.on('complete', () => {
            this.load.off('progress');
            this.load.off('complete');
        });

        // Load game assets
        this.loadAssets();
    }

    create() {
        // Move to the main menu scene when preloading is complete
        this.scene.start('MainMenuScene');
    }

    private createLoadingBar() {
        // Create loading bar background
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0x222222, 0.8);
        this.loadingBar.fillRect(
            this.cameras.main.width / 4,
            this.cameras.main.height / 2 - 16,
            this.cameras.main.width / 2,
            32
        );

        // Create progress bar
        this.progressBar = this.add.graphics();
    }

    private updateProgressBar(value: number) {
        if (!this.progressBar) return;

        this.progressBar.clear();
        this.progressBar.fillStyle(0x00ff00, 1);
        this.progressBar.fillRect(
            this.cameras.main.width / 4 + 4,
            this.cameras.main.height / 2 - 12,
            (this.cameras.main.width / 2 - 8) * value,
            24
        );
    }

    private loadAssets() {
        // Player assets
        this.load.image('player', '/assets/sprites/characters/player.png');

        // Enemy assets
        this.load.image('enemy-basic', '/assets/sprites/enemies/enemy-basic.png');
        this.load.image('enemy-fast', '/assets/sprites/enemies/enemy-fast.png');
        this.load.image('enemy-tank', '/assets/sprites/enemies/enemy-tank.png');
        this.load.image('enemy-ranged', '/assets/sprites/enemies/enemy-ranged.png');

        // Weapon assets
        this.load.image('projectile', '/assets/sprites/weapons/projectile.png');

        // UI assets
        this.load.image('button', '/assets/ui/button.png');
        this.load.image('health-bar', '/assets/ui/health-bar.png');
        this.load.image('exp-bar', '/assets/ui/exp-bar.png');

        // Audio assets
        this.load.audio('shoot', '/assets/audio/sfx/shoot.mp3');
        this.load.audio('hit', '/assets/audio/sfx/hit.mp3');
        this.load.audio('enemy-death', '/assets/audio/sfx/enemy-death.mp3');
        this.load.audio('player-damage', '/assets/audio/sfx/player-damage.mp3');
        this.load.audio('level-up', '/assets/audio/sfx/level-up.mp3');
        this.load.audio('game-over', '/assets/audio/sfx/game-over.mp3');
        this.load.audio('music-main', '/assets/audio/music/main-theme.mp3');
        this.load.audio('music-battle', '/assets/audio/music/battle.mp3');
    }
}