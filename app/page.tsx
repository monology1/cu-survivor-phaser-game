'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
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

  return (
      <main className="flex min-h-screen flex-col items-center justify-between">
        {ui.showMenu ? (
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