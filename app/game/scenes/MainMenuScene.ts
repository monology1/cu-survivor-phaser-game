import * as Phaser from 'phaser';
export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
            .setOrigin(0);

        // Title
        // this.add.text(
        //     this.cameras.main.width / 2,
        //     100,
        //     'VAMPIRE BROTATO',
        //     {
        //         font: 'bold 48px Arial',
        //         color: '#ffffff'
        //     }
        // ).setOrigin(0.5);

        this.add.image(0, 0, 'menu-background')
            .setOrigin(0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);


        // Start button
        const startButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'START GAME',
            {
                font: 'bold 32px Arial',
                color: '#ffffff',
                backgroundColor: '#007700',
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10
                }
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // Button events
        startButton.on('pointerdown', () => {
            // Access the game store (from Zustand)
            const gameStore = this.game.registry.get('gameStore');

            if (gameStore) {
                // Update UI state in the store
                const zustandStore = this.game.registry.get('zustandStore');
                if (zustandStore) {
                    zustandStore.setState((state: any) => ({
                        ...state,
                        ui: {
                            ...state.ui,
                            showMenu: false
                        }
                    }));
                }
            }

            // Start the game scene
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setBackgroundColor('#00aa00');
        });

        startButton.on('pointerout', () => {
            startButton.setBackgroundColor('#007700');
        });

        // Settings button
        const settingsButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            'SETTINGS',
            {
                font: 'bold 24px Arial',
                color: '#ffffff',
                backgroundColor: '#555555',
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

        settingsButton.on('pointerover', () => {
            settingsButton.setBackgroundColor('#777777');
        });

        settingsButton.on('pointerout', () => {
            settingsButton.setBackgroundColor('#555555');
        });

        // Version info
        this.add.text(
            this.cameras.main.width - 10,
            this.cameras.main.height - 10,
            'v0.1.0',
            {
                font: '16px Arial',
                color: '#666666'
            }
        ).setOrigin(1, 1);

        try {
            const menuMusic = this.sound.get('main-menu');
            if (menuMusic) {
                if (!menuMusic.isPlaying) {
                    menuMusic.play({ loop: true, volume: 0.5 });
                }
            } else if (this.sound.add) {
                this.sound.add('main-menu', { loop: true, volume: 0.5 }).play();
            }
        } catch (error) {
            console.warn('Could not play menu music:', error);
        }
    }
}