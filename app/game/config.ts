export const GAME_CONFIG = {
    width: 800,
    height: 600,
    backgroundColor: '#2d1b43', // Purple-ish background matching Arena Survivors
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: process.env.NODE_ENV === 'development'
        }
    }
};

// Character types and configurations
export interface CharacterConfig {
    id: string;
    name: string;
    sprite: string;
    description: string;
    baseStats: {
        health: number;
        recovery: number;
        evasion: number;
        armor: number;
        power: number;
        critical: number;
        speed: number;
        projectiles: number;
    };
    startingWeapon: string;
    unlockCondition?: string;
}

export const CHARACTER_TYPES: Record<string, CharacterConfig> = {
    BILL: {
        id: 'bill',
        name: 'Bill',
        sprite: 'bill',
        description: 'A pair of 50-caliber Colts. Increases critical damage by up to 75%.',
        baseStats: {
            health: 80,
            recovery: 2,
            evasion: 5,
            armor: 0,
            power: 200,
            critical: 20,
            speed: 165,
            projectiles: 2
        },
        startingWeapon: 'BASIC'
    },
    NITROS: {
        id: 'nitros',
        name: 'Nitros',
        sprite: 'character-nitros',
        description: 'Cybernetic augmentations provide enhanced combat capabilities.',
        baseStats: {
            health: 90,
            recovery: 1,
            evasion: 3,
            armor: 5,
            power: 180,
            critical: 15,
            speed: 90,
            projectiles: 1
        },
        startingWeapon: 'SHOTGUN',
        unlockCondition: 'Reach wave 5'
    },
    ERYN: {
        id: 'eryn',
        name: 'Eryn',
        sprite: 'character-eryn',
        description: 'Master archer with enhanced range and precision.',
        baseStats: {
            health: 70,
            recovery: 2,
            evasion: 8,
            armor: 0,
            power: 170,
            critical: 25,
            speed: 95,
            projectiles: 2
        },
        startingWeapon: 'BASIC',
        unlockCondition: 'Defeat 500 enemies'
    },
    JOAN: {
        id: 'joan',
        name: 'Joan',
        sprite: 'character-joan',
        description: 'Agile fighter specializing in rapid attacks.',
        baseStats: {
            health: 75,
            recovery: 3,
            evasion: 10,
            armor: 0,
            power: 160,
            critical: 20,
            speed: 100,
            projectiles: 1
        },
        startingWeapon: 'BASIC',
        unlockCondition: 'Reach wave 8'
    },
    BATU: {
        id: 'batu',
        name: 'Batu',
        sprite: 'character-batu',
        description: 'Demonic warrior with enhanced damage capabilities.',
        baseStats: {
            health: 100,
            recovery: 1,
            evasion: 2,
            armor: 8,
            power: 220,
            critical: 10,
            speed: 80,
            projectiles: 1
        },
        startingWeapon: 'ORBIT',
        unlockCondition: 'Reach wave 15'
    },
    ASTERIA: {
        id: 'asteria',
        name: 'Asteria',
        sprite: 'character-asteria',
        description: 'Dark hunter with powerful ranged abilities.',
        baseStats: {
            health: 85,
            recovery: 2,
            evasion: 6,
            armor: 4,
            power: 190,
            critical: 15,
            speed: 85,
            projectiles: 2
        },
        startingWeapon: 'SHOTGUN',
        unlockCondition: 'Defeat 1000 enemies'
    },
    NESTOR: {
        id: 'nestor',
        name: 'Nestor',
        sprite: 'character-nestor',
        description: 'Ancient guardian with exceptional defensive capabilities.',
        baseStats: {
            health: 120,
            recovery: 3,
            evasion: 0,
            armor: 10,
            power: 150,
            critical: 5,
            speed: 75,
            projectiles: 1
        },
        startingWeapon: 'BASIC',
        unlockCondition: 'Survive for 20 minutes'
    },
    MEDUSA: {
        id: 'medusa',
        name: 'Medusa',
        sprite: 'character-medusa',
        description: 'Mythical creature with petrifying gaze and powerful area attacks.',
        baseStats: {
            health: 90,
            recovery: 2,
            evasion: 7,
            armor: 3,
            power: 200,
            critical: 18,
            speed: 85,
            projectiles: 3
        },
        startingWeapon: 'ORBIT',
        unlockCondition: 'Complete 50 waves'
    }
};

// Enemy types configuration
export interface EnemyConfig {
    health: number;
    speed: number;
    damage: number;
    points: number;
    scale: number;
    tint: number;
    sprite: string;
    attackRange?: number;
    attackRate?: number;
    special?: string;
    name: string;
}

export const ENEMY_TYPES: Record<string, EnemyConfig> = {
    GHOST: {
        name: "Ghost",
        health: 50,
        speed: 100,
        damage: 10,
        points: 10,
        scale: 1,
        tint: 0x9966ff, // Purple-ish like in the screenshots
        sprite: 'enemy-ghost'
    },
    FAST: {
        name: "Specter",
        health: 30,
        speed: 180,
        damage: 8,
        points: 15,
        scale: 0.8,
        tint: 0xcc66ff, // Lighter purple
        sprite: 'enemy-fast'
    },
    TANK: {
        name: "Wraith",
        health: 120,
        speed: 60,
        damage: 15,
        points: 20,
        scale: 1.3,
        tint: 0x6633cc, // Darker purple
        sprite: 'enemy-tank'
    },
    RANGED: {
        name: "Phantom",
        health: 40,
        speed: 80,
        damage: 12,
        points: 25,
        attackRange: 200,
        attackRate: 2000,
        tint: 0xb399ff, // Pale purple
        scale: 1,
        sprite: 'enemy-ranged'
    },
    BOSS: {
        name: "Nightmare",
        health: 500,
        speed: 50,
        damage: 25,
        points: 100,
        scale: 2,
        tint: 0xff33cc, // Pink-purple
        special: "summon",
        sprite: 'enemy-boss'
    }
};

// Weapon types configuration
export interface WeaponConfig {
    name: string;
    description: string;
    damage: number;
    fireRate: number;
    range: number;
    projectileSpeed: number;
    projectileScale: number;
    sprite: string;
    projectileSprite: string;
    projectileCount?: number;
    spread?: number;
    orbitCount?: number;
    orbitSpeed?: number;
    orbitRadius?: number;
    unlockCondition?: string;
    icon: string;
}

export const WEAPON_TYPES: Record<string, WeaponConfig> = {
    BASIC: {
        name: "Basic Gun",
        description: "Standard weapon with balanced stats",
        icon: "🔫",
        damage: 10,
        fireRate: 500,
        range: 300,
        projectileSpeed: 400,
        projectileScale: 2,
        sprite: 'weapon-basic',
        projectileSprite: 'projectile-basic'
    },
    SHOTGUN: {
        name: "Shotgun",
        description: "Fires multiple projectiles in a spread",
        icon: "🔪",
        damage: 8,
        fireRate: 1200,
        range: 250,
        projectileSpeed: 450,
        projectileCount: 5,
        spread: 0.3,
        projectileScale: 0.8,
        sprite: 'weapon-shotgun',
        projectileSprite: 'projectile-shotgun',
        unlockCondition: "Reach wave 3"
    },
    ORBIT: {
        name: "Orbit Shield",
        description: "Projects orbiting projectiles that damage enemies",
        icon: "🔮",
        damage: 15,
        fireRate: 3000,
        range: 150,
        projectileSpeed: 0,
        orbitCount: 8,
        orbitSpeed: 0.05,
        orbitRadius: 100,
        projectileScale: 1.2,
        sprite: 'weapon-orbit',
        projectileSprite: 'projectile-orbit',
        unlockCondition: "Reach wave 5"
    }
};

// Upgrade types configuration
export interface UpgradeConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    sprite: string;
    maxLevel: number;
    effect: (player: any, level: number) => void;
}

export const UPGRADE_TYPES: UpgradeConfig[] = [
    {
        id: 'teleport',
        name: 'Teleport',
        description: 'Teleport nearest enemy away',
        icon: '⚡',
        sprite: 'upgrade-teleport',
        maxLevel: 1,
        effect: (player, level) => {
            // Implementation will be in the upgrade system
        }
    },
    {
        id: 'heavy_armor',
        name: 'Heavy Armour',
        description: 'Increases armour by 5',
        icon: '🛡️',
        sprite: 'upgrade-armor',
        maxLevel: 5,
        effect: (player, level) => {
            player.armor += 5;
        }
    },
    {
        id: 'tornado',
        name: 'Tornado',
        description: 'Powerful tornado pulling enemies toward it',
        icon: '🌪️',
        sprite: 'upgrade-tornado',
        maxLevel: 1,
        effect: (player, level) => {
            // Implementation will be in the upgrade system
        }
    },
    {
        id: 'speed',
        name: 'Movement Speed',
        description: '+10% Movement Speed',
        icon: '👟',
        sprite: 'upgrade-speed',
        maxLevel: 5,
        effect: (player, level) => {
            player.speed += player.baseStats.speed * 0.1;
        }
    },
    {
        id: 'damage',
        name: 'Damage',
        description: '+20% Damage',
        icon: '💥',
        sprite: 'upgrade-damage',
        maxLevel: 5,
        effect: (player, level) => {
            player.damage += player.baseStats.damage * 0.2;
        }
    }
];

// Permanent powerup configurations
export interface PowerupConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    sprite: string;
    maxLevel: number;
    baseCost: number;
    costMultiplier: number;
    effect: string;
    unlockCondition?: string;
}

export const POWERUP_TYPES: PowerupConfig[] = [
    {
        id: 'power',
        name: 'Power',
        description: 'Increases all damage sources by +5% per level (maximum +25%)',
        icon: '🔥',
        sprite: 'powerup-power',
        maxLevel: 5,
        baseCost: 50,
        costMultiplier: 1.5,
        effect: 'damage_multiplier',
        unlockCondition: 'Upgrade hero attack to level 5'
    },
    {
        id: 'gemstone',
        name: 'Gemstone',
        description: 'Increases coins found by +10% per level',
        icon: '💎',
        sprite: 'powerup-gemstone',
        maxLevel: 5,
        baseCost: 40,
        costMultiplier: 1.5,
        effect: 'coin_multiplier'
    },
    {
        id: 'aketon',
        name: 'Aketon',
        description: 'Increases max health by +5% per level',
        icon: '🧥',
        sprite: 'powerup-aketon',
        maxLevel: 5,
        baseCost: 45,
        costMultiplier: 1.5,
        effect: 'health_multiplier'
    },
    {
        id: 'beer',
        name: 'Beer',
        description: 'Increases critical chance by +2% per level',
        icon: '🍺',
        sprite: 'powerup-beer',
        maxLevel: 5,
        baseCost: 55,
        costMultiplier: 1.6,
        effect: 'crit_chance'
    },
    {
        id: 'piety',
        name: 'Piety',
        description: 'Increases all recovery effects by +10% per level',
        icon: '🙏',
        sprite: 'powerup-piety',
        maxLevel: 5,
        baseCost: 50,
        costMultiplier: 1.5,
        effect: 'recovery_multiplier'
    },
    {
        id: 'thumb_ring',
        name: 'Thumb Ring',
        description: 'Increases attack speed by +5% per level',
        icon: '💍',
        sprite: 'powerup-ring',
        maxLevel: 5,
        baseCost: 60,
        costMultiplier: 1.6,
        effect: 'attack_speed'
    },
    {
        id: 'mushroom',
        name: 'Mushroom',
        description: 'Increases area of effect by +8% per level',
        icon: '🍄',
        sprite: 'powerup-mushroom',
        maxLevel: 5,
        baseCost: 55,
        costMultiplier: 1.5,
        effect: 'area_multiplier'
    },
    {
        id: 'radial_time',
        name: 'Radial Time',
        description: 'Increases duration of effects by +10% per level',
        icon: '⏱️',
        sprite: 'powerup-time',
        maxLevel: 5,
        baseCost: 50,
        costMultiplier: 1.5,
        effect: 'duration_multiplier'
    },
    {
        id: 'booster',
        name: 'Booster',
        description: 'Increases experience gain by +5% per level',
        icon: '⚡',
        sprite: 'powerup-booster',
        maxLevel: 5,
        baseCost: 65,
        costMultiplier: 1.7,
        effect: 'xp_multiplier'
    }
];

// Wave configurations
export interface WaveConfig {
    totalEnemies: number;
    spawnInterval: number;
    enemyTypes: string[];
    bossWave: boolean;
    bossType?: string;
    duration: number;
}

export const WAVE_CONFIGS: WaveConfig[] = [
    // Wave 1
    {
        totalEnemies: 20,
        spawnInterval: 2000,
        enemyTypes: ['GHOST'],
        bossWave: false,
        duration: 60000 // 60 seconds
    },
    // Wave 2
    {
        totalEnemies: 25,
        spawnInterval: 1800,
        enemyTypes: ['GHOST', 'FAST'],
        bossWave: false,
        duration: 60000
    },
    // Wave 3
    {
        totalEnemies: 30,
        spawnInterval: 1600,
        enemyTypes: ['GHOST', 'FAST', 'TANK'],
        bossWave: false,
        duration: 60000
    },
    // Wave 4
    {
        totalEnemies: 35,
        spawnInterval: 1400,
        enemyTypes: ['GHOST', 'FAST', 'TANK', 'RANGED'],
        bossWave: false,
        duration: 60000
    },
    // Wave 5 (Boss)
    {
        totalEnemies: 25,
        spawnInterval: 2000,
        enemyTypes: ['GHOST', 'FAST', 'TANK', 'RANGED'],
        bossWave: true,
        bossType: 'BOSS',
        duration: 90000 // 90 seconds for boss wave
    }
];