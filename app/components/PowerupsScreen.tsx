'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { POWERUP_TYPES } from '@/game/config';

export default function PowerupsScreen() {
    const { returnToMainMenu, coins, powerups, purchasePowerup, unlocked } = useGameStore();
    const [selectedPowerup, setSelectedPowerup] = useState<string | null>(null);

    // Get information about the selected powerup
    const selectedPowerupConfig = selectedPowerup
        ? POWERUP_TYPES.find(p => p.id === selectedPowerup)
        : null;

    // Get current level of the selected powerup
    const currentLevel = selectedPowerup ? (powerups[selectedPowerup] || 0) : 0;

    // Calculate cost for the next level of the selected powerup
    const calculateCost = (powerupId: string) => {
        const powerupConfig = POWERUP_TYPES.find(p => p.id === powerupId);
        if (!powerupConfig) return 0;

        const level = powerups[powerupId] || 0;
        return Math.floor(powerupConfig.baseCost * Math.pow(powerupConfig.costMultiplier, level));
    };

    // Handle purchasing a powerup
    const handlePurchase = () => {
        if (!selectedPowerup) return;

        const success = purchasePowerup(selectedPowerup);
        if (!success) {
            // Could show a "not enough coins" message here
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-40 bg-gray-900">
            <div className="bg-gray-800 p-6 rounded-lg max-w-5xl w-full min-h-[500px] text-white">
                <div className="flex justify-between items-center mb-4">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-1 rounded"
                        onClick={returnToMainMenu}
                    >
                        Back
                    </button>

                    <h2 className="text-2xl font-bold text-center">Powerups</h2>

                    <div className="flex items-center">
                        <img src="/assets/items/coin_01.png" alt="Coins" className="w-6 h-6 mr-2" />
                        <span className="text-yellow-400">{coins}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-3 gap-4 overflow-y-auto p-2">
                    {POWERUP_TYPES.map((powerup) => {
                        const isUnlocked = !powerup.unlockCondition || unlocked.powerups.includes(powerup.id);
                        const level = powerups[powerup.id] || 0;
                        const isMaxLevel = level >= powerup.maxLevel;
                        const isSelected = selectedPowerup === powerup.id;

                        return (
                            <div
                                key={powerup.id}
                                className={`
                                    p-4 rounded cursor-pointer transition-all relative
                                    ${isSelected ? 'border-2 border-yellow-500' : 'border border-gray-600'}
                                    ${isUnlocked ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 opacity-60 cursor-not-allowed'}
                                `}
                                onClick={() => isUnlocked && setSelectedPowerup(powerup.id)}
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="mb-2">
                                        <img
                                            src={`/assets/powerups/${powerup.sprite}.png`}
                                            alt={powerup.name}
                                            className="w-12 h-12 object-contain"
                                        />
                                    </div>
                                    <h3 className="text-lg font-medium text-center">{powerup.name}</h3>

                                    {isMaxLevel ? (
                                        <span className="text-yellow-500 text-sm mt-1">MAX</span>
                                    ) : (
                                        <div className="flex mt-1">
                                            {Array(powerup.maxLevel).fill(0).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 mx-0.5 rounded-full ${i < level ? 'bg-yellow-500' : 'bg-gray-500'}`}
                                                ></div>
                                            ))}
                                        </div>
                                    )}

                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded">
                                            <div className="text-center">
                                                <span className="text-2xl block mb-2">🔒</span>
                                                <span className="text-xs text-gray-300">{powerup.unlockCondition}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedPowerupConfig && (
                    <div className="mt-4 border-t border-gray-600 pt-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">
                                {selectedPowerupConfig.name}
                                {currentLevel > 0 && (
                                    <span className="text-yellow-400 text-sm ml-2">
                                        Lv. {currentLevel}/{selectedPowerupConfig.maxLevel}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-300">{selectedPowerupConfig.description}</p>
                        </div>

                        {currentLevel < selectedPowerupConfig.maxLevel ? (
                            <button
                                className={`
                                    flex items-center px-4 py-2 rounded font-bold
                                    ${coins >= calculateCost(selectedPowerup as string)
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                                `}
                                onClick={handlePurchase}
                                disabled={coins < calculateCost(selectedPowerup as string)}
                            >
                                <img src="/assets/items/coin_01.png" alt="Coins" className="w-5 h-5 mr-2" />
                                <span>{calculateCost(selectedPowerup as string)}</span>
                            </button>
                        ) : (
                            <button
                                className="bg-gray-700 text-gray-400 px-4 py-2 rounded font-bold cursor-not-allowed"
                                disabled
                            >
                                Maxed Out
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}