import * as Phaser from 'phaser';
import { CHARACTER_TYPES, ENEMY_TYPES, WEAPON_TYPES, POWERUP_TYPES, UPGRADE_TYPES } from '../config';

export default class PreloadScene extends Phaser.Scene {
    private loadingBar?: Phaser.GameObjects.Graphics;
    private progressBar?: Phaser.GameObjects.Graphics;
    private loadingText?: Phaser.GameObjects.Text;

    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.createLoadingUI();

        // Listen for loading progress
        this.load.on('progress', (value: number) => {
            this.updateProgressBar(value);
        });

        // Load background assets
        this.load.image('menu-background', '/assets/ui/main-menu-background.png');
        this.load.image('game-background', '/assets/maps/map_01.png');

        // Load UI assets
        this.load.image('coin', '/assets/items/coin_01.png');
        this.load.image('experience', '/assets/items/exp_gem.png');
        this.load.image('health-bar', '/assets/ui/health-bar.png');
        this.load.image('exp-bar', '/assets/ui/exp-bar.png');
        this.load.image('button', '/assets/ui/button.png');

        // map
        // this.load.image('game-map-01', '/assets/maps/map_01.png');

        // Load player characters
        Object.values(CHARACTER_TYPES).forEach(character => {
            this.load.image(character.sprite, `/assets/players/${character.id}.png`);
        });

        // Load enemies
        Object.values(ENEMY_TYPES).forEach(enemy => {
            this.load.image(enemy.sprite, `/assets/enemies/${enemy.sprite}.png`);
        });

        // Load weapons and projectiles
        Object.values(WEAPON_TYPES).forEach(weapon => {
            this.load.image(weapon.sprite, `/assets/weapons/${weapon.projectileSprite}.png`);
            this.load.image(weapon.projectileSprite, `/assets/weapons/${weapon.projectileSprite}.png`);
        });

        // Load powerups
        Object.values(POWERUP_TYPES).forEach(powerup => {
            this.load.image(`powerup-${powerup.id}`, `/assets/powerups/${powerup.sprite}.png`);
        });

        // Load upgrades
        Object.values(UPGRADE_TYPES).forEach(upgrade => {
            this.load.image(`upgrade-${upgrade.id}`, `/assets/upgrades/${upgrade.sprite}.png`);
        });

        // Load sound effects
        this.loadSoundEffects();

        // Load music
        this.loadMusic();

        // Listen for loading completion
        this.load.on('complete', () => {
            this.load.off('progress');
            this.load.off('complete');
            this.loadingText?.setText('Loading complete!');

            // Check the UI state to determine where to go next
            const zustandStore = this.game.registry.get('zustandStore');
            if (zustandStore) {
                const uiState = zustandStore.getState().ui;

                // If we're supposed to be playing (not in any menu), go directly to GameScene
                const inMenu = uiState.showMainMenu || uiState.showCharacterSelect ||
                    uiState.showPowerups || uiState.showOptions ||
                    uiState.showAchievements || uiState.showCollection ||
                    uiState.showCredits;

                // Wait a moment for visual feedback
                this.time.delayedCall(500, () => {
                    if (!inMenu) {
                        // Start the game directly
                        this.scene.start('GameScene');
                    } else {
                        // We're in a menu state, but the MainMenuScene is gone
                        // Let the React UI handle this - just stay in PreloadScene
                        // and wait for the user to click "Play" in the React UI

                        // Optionally, show a "Click to Play" message
                        if (this.loadingText) {
                            this.loadingText.setText('Click Play to begin!');
                        }
                    }
                });
            } else {
                // Fallback if store is unavailable
                this.time.delayedCall(500, () => {
                    this.scene.start('GameScene');
                });
            }
        });
    }

    create() {
        // This is intentionally empty as we transition to MainMenuScene in the 'complete' event
    }

    private createLoadingUI() {
        // Create loading text
        this.loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'Loading...',
            {
                font: 'bold 24px Arial',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Create loading bar background
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0x222222, 0.8);
        this.loadingBar.fillRect(
            this.cameras.main.width / 4,
            this.cameras.main.height / 2,
            this.cameras.main.width / 2,
            30
        );

        // Create progress bar
        this.progressBar = this.add.graphics();
    }

    private updateProgressBar(value: number) {
        if (!this.progressBar) return;

        // Clear the previous progress
        this.progressBar.clear();

        // Draw new progress
        this.progressBar.fillStyle(0x9966ff, 1);
        this.progressBar.fillRect(
            this.cameras.main.width / 4 + 5,
            this.cameras.main.height / 2 + 5,
            (this.cameras.main.width / 2 - 10) * value,
            20
        );

        // Update loading text with percentage
        if (this.loadingText) {
            this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
        }
    }

    private loadSoundEffects() {
        // Player related sounds
        this.load.audio('player-damage', '/assets/audio/sfx/player-damage.wav');
        this.load.audio('level-up', '/assets/audio/sfx/level-up.wav');
        this.load.audio('game-over', '/assets/audio/sfx/game-over.wav');
        this.load.audio('dodge', '/assets/audio/sfx/dodge.wav');

        // Weapon related sounds
        this.load.audio('shoot', '/assets/audio/sfx/shoot.wav');
        this.load.audio('hit', '/assets/audio/sfx/hit21.mp3.flac');

        // Enemy related sounds
        // this.load.audio('enemy-death', '/assets/audio/sfx/enemy-death.wav');
        this.load.audio('boss-appear', '/assets/audio/sfx/boss-appear.wav');
        this.load.audio('boss-death', '/assets/audio/sfx/boss-death.wav');
        this.load.audio('summon', '/assets/audio/sfx/summon.wav');

        // Item related sounds
        this.load.audio('coin-pickup', '/assets/audio/sfx/coin-pickup.wav');
        this.load.audio('exp-pickup', '/assets/audio/sfx/exp-pickup.wav');

        // UI related sounds
        this.load.audio('button-click', '/assets/audio/sfx/button-click.wav');
        this.load.audio('upgrade-select', '/assets/audio/sfx/upgrade-select.wav');
    }

    private loadMusic() {
        this.load.audio('main-menu', '/assets/audio/music/main-menu.mp3');
        this.load.audio('music-battle', '/assets/audio/music/battle.mp3');
        this.load.audio('music-boss', '/assets/audio/music/boss.mp3');
    }
}