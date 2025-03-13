'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { UPGRADE_TYPES } from '@/game/config';

export default function UpgradeMenu() {
    const { currentRun, selectUpgrade } = useGameStore();
    const [availableUpgrades, setAvailableUpgrades] = useState<typeof UPGRADE_TYPES>([]);

    useEffect(() => {
        // Get random upgrades
        const getRandomUpgrades = () => {
            // Filter out upgrades that don't make sense to repeat
            const eligibleUpgrades = UPGRADE_TYPES.filter(upgrade => {
                // For non-repeatable upgrades like 'teleport', only show if not already chosen
                if (upgrade.maxLevel === 1) {
                    return !currentRun.upgrades.includes(upgrade.id);
                }

                // For level-based upgrades, check if max level reached
                const currentLevel = currentRun.upgrades.filter(id => id === upgrade.id).length;
                return currentLevel < upgrade.maxLevel;
            });

            // If no eligible upgrades, return empty array (should never happen with proper design)
            if (eligibleUpgrades.length === 0) {
                return [];
            }

            // Shuffle and take up to 3 (or fewer if less are available)
            return [...eligibleUpgrades]
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(3, eligibleUpgrades.length));
        };

        setAvailableUpgrades(getRandomUpgrades());
    }, [currentRun.upgrades]);

    const handleSelectUpgrade = (upgradeId: string) => {
        selectUpgrade(upgradeId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-4xl w-full text-white">
                <h2 className="text-3xl font-bold text-center mb-2">
                    {currentRun.playerStats.level > 1 ? 'Level up!' : 'Wave Complete!'}
                </h2>

                <h3 className="text-2xl font-bold text-center mb-6">
                    Choose thy next powerup
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {availableUpgrades.map(upgrade => {
                        // Count how many times this upgrade has been chosen
                        const currentLevel = currentRun.upgrades.filter(id => id === upgrade.id).length;

                        return (
                            <div
                                key={upgrade.id}
                                className="bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer p-4 rounded-lg border-2 border-yellow-600"
                                onClick={() => handleSelectUpgrade(upgrade.id)}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="text-2xl mr-3">
                                        {upgrade.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold">{upgrade.name}</h4>
                                        {currentLevel > 0 && (
                                            <span className="text-yellow-400 text-sm">
                                                Level {currentLevel} / {upgrade.maxLevel}
                                            </span>
                                        )}
                                        {currentLevel === 0 && upgrade.maxLevel > 1 && (
                                            <span className="text-green-400 text-sm">
                                                New!
                                            </span>
                                        )}
                                        {upgrade.maxLevel === 1 && (
                                            <span className="text-green-400 text-sm">
                                                New!
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-300 text-sm">
                                    {upgrade.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {availableUpgrades.length === 0 && (
                    <div className="text-center text-xl text-yellow-400 mb-8">
                        No more upgrades available! Generating random stats boost...
                    </div>
                )}

                <div className="text-center text-sm text-gray-400 mt-4">
                    At times the game seemeth over, but it is not. Canst thou find out why?
                </div>
            </div>
        </div>
    );
}