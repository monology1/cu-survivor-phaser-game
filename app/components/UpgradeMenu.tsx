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
            // Filter out maxed out upgrades
            const eligibleUpgrades = UPGRADE_TYPES.filter(upgrade => {
                const currentLevel = currentRun.upgrades.filter(id => id === upgrade.id).length;
                return currentLevel < upgrade.maxLevel;
            });

            // Shuffle and take 3
            return [...eligibleUpgrades]
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
        };

        setAvailableUpgrades(getRandomUpgrades());
    }, [currentRun.upgrades]);

    const handleSelectUpgrade = (upgradeId: string) => {
        selectUpgrade(upgradeId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-4xl w-full">
                <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Wave {currentRun.wave - 1} Complete!
                </h2>
                <p className="text-xl text-gray-300 text-center mb-8">
                    Choose an upgrade to continue
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availableUpgrades.map(upgrade => (
                        <div
                            key={upgrade.id}
                            className="bg-gray-700 p-6 rounded-lg cursor-pointer hover:bg-gray-600 transition duration-200 flex flex-col items-center"
                            onClick={() => handleSelectUpgrade(upgrade.id)}
                        >
                            <div className="text-5xl mb-4">{upgrade.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{upgrade.name}</h3>
                            <p className="text-gray-300 text-center">{upgrade.description}</p>

                            {/* Show current level if any */}
                            {currentRun.upgrades.filter(id => id === upgrade.id).length > 0 && (
                                <div className="mt-4 text-sm font-bold text-yellow-400">
                                    Current Level: {currentRun.upgrades.filter(id => id === upgrade.id).length}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}