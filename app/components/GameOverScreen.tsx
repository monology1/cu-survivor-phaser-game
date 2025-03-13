'use client';

import { useGameStore } from '@/store/gameStore';

export default function GameOverScreen() {
    const { currentRun, returnToMainMenu } = useGameStore();

    // Format time string (mm:ss)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-lg w-full text-center text-white">
                <h2 className="text-4xl font-bold text-red-500 mb-6">Game Over</h2>

                <div className="mb-8">
                    <div className="text-2xl text-white mb-2">
                        You reached wave {currentRun.wave}
                    </div>
                    <div className="text-4xl text-yellow-400 font-bold">
                        Score: {currentRun.score}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-700 p-4 rounded">
                        <div className="text-gray-400 text-sm">Kills</div>
                        <div className="text-white text-xl font-bold">{currentRun.kills}</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                        <div className="text-gray-400 text-sm">Time Survived</div>
                        <div className="text-white text-xl font-bold">
                            {formatTime(currentRun.timeElapsed)}
                        </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                        <div className="text-gray-400 text-sm">Coins Collected</div>
                        <div className="text-white text-xl font-bold">{currentRun.coinsCollected}</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                        <div className="text-gray-400 text-sm">Level Reached</div>
                        <div className="text-white text-xl font-bold">{currentRun.playerStats.level}</div>
                    </div>
                </div>

                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                    onClick={returnToMainMenu}
                >
                    Return to Menu
                </button>
            </div>
        </div>
    );
}