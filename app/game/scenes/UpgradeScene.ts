import * as Phaser from 'phaser';
import { UPGRADE_TYPES } from '../config';

export default class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    create() {
        // This scene doesn't need to do much as upgrades are handled by React components
        // But we'll keep it as a placeholder and for potential future in-game upgrades

        // Get the current wave
        const gameStore = this.game.registry.get('gameStore');
        const currentWave = gameStore?.currentRun?.wave || 1;

        // Display a simple message
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Preparing for Wave ${currentWave}...`,
            {
                font: '24px Arial',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Add a continue button (as fallback in case React UI fails)
        const continueButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            'CONTINUE',
            {
                font: 'bold 24px Arial',
                color: '#ffffff',
                backgroundColor: '#005500',
                padding: {
                    left: 15,
                    right: 15,
                    top: 8,
                    bottom: 8
                }
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        continueButton.on('pointerdown', () => {
            this.continueToNextWave();
        });

        continueButton.on('pointerover', () => {
            continueButton.setBackgroundColor('#007700');
        });

        continueButton.on('pointerout', () => {
            continueButton.setBackgroundColor('#005500');
        });
    }

    continueToNextWave() {
        // Resume the game scene
        const gameScene = this.scene.get('GameScene');
        this.scene.stop();
        gameScene.scene.resume();

        // Update the store to hide upgrade UI
        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) {
            zustandStore.setState((state: any) => ({
                ...state,
                ui: {
                    ...state.ui,
                    showUpgrades: false,
                    paused: false
                }
            }));
        }
    }
}