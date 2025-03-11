'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import Phaser from 'phaser';

// Import game scenes (adjust paths as necessary)
import BootScene from '@/game/scenes/BootScene';
// import PreloadScene from '@/game/scenes/PreloadScene';
// import MainMenuScene from '@/game/scenes/MainMenuScene';
// import GameScene from '@/game/scenes/GameScene';
// import UpgradeScene from '@/game/scenes/UpgradeScene';

export default function GameContainer() {
    const gameRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    const { setGameInstance } = useGameStore();

    useEffect(() => {
        if (gameInstanceRef.current || !gameRef.current) return;

        // Game configuration
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: process.env.NODE_ENV === 'development'
                }
            },
            scene: [
                BootScene,
                // PreloadScene,
                // MainMenuScene,
                // GameScene,
                // UpgradeScene
            ],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            pixelArt: true
        };

        // Initialize the game
        gameInstanceRef.current = new Phaser.Game(config);

        // Make store accessible to Phaser scenes
        gameInstanceRef.current.registry.set('gameStore', useGameStore.getState());
        gameInstanceRef.current.registry.set('zustandStore', useGameStore);

        // Update store with game instance
        setGameInstance(gameInstanceRef.current);

        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={gameRef}
            className="game-container"
            style={{ width: '100%', height: '100vh' }}
        />
    );
}