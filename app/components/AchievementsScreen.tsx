'use client';

import { useGameStore } from '@/store/gameStore';

export default function AchievementsScreen() {
    const { returnToMainMenu } = useGameStore();

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

                    <h2 className="text-2xl font-bold text-center">Achievements</h2>

                    <div className="w-20"></div> {/* Spacer to center the title */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px] overflow-y-auto p-2">
                    {/* Placeholder achievements */}
                    {[...Array(12)].map((_, index) => (
                        <div
                            key={index}
                            className="p-4 rounded bg-gray-700 border border-gray-600"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                                    {index % 2 === 0 ? '🔒' : '✅'}
                                </div>
                                <div>
                                    <h3 className="font-medium">Achievement #{index + 1}</h3>
                                    <p className="text-sm text-gray-400">Description here</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}