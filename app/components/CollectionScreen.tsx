'use client';

import { useGameStore } from '@/store/gameStore';

export default function CollectionScreen() {
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

                    <h2 className="text-2xl font-bold text-center">Collection</h2>

                    <div className="w-20"></div> {/* Spacer to center the title */}
                </div>

                <div className="flex flex-col gap-6 h-[400px] overflow-y-auto p-2">
                    <div>
                        <h3 className="text-xl font-bold mb-2 border-b border-gray-700 pb-2">Weapons</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {[...Array(10)].map((_, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded bg-gray-700 border border-gray-600 flex flex-col items-center"
                                >
                                    <div className="w-12 h-12 bg-gray-600 rounded-full mb-2"></div>
                                    <span className="text-sm">Weapon #{index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-2 border-b border-gray-700 pb-2">Items</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {[...Array(10)].map((_, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded bg-gray-700 border border-gray-600 flex flex-col items-center"
                                >
                                    <div className="w-12 h-12 bg-gray-600 rounded-full mb-2"></div>
                                    <span className="text-sm">Item #{index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-2 border-b border-gray-700 pb-2">Enemies</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {[...Array(10)].map((_, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded bg-gray-700 border border-gray-600 flex flex-col items-center"
                                >
                                    <div className="w-12 h-12 bg-gray-600 rounded-full mb-2"></div>
                                    <span className="text-sm">Enemy #{index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}