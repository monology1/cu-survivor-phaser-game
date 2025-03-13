import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHARACTER_TYPES } from '@/game/config';

// Define types for game state
export interface PlayerStats {
    health: number;
    maxHealth: number;
    recovery: number;
    evasion: number;
    armor: number;
    power: number;
    critical: number;
    speed: number;
    projectiles: number;
    level: number;
    experience: number;
    experienceToNextLevel: number;
}

export interface WeaponInstance {
    type: string;
    level: number;
}

export interface GameState {
    gameInstance: Phaser.Game | null;
    selectedCharacter: string;
    highScores: Array<{
        character: string;
        score: number;
        wave: number;
        date: string;
        timeElapsed: number;
    }>;
    unlocked: {
        characters: string[];
        weapons: string[];
        powerups: string[];
    };
    coins: number;
    powerups: Record<string, number>; // id -> level
    settings: {
        soundVolume: number;
        musicVolume: number;
        fullscreen: boolean;
        showDamageNumbers: boolean;
        autoAttack: boolean;
        visibleControls: boolean;
        autoFaceClosestEnemy: boolean;
        cinemaMode: boolean;
        language: string;
    };
    currentRun: {
        score: number;
        wave: number;
        playerStats: PlayerStats;
        weapons: WeaponInstance[];
        upgrades: string[];
        kills: number;
        timeElapsed: number;
        timeStarted: number;
        coinsCollected: number;
    };
    ui: {
        showMainMenu: boolean;
        showCharacterSelect: boolean;
        showPowerups: boolean;
        showOptions: boolean;
        showAchievements: boolean;
        showCollection: boolean;
        showCredits: boolean;
        showUpgrades: boolean;
        showGameOver: boolean;
        paused: boolean;
    };

    // Actions
    setGameInstance: (instance: Phaser.Game | null) => void;
    selectCharacter: (characterId: string) => void;
    startGame: () => void;
    updatePlayerStats: (stats: Partial<PlayerStats>) => void;
    updateRunState: (newState: Partial<GameState['currentRun']>) => void;
    completeWave: () => void;
    selectUpgrade: (upgradeId: string) => void;
    addWeapon: (weaponType: string) => void;
    upgradeWeapon: (index: number) => void;
    gainExperience: (amount: number) => void;
    collectCoin: (amount: number) => void;
    gameOver: () => void;
    returnToMainMenu: () => void;
    purchasePowerup: (powerupId: string) => boolean;
    updateSettings: (newSettings: Partial<GameState['settings']>) => void;
    showScreen: (screen: keyof GameState['ui']) => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Game state
            gameInstance: null,
            selectedCharacter: 'bill',
            highScores: [],
            unlocked: {
                characters: ['bill'],
                weapons: ['BASIC'],
                powerups: ['power', 'gemstone', 'aketon']
            },
            coins: 0,
            powerups: {
                power: 0,
                gemstone: 0,
                aketon: 0
            },
            settings: {
                soundVolume: 0.7,
                musicVolume: 0.5,
                fullscreen: false,
                showDamageNumbers: true,
                autoAttack: true,
                visibleControls: true,
                autoFaceClosestEnemy: true,
                cinemaMode: false,
                language: 'English'
            },

            // Session state
            currentRun: {
                score: 0,
                wave: 1,
                playerStats: {
                    health: 100,
                    maxHealth: 100,
                    recovery: 0,
                    evasion: 0,
                    armor: 0,
                    power: 100,
                    critical: 0,
                    speed: 100,
                    projectiles: 1,
                    level: 1,
                    experience: 0,
                    experienceToNextLevel: 100
                },
                weapons: [{ type: 'BASIC', level: 1 }],
                upgrades: [],
                kills: 0,
                timeElapsed: 0,
                timeStarted: 0,
                coinsCollected: 0
            },

            // UI state
            ui: {
                showMainMenu: true,
                showCharacterSelect: false,
                showPowerups: false,
                showOptions: false,
                showAchievements: false,
                showCollection: false,
                showCredits: false,
                showUpgrades: false,
                showGameOver: false,
                paused: false
            },

            // Actions
            setGameInstance: (instance) => set({ gameInstance: instance }),

            selectCharacter: (characterId) => set({ selectedCharacter: characterId }),

            startGame: () => {
                const state = get();
                const characterConfig = CHARACTER_TYPES[state.selectedCharacter.toUpperCase()] || CHARACTER_TYPES.BILL;

                set({
                    currentRun: {
                        score: 0,
                        wave: 1,
                        playerStats: {
                            health: characterConfig.baseStats.health,
                            maxHealth: characterConfig.baseStats.health,
                            recovery: characterConfig.baseStats.recovery || 0,
                            evasion: characterConfig.baseStats.evasion || 0,
                            armor: characterConfig.baseStats.armor || 0,
                            power: characterConfig.baseStats.power || 100,
                            critical: characterConfig.baseStats.critical || 0,
                            speed: characterConfig.baseStats.speed || 100,
                            projectiles: characterConfig.baseStats.projectiles || 1,
                            level: 1,
                            experience: 0,
                            experienceToNextLevel: 100
                        },
                        weapons: [{ type: characterConfig.startingWeapon, level: 1 }],
                        upgrades: [],
                        kills: 0,
                        timeElapsed: 0,
                        timeStarted: Date.now(),
                        coinsCollected: 0
                    },
                    ui: {
                        // Set ALL UI flags to false
                        showMainMenu: false,
                        showCharacterSelect: false,
                        showPowerups: false,
                        showOptions: false,
                        showAchievements: false,
                        showCollection: false,
                        showCredits: false,
                        showUpgrades: false,
                        showGameOver: false,
                        paused: false
                    }
                });
            },

            updatePlayerStats: (stats) => set((state) => ({
                currentRun: {
                    ...state.currentRun,
                    playerStats: {
                        ...state.currentRun.playerStats,
                        ...stats
                    }
                }
            })),

            updateRunState: (newState) => set((state) => ({
                currentRun: {
                    ...state.currentRun,
                    ...newState
                }
            })),

            completeWave: () => {
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
                const { gameInstance } = get();
                if (gameInstance) {
                    const gameScene = gameInstance.scene.getScene('GameScene');
                    if (gameScene) {
                        gameScene.scene.pause();
                    }
                }
            },

            selectUpgrade: (upgradeId) => {
                set((state) => ({
                    currentRun: {
                        ...state.currentRun,
                        upgrades: [...state.currentRun.upgrades, upgradeId]
                    },
                    ui: {
                        ...state.ui,
                        showUpgrades: false,
                        paused: false
                    }
                }));

                // Resume game scene and apply upgrade
                const { gameInstance } = get();
                if (gameInstance) {
                    const gameScene = gameInstance.scene.getScene('GameScene') as any;
                    if (gameScene) {
                        gameScene.scene.resume();
                        if (gameScene.upgradeSystem?.applyUpgrade) {
                            gameScene.upgradeSystem.applyUpgrade(upgradeId);
                        }
                    }
                }
            },

            addWeapon: (weaponType) => set((state) => ({
                currentRun: {
                    ...state.currentRun,
                    weapons: [...state.currentRun.weapons, { type: weaponType, level: 1 }]
                }
            })),

            upgradeWeapon: (index) => set((state) => {
                const weapons = [...state.currentRun.weapons];
                if (weapons[index]) {
                    weapons[index] = {
                        ...weapons[index],
                        level: weapons[index].level + 1
                    };
                }
                return {
                    currentRun: {
                        ...state.currentRun,
                        weapons
                    }
                };
            }),

            gainExperience: (amount) => set((state) => {
                const currentExp = state.currentRun.playerStats.experience + amount;
                const expToNextLevel = state.currentRun.playerStats.experienceToNextLevel;

                // Check if leveled up
                if (currentExp >= expToNextLevel) {
                    // Level up!
                    const remainder = currentExp - expToNextLevel;
                    const newLevel = state.currentRun.playerStats.level + 1;
                    const newExpToNextLevel = Math.floor(expToNextLevel * 1.2); // 20% more exp required per level

                    return {
                        currentRun: {
                            ...state.currentRun,
                            playerStats: {
                                ...state.currentRun.playerStats,
                                level: newLevel,
                                experience: remainder,
                                experienceToNextLevel: newExpToNextLevel
                            }
                        },
                        ui: {
                            ...state.ui,
                            showUpgrades: true,
                            paused: true
                        }
                    };
                }

                // Just update experience
                return {
                    currentRun: {
                        ...state.currentRun,
                        playerStats: {
                            ...state.currentRun.playerStats,
                            experience: currentExp
                        }
                    }
                };
            }),

            collectCoin: (amount) => set((state) => {
                // Apply gemstone powerup multiplier if any
                const gemstoneLevel = state.powerups.gemstone || 0;
                const multiplier = 1 + (gemstoneLevel * 0.1); // 10% more coins per level
                const adjustedAmount = Math.floor(amount * multiplier);

                return {
                    coins: state.coins + adjustedAmount,
                    currentRun: {
                        ...state.currentRun,
                        coinsCollected: state.currentRun.coinsCollected + adjustedAmount
                    }
                };
            }),

            gameOver: () => set((state) => {
                const now = Date.now();
                const timeElapsed = Math.floor((now - state.currentRun.timeStarted) / 1000);

                // Add score to high scores
                const newHighScores = [...state.highScores, {
                    character: state.selectedCharacter,
                    score: state.currentRun.score,
                    wave: state.currentRun.wave,
                    date: new Date().toISOString(),
                    timeElapsed
                }].sort((a, b) => b.score - a.score).slice(0, 10);

                return {
                    highScores: newHighScores,
                    ui: {
                        ...state.ui,
                        showGameOver: true,
                        paused: true
                    },
                    currentRun: {
                        ...state.currentRun,
                        timeElapsed
                    }
                };
            }),

            returnToMainMenu: () => set((state): any => ({
                ui: {
                    ...Object.fromEntries(
                        Object.keys(state.ui).map(key => [key, false])
                    ),
                    showMainMenu: true,
                }
            })),

            purchasePowerup: (powerupId) => {
                const state = get();
                const currentLevel = state.powerups[powerupId] || 0;
                const nextLevel = currentLevel + 1;

                // Calculate cost (example formula)
                const baseCost = 50 + (powerupId.length * 5); // Just an example
                const cost = Math.floor(baseCost * Math.pow(1.5, currentLevel));

                if (state.coins >= cost) {
                    set((state) => ({
                        coins: state.coins - cost,
                        powerups: {
                            ...state.powerups,
                            [powerupId]: nextLevel
                        }
                    }));
                    return true;
                }
                return false;
            },

            updateSettings: (newSettings) => set((state) => ({
                settings: {
                    ...state.settings,
                    ...newSettings
                }
            })),

            showScreen: (screen) => set((state) => {
                // Create a new UI state with everything set to false
                const newUiState = Object.fromEntries(
                    Object.keys(state.ui).map(key => [key, false])
                ) as any;

                // Set only the requested screen to true
                newUiState[screen] = true;

                return {
                    ui: newUiState
                };
            })
        }),
        {
            name: 'arena-survivors-storage',
            partialize: (state) => ({
                highScores: state.highScores,
                unlocked: state.unlocked,
                coins: state.coins,
                powerups: state.powerups,
                settings: state.settings
            })
        }
    )
);