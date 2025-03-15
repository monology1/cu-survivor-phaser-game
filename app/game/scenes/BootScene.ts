import * as Phaser from 'phaser';
import {create} from 'zustand';
import {initAudioOnUserInteraction, setVolumeSafe} from "@/game/utils/audioHelpers";

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

        // Initialize audio system safely
        initAudioOnUserInteraction(this);

        // Access the Zustand store in Phaser
        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) {
            // Get current settings
            const currentSettings = zustandStore.getState().settings;

            // Set initial volume levels if available
            if (currentSettings) {
                const soundVolume = typeof currentSettings.soundVolume === 'number'
                    ? currentSettings.soundVolume
                    : 0.7;

                // Use our safe volume setter
                setVolumeSafe(this, soundVolume);
            }

            // Set up subscription with safer implementation
            const unsubscribe = zustandStore.subscribe(
                (state: any) => {
                    // Only update sound if settings exist
                    if (state.settings) {
                        const newVolume = typeof state.settings.soundVolume === 'number'
                            ? state.settings.soundVolume
                            : 0.7;

                        // Use our safe volume setter
                        setVolumeSafe(this, newVolume);
                    }
                }
            );

            // Store the unsubscribe function to call it later if needed
            this.game.registry.set('zustandUnsubscribe', unsubscribe);
        }
    }
}