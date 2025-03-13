'use client';
import { useGameStore } from '@/store/gameStore';
import CharacterSelect from './CharacterSelect';
import PowerupsScreen from './PowerupsScreen';
import OptionsScreen from './OptionsScreen';
import AchievementsScreen from './AchievementsScreen';
import CollectionScreen from './CollectionScreen';
import CreditsScreen from './CreditsScreen';

export default function MainMenu() {
    const { ui, showScreen, coins } = useGameStore();

    // Helper function to render the correct screen
    const renderSubScreen = () => {
        if (ui.showCharacterSelect) return <CharacterSelect />;
        if (ui.showPowerups) return <PowerupsScreen />;
        if (ui.showOptions) return <OptionsScreen />;
        if (ui.showAchievements) return <AchievementsScreen />;
        if (ui.showCollection) return <CollectionScreen />;
        if (ui.showCredits) return <CreditsScreen />;

        // Default main menu screen
        return (
            <div className="relative flex flex-col items-center">
                <div className="absolute top-0 right-4 flex items-center">
                    <img src="/assets/items/coin_01.png" alt="Coins" className="w-8 h-8 mr-2" />
                    <span className="text-yellow-400 text-xl">{coins}</span>
                </div>

                {/*<h1 className="text-6xl font-bold mb-16 text-center text-yellow-500 drop-shadow-lg">*/}
                {/*    CU<br/>SURVIVORS*/}
                {/*</h1>*/}

                <div className="flex flex-col gap-3 w-64">
                    <button
                        className="bg-green-600 hover:bg-green-700 transition-colors text-white text-xl font-bold py-2 px-4 rounded"
                        onClick={() => showScreen('showCharacterSelect')}
                    >
                        Play
                    </button>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-xl font-bold py-2 px-4 rounded"
                        onClick={() => showScreen('showOptions')}
                    >
                        Options
                    </button>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-xl font-bold py-2 px-4 rounded"
                        onClick={() => showScreen('showPowerups')}
                    >
                        Powerups
                    </button>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-xl font-bold py-2 px-4 rounded"
                        onClick={() => showScreen('showAchievements')}
                    >
                        Achievements
                    </button>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-xl font-bold py-2 px-4 rounded"
                        onClick={() => showScreen('showCollection')}
                    >
                        Collection
                    </button>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-xl font-bold py-2 px-4 rounded"
                        onClick={() => showScreen('showCredits')}
                    >
                        Credits
                    </button>

                    {/*<button*/}
                    {/*    className="bg-yellow-600 hover:bg-yellow-700 transition-colors text-white text-xl font-bold py-2 px-4 rounded mt-4"*/}
                    {/*>*/}
                    {/*    Get full game*/}
                    {/*</button>*/}
                </div>

                <div className="mt-8 text-gray-400 text-sm">
                    v0.1.0 - Embedded Programming Project
                </div>
            </div>
        );
    };

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/assets/ui/main-menu-background.png)' }}
        >
            <div className="max-w-5xl w-full h-[600px] flex items-center justify-center p-4">
                {renderSubScreen()}
            </div>
        </div>
    );
}