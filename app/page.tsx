'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';

// Import components
import MainMenu from '@/components/MainMenu';
import UpgradeMenu from '@/components/UpgradeMenu';
import GameOverScreen from '@/components/GameOverScreen';

// Import game container with SSR disabled (since Phaser needs window)
const GameContainer = dynamic(
    () => import('@/components/GameContainer'),
    { ssr: false }
);

export default function Home() {
    const { ui } = useGameStore();

    // Determine if we should be showing a menu or the game
    const showingMenu = ui.showMainMenu || ui.showCharacterSelect ||
        ui.showPowerups || ui.showOptions ||
        ui.showAchievements || ui.showCollection ||
        ui.showCredits;

    // Setup keyboard listeners for fullscreen toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F11' || (e.key === 'f' && e.ctrlKey)) {
                e.preventDefault();

                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            {showingMenu ? (
                <MainMenu />
            ) : (
                <div className="relative w-full h-screen">
                    <GameContainer />

                    {/* Overlay UIs */}
                    {ui.showUpgrades && <UpgradeMenu />}
                    {ui.showGameOver && <GameOverScreen />}
                </div>
            )}
        </main>
    );
}