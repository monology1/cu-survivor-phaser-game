import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for game state
interface PlayerStats {
    health: number;
    maxHealth: number;
    damage: number;
    speed: number;
    attackSpeed: number;
    critChance: number;
    range: number;
}

interface GameState {
    gameInstance: Phaser.Game | null;
    playerClass: string;
    highScores: Array<{
        playerClass: string;
        score: number;
        wave: number;
        date: string;
    }>;
    unlocked: {
        characters: string[];
        weapons: string[];
    };
    settings: {
        soundVolume: number;
        musicVolume: number;
        fullscreen: boolean;
    };
    currentRun: {
        score: number;
        wave: number;
        playerHealth: number;
        maxHealth: number;
        upgrades: string[];
        weapons: string[];
        kills: number;
        elapsedTime: number;
    };
    ui: {
        showMenu: boolean;
        showUpgrades: boolean;
        showGameOver: boolean;
        paused: boolean;
    };

    // Actions
    setGameInstance: (instance: Phaser.Game | null) => void;
    startGame: (playerClass: string) => void;
    updateRunState: (newState: Partial<GameState['currentRun']>) => void;
    completeWave: () => void;
    selectUpgrade: (upgrade: string) => void;
    gameOver: (finalScore: number) => void;
    returnToMenu: () => void;
    updateSettings: (newSettings: Partial<GameState['settings']>) => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Game state
            gameInstance: null,
            playerClass: 'warrior',
            highScores: [],
            unlocked: {
                characters: ['warrior'],
                weapons: ['BASIC']
            },
            settings: {
                soundVolume: 0.7,
                musicVolume: 0.5,
                fullscreen: false
            },

            // Session state
            currentRun: {
                score: 0,
                wave: 1,
                playerHealth: 100,
                maxHealth: 100,
                upgrades: [],
                weapons: ['BASIC'],
                kills: 0,
                elapsedTime: 0
            },

            // UI state
            ui: {
                showMenu: true,
                showUpgrades: false,
                showGameOver: false,
                paused: false
            },

            // Actions
            setGameInstance: (instance) => set({ gameInstance: instance }),

            startGame: (playerClass) => set({
                playerClass,
                currentRun: {
                    score: 0,
                    wave: 1,
                    playerHealth: 100,
                    maxHealth: 100,
                    upgrades: [],
                    weapons: ['BASIC'],
                    kills: 0,
                    elapsedTime: 0
                },
                ui: {
                    showMenu: false,
                    showUpgrades: false,
                    showGameOver: false,
                    paused: false
                }
            }),

            updateRunState: (newState) => set((state) => ({
                currentRun: {
                    ...state.currentRun,
                    ...newState
                }
            })),

            completeWave: () => {
                const { gameInstance } = get();

                set((state) => ({
                    currentRun: {
                        ...state.currentRun,
                        wave: state.currentRun.wave + 1
                    },
                    ui: {
                        ...state.ui,
                        showUpgrades: true,
                        paused: true
                    }
                }));

                // Pause the game scene
                if (gameInstance) {
                    const gameScene = gameInstance.scene.getScene('GameScene');
                    if (gameScene) {
                        gameScene.scene.pause();
                    }
                }
            },

            selectUpgrade: (upgrade) => {
                const { gameInstance } = get();

                set((state) => ({
                    currentRun: {
                        ...state.currentRun,
                        upgrades: [...state.currentRun.upgrades, upgrade]
                    },
                    ui: {
                        ...state.ui,
                        showUpgrades: false,
                        paused: false
                    }
                }));

                // Resume game scene and apply upgrade
                if (gameInstance) {
                    const gameScene = gameInstance.scene.getScene('GameScene') as any;
                    if (gameScene) {
                        gameScene.scene.resume();
                        if (gameScene.upgradeSystem?.applyUpgrade) {
                            gameScene.upgradeSystem.applyUpgrade(upgrade);
                        }
                    }
                }
            },

            gameOver: (finalScore) => {
                set((state) => {
                    // Add score to high scores
                    const newHighScores = [...state.highScores, {
                        playerClass: state.playerClass,
                        score: finalScore,
                        wave: state.currentRun.wave,
                        date: new Date().toISOString()
                    }].sort((a, b) => b.score - a.score).slice(0, 10);

                    return {
                        highScores: newHighScores,
                        ui: {
                            ...state.ui,
                            showGameOver: true,
                            paused: true
                        }
                    };
                });
            },

            returnToMenu: () => set({
                ui: {
                    showMenu: true,
                    showUpgrades: false,
                    showGameOver: false,
                    paused: false
                }
            }),

            updateSettings: (newSettings) => set((state) => ({
                settings: {
                    ...state.settings,
                    ...newSettings
                }
            }))
        }),
        {
            name: 'vampire-brotato-storage',
            partialize: (state) => ({
                highScores: state.highScores,
                unlocked: state.unlocked,
                settings: state.settings
            })
        }
    )
);