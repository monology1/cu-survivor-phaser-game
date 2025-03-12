import * as Phaser from 'phaser';
import { create } from 'zustand';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal assets needed for the loading screen
        this.load.image('logo', '/assets/ui/logo.png');
        this.load.image('loading-bar', '/assets/ui/loading-bar.png');
        this.load.image('loading-bar-bg', '/assets/ui/loading-bar-bg.png');
    }

    create() {
        // Display simple loading text
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Loading...',
            {
                font: '24px Arial',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Set up any configurations before moving to the PreloadScene
        this.setupGameConfig();

        // Transition to the preload scene
        this.scene.start('PreloadScene');
    }

    setupGameConfig() {
        // Set up any initial game configurations
        this.scale.setGameSize(800, 600);

        // You can add more configuration here

        // Access the Zustand store in Phaser
        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) {
            // You can subscribe to state changes here if needed
            const unsubscribe = zustandStore.subscribe(
                (state: any) => {
                    // React to state changes if needed
                    // For example, handle volume changes
                    if (this.sound && this.sound.mute !== !state.settings.soundVolume) {
                        this.sound.mute = !state.settings.soundVolume;
                    }
                }
            );

            // Store the unsubscribe function to call it later if needed
            this.game.registry.set('zustandUnsubscribe', unsubscribe);
        }
    }
}