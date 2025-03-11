'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function MainMenu() {
    const { startGame, highScores } = useGameStore();
    const [selectedClass, setSelectedClass] = useState('warrior');

    const handleStartGame = () => {
        startGame(selectedClass);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-5xl font-bold mb-10">Vampire Brotato</h1>

            <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-4">Select Character</h2>

                <div className="mb-6">
                    <div
                        className={`p-4 border rounded-lg mb-2 cursor-pointer ${selectedClass === 'warrior' ? 'border-blue-500 bg-blue-900' : 'border-gray-700 bg-gray-700'}`}
                        onClick={() => setSelectedClass('warrior')}
                    >
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-3xl">
                                ⚔️
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold">Warrior</h3>
                                <p className="text-gray-300">Balanced fighter with strong melee attacks</p>
                            </div>
                        </div>
                    </div>

                    {/* More character options would go here */}
                </div>

                <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                    onClick={handleStartGame}
                >
                    Start Game
                </button>
            </div>

            <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">High Scores</h2>

                {highScores.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-700">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Rank</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Class</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Score</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Wave</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                            {highScores.slice(0, 5).map((score, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{index + 1}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{score.playerClass}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{score.score}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{score.wave}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-4">No scores yet. Start playing!</p>
                )}
            </div>
        </div>
    );
}