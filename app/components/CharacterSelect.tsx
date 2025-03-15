'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { CHARACTER_TYPES } from '@/game/config';

export default function CharacterSelect() {
    const { selectCharacter, startGame, returnToMainMenu, unlocked } = useGameStore();
    const [selectedChar, setSelectedChar] = useState('bill');

    const handleSelectCharacter = (charId: string) => {
        console.log(charId);
        setSelectedChar(charId);
    };

    const handleStartGame = () => {
        // First select the character
        selectCharacter(selectedChar);

        // Then start the game (which will clear all UI flags)
        startGame();

        // Get the game instance
        const gameInstance = useGameStore.getState().gameInstance;
        if (gameInstance) {
            // Start the GameScene directly
            if (gameInstance.scene.getScene('GameScene')) {
                // If scene exists and is not active, start it
                if (!gameInstance.scene.isActive('GameScene')) {
                    gameInstance.scene.start('GameScene');
                }
            }

            // We may optionally need to resume it if it's paused
            gameInstance.scene.resume('GameScene');

            console.log('Starting GameScene directly from character select');
        }
    };

    // Get the character config for the currently selected character
    const selectedCharConfig = CHARACTER_TYPES[selectedChar.toUpperCase()];

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

                    <h2 className="text-2xl font-bold text-center">Character</h2>

                    <div className="w-20"></div> {/* Spacer to center the title */}
                </div>

                <div className="flex min-h-[400px]">
                    {/* Left side - Stats */}
                    <div className="w-1/3 bg-gray-900 rounded-l p-4">
                        <h3 className="text-gray-500 mb-2">[Core]</h3>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="flex items-center">
                                <span className="text-red-500 mr-2">❤ Health</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.health}</div>

                            <div className="flex items-center">
                                <span className="text-green-500 mr-2">♻ Recovery</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.recovery || '-'}</div>

                            <div className="flex items-center">
                                <span className="text-blue-300 mr-2">↯ Evasion</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.evasion || '-'}</div>

                            <div className="flex items-center">
                                <span className="text-blue-500 mr-2">🛡 Armour</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.armor || '0'}</div>
                        </div>

                        <h3 className="text-gray-500 mb-2">[Attack]</h3>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="flex items-center">
                                <span className="text-yellow-500 mr-2">⚡ Power</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.power}%</div>

                            <div className="flex items-center">
                                <span className="text-red-400 mr-2">✧ Critical</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.critical}%</div>

                            <div className="flex items-center">
                                <span className="text-green-400 mr-2">⇨ Speed</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.speed}%</div>

                            <div className="flex items-center">
                                <span className="text-yellow-400 mr-2">✺ Projectiles</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.projectiles}</div>
                        </div>

                        <h3 className="text-gray-500 mb-2">[Timing]</h3>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="flex items-center">
                                <span className="text-blue-400 mr-2">➠ Movement</span>
                            </div>
                            <div>{selectedCharConfig?.baseStats.speed}%</div>

                            <div className="flex items-center">
                                <span className="text-purple-400 mr-2">⟳ Cooldown</span>
                            </div>
                            <div>-</div>

                            <div className="flex items-center">
                                <span className="text-red-300 mr-2">⌛ Duration</span>
                            </div>
                            <div>-</div>

                            <div className="flex items-center">
                                <span className="text-green-300 mr-2">◎ Area</span>
                            </div>
                            <div>-</div>
                        </div>
                    </div>

                    {/* Right side - Character grid */}
                    <div className="w-2/3 bg-gray-700 rounded-r p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.values(CHARACTER_TYPES).map((character) => {
                                const isUnlocked = unlocked.characters.includes(character.id);
                                const isSelected = selectedChar === character.id;

                                return (
                                    <div
                                        key={character.id}
                                        className={`
                                            p-2 rounded cursor-pointer transition-all
                                            ${isSelected ? 'border-2 border-yellow-500' : 'border-2 border-gray-600'}
                                            ${isUnlocked ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 opacity-60 cursor-not-allowed'}
                                        `}
                                        onClick={() => isUnlocked && handleSelectCharacter(character.id)}
                                    >
                                        <div className="aspect-square flex items-center justify-center mb-2">
                                            <div className="relative w-16 h-16">
                                                <img
                                                    src={`/assets/players/${character.id}.png`}
                                                    alt={character.name}
                                                    className="w-full h-full object-contain"
                                                />
                                                {!isUnlocked && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                                        <span className="text-2xl">🔒</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-center text-sm font-medium">
                                            {character.name}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 border-t border-gray-600 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center">
                                    <img
                                        src={`/assets/players/${selectedChar}.png`}
                                        alt={selectedCharConfig?.name}
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold">{selectedCharConfig?.name}</h3>
                                    <p className="text-sm text-gray-300">{selectedCharConfig?.description}</p>
                                </div>
                                <button
                                    className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-2 rounded font-bold"
                                    onClick={handleStartGame}
                                >
                                    Pick
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}