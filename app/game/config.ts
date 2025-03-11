// Game constants and configuration
export const GAME_CONFIG = {
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: process.env.NODE_ENV === 'development'
        }
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
    attackRange?: number;
    attackRate?: number;
}

export const ENEMY_TYPES: Record<string, EnemyConfig> = {
    BASIC: {
        health: 50,
        speed: 100,
        damage: 10,
        points: 10,
        scale: 1,
        tint: 0xffffff
    },
    FAST: {
        health: 30,
        speed: 180,
        damage: 8,
        points: 15,
        scale: 0.8,
        tint: 0x00ff00
    },
    TANK: {
        health: 120,
        speed: 60,
        damage: 15,
        points: 20,
        scale: 1.3,
        tint: 0xff0000
    },
    RANGED: {
        health: 40,
        speed: 80,
        damage: 12,
        points: 25,
        attackRange: 200,
        attackRate: 2000,
        tint: 0x0000ff,
        scale: 0
    }
};

// Weapon types configuration
export interface WeaponConfig {
    damage: number;
    fireRate: number;
    range: number;
    projectileSpeed: number;
    projectileScale: number;
    projectileCount?: number;
    spread?: number;
    orbitCount?: number;
    orbitSpeed?: number;
    orbitRadius?: number;
}

export const WEAPON_TYPES: Record<string, WeaponConfig> = {
    BASIC: {
        damage: 10,
        fireRate: 500,
        range: 300,
        projectileSpeed: 400,
        projectileScale: 1
    },
    SHOTGUN: {
        damage: 8,
        fireRate: 1200,
        range: 250,
        projectileSpeed: 450,
        projectileCount: 5,
        spread: 0.3,
        projectileScale: 0.8
    },
    ORBIT: {
        damage: 15,
        fireRate: 3000,
        range: 150,
        orbitCount: 8,
        orbitSpeed: 0.05,
        orbitRadius: 100,
        projectileScale: 1.2,
        projectileSpeed: 0
    }
};

// Upgrade types configuration
export interface UpgradeConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    maxLevel: number;
    effect: (player: any, level: number) => void;
}

export const UPGRADE_TYPES: UpgradeConfig[] = [
    {
        id: 'speed',
        name: 'Movement Speed',
        description: '+10% Movement Speed',
        icon: '👟',
        maxLevel: 5,
        effect: (player, level) => {
            player.stats.movementSpeed += 0.1;
        }
    },
    {
        id: 'damage',
        name: 'Damage',
        description: '+20% Damage',
        icon: '💥',
        maxLevel: 5,
        effect: (player, level) => {
            player.stats.damage += 0.2;
        }
    },
    {
        id: 'attackSpeed',
        name: 'Attack Speed',
        description: '+10% Attack Speed',
        icon: '⚡',
        maxLevel: 5,
        effect: (player, level) => {
            player.stats.attackSpeed += 0.1;
        }
    },
    {
        id: 'critChance',
        name: 'Critical Hit',
        description: '+2% Critical Hit Chance',
        icon: '🎯',
        maxLevel: 5,
        effect: (player, level) => {
            player.stats.critChance += 0.02;
        }
    },
    {
        id: 'health',
        name: 'Max Health',
        description: '+20 Max Health',
        icon: '❤️',
        maxLevel: 5,
        effect: (player, level) => {
            player.maxHealth += 20;
            player.health += 20;
        }
    }
];

// Wave configurations
export interface WaveConfig {
    totalEnemies: number;
    spawnInterval: number;
    enemyTypes: string[];
    bossWave: boolean;
    bossType?: string;
}

export const WAVE_CONFIGS: WaveConfig[] = [
    // Wave 1
    {
        totalEnemies: 20,
        spawnInterval: 2000,
        enemyTypes: ['BASIC'],
        bossWave: false
    },
    // Wave 2
    {
        totalEnemies: 25,
        spawnInterval: 1800,
        enemyTypes: ['BASIC', 'FAST'],
        bossWave: false
    },
    // Wave 3
    {
        totalEnemies: 30,
        spawnInterval: 1600,
        enemyTypes: ['BASIC', 'FAST', 'TANK'],
        bossWave: false
    },
    // Wave 4
    {
        totalEnemies: 35,
        spawnInterval: 1400,
        enemyTypes: ['BASIC', 'FAST', 'TANK', 'RANGED'],
        bossWave: false
    },
    // Wave 5 (Boss)
    {
        totalEnemies: 25,
        spawnInterval: 2000,
        enemyTypes: ['BASIC', 'FAST', 'TANK', 'RANGED'],
        bossWave: true,
        bossType: 'BEHEMOTH'
    }
];