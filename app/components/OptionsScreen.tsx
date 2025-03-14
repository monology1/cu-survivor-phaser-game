'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function OptionsScreen() {
    const { returnToMainMenu, settings, updateSettings } = useGameStore();

    // Local state for sliders and options
    const [soundVolume, setSoundVolume] = useState(settings.soundVolume * 100);
    const [musicVolume, setMusicVolume] = useState(settings.musicVolume * 100);

    // Handle sound volume change
    const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setSoundVolume(value);
        updateSettings({ soundVolume: value / 100 });
    };

    // Handle music volume change
    const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setMusicVolume(value);
        updateSettings({ musicVolume: value / 100 });
    };

    // Handle checkbox changes
    const handleCheckboxChange = (setting: keyof typeof settings) => {
        updateSettings({ [setting]: !settings[setting] });
    };

    // Handle language change
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSettings({ language: e.target.value });
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

                    <h2 className="text-2xl font-bold text-center">Options</h2>

                    <div className="w-20"></div> {/* Spacer to center the title */}
                </div>

                <div className="grid grid-cols-1 gap-6 p-4">
                    {/* Language selector */}
                    <div className="flex justify-between items-center">
                        <span className="text-lg">Language</span>
                        <div className="w-64">
                            <select
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                                value={settings.language}
                                onChange={handleLanguageChange}
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Japanese">Japanese</option>
                            </select>
                        </div>
                    </div>

                    {/* Sound volume slider */}
                    <div className="flex justify-between items-center">
                        <span className="text-lg">Sound</span>
                        <div className="w-64">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={soundVolume}
                                onChange={handleSoundVolumeChange}
                                className="w-full accent-blue-500"
                            />
                        </div>
                    </div>

                    {/* Music volume slider */}
                    <div className="flex justify-between items-center">
                        <span className="text-lg">Music</span>
                        <div className="w-64">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={musicVolume}
                                onChange={handleMusicVolumeChange}
                                className="w-full accent-blue-500"
                            />
                        </div>
                    </div>

                    {/* Checkboxes for various settings */}
                    <div className="flex justify-between items-center">
                        <span className="text-lg">Visible controls</span>
                        <div className="w-8 h-8">
                            <input
                                type="checkbox"
                                checked={settings.visibleControls}
                                onChange={() => handleCheckboxChange('visibleControls')}
                                className="w-6 h-6 accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg">Show damage numbers</span>
                        <div className="w-8 h-8">
                            <input
                                type="checkbox"
                                checked={settings.showDamageNumbers}
                                onChange={() => handleCheckboxChange('showDamageNumbers')}
                                className="w-6 h-6 accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg">Auto attack</span>
                        <div className="w-8 h-8">
                            <input
                                type="checkbox"
                                checked={settings.autoAttack}
                                onChange={() => handleCheckboxChange('autoAttack')}
                                className="w-6 h-6 accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg">Auto face closest enemy</span>
                        <div className="w-8 h-8">
                            <input
                                type="checkbox"
                                checked={settings.autoFaceClosestEnemy}
                                onChange={() => handleCheckboxChange('autoFaceClosestEnemy')}
                                className="w-6 h-6 accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg">Full screen</span>
                        <div className="w-8 h-8">
                            <input
                                type="checkbox"
                                checked={settings.fullscreen}
                                onChange={() => handleCheckboxChange('fullscreen')}
                                className="w-6 h-6 accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg">Cinema mode</span>
                        <div className="w-8 h-8">
                            <input
                                type="checkbox"
                                checked={settings.cinemaMode}
                                onChange={() => handleCheckboxChange('cinemaMode')}
                                className="w-6 h-6 accent-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Discord link at bottom */}
                <div className="mt-4 border-t border-gray-600 pt-4 flex justify-center">
                    <button className="flex items-center bg-indigo-700 hover:bg-indigo-800 transition-colors px-4 py-2 rounded">
                        <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="white">
                            <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                        </svg>
                        Discord
                    </button>
                </div>
            </div>
        </div>
    );
}