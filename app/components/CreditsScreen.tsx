'use client';

import { useGameStore } from '@/store/gameStore';

export default function CreditsScreen() {
    const { returnToMainMenu } = useGameStore();

    return (
        <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-40 bg-gray-900">
            <div className="bg-gray-800 p-6 rounded-lg max-w-5xl w-full h-[500px] text-white">
                <div className="flex justify-between items-center mb-4">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-1 rounded"
                        onClick={returnToMainMenu}
                    >
                        Back
                    </button>

                    <h2 className="text-2xl font-bold text-center">Credits</h2>

                    <div className="w-20"></div> {/* Spacer to center the title */}
                </div>

                <div className="h-[400px] overflow-y-auto p-4 text-center">
                    <h3 className="text-2xl font-bold mb-6">Arena Survivors</h3>
                    <h4 className="text-xl font-bold mb-4">Embedded Programming Project</h4>

                    <div className="mb-8">
                        <h5 className="text-lg font-bold mb-2">Development</h5>
                        <p>Your Name</p>
                    </div>

                    <div className="mb-8">
                        <h5 className="text-lg font-bold mb-2">Game Engine</h5>
                        <p>Phaser 3</p>
                    </div>

                    <div className="mb-8">
                        <h5 className="text-lg font-bold mb-2">Framework</h5>
                        <p>Next.js</p>
                        <p>Zustand</p>
                        <p>TailwindCSS</p>
                    </div>

                    <div className="mb-8">
                        <h5 className="text-lg font-bold mb-2">Inspiration</h5>
                        <p>Vampire Survivors</p>
                        <p>Brotato</p>
                        <p>Arena Survivors</p>
                    </div>

                    <div className="mb-8">
                        <h5 className="text-lg font-bold mb-2">Special Thanks</h5>
                        <p>Your Professor</p>
                        <p>Your Classmates</p>
                    </div>

                    <p className="text-sm text-gray-400 mt-8">
                        © 2025 - Embedded Programming Project
                    </p>
                </div>
            </div>
        </div>
    );
}