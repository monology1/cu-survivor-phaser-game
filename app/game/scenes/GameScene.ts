import * as Phaser from 'phaser';
import { ENEMY_TYPES, WEAPON_TYPES, WAVE_CONFIGS } from '../config';

// Define interfaces for better type safety
interface PlayerData {
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
    weapons: string[];
    lastFired: number;
}

interface EnemyData {
    type: string;
    health: number;
    maxHealth: number;
    damage: number;
    speed: number;
    points: number;
    experienceValue: number;
    coinValue: number;
}

interface ProjectileData {
    damage: number;
    range: number;
    startX?: number;
    startY?: number;
    distance?: number;
    weaponType: string;
    critical: boolean;
}

export default class GameScene extends Phaser.Scene {
    // Game objects
    private player?: Phaser.Physics.Arcade.Sprite;
    private playerRange?: Phaser.GameObjects.Graphics;
    private enemies?: Phaser.Physics.Arcade.Group;
    private projectiles?: Phaser.Physics.Arcade.Group;
    private coins?: Phaser.Physics.Arcade.Group;
    private experience?: Phaser.Physics.Arcade.Group;
    private damageNumbers?: Phaser.GameObjects.Group;

    // Game state
    private score = 0;
    private waveNumber = 1;
    private waveTimer = 0;
    private waveDuration = 60000; // 60 seconds
    private gameStartTime = 0;
    private invincibilityTimer = 0; // For invincibility frames
    private lastSpawnTime = 0;
    private enemiesSpawned = 0;
    private enemiesKilled = 0;
    private currentWaveConfig: any;

    // UI elements
    private scoreText?: Phaser.GameObjects.Text;
    private enemyKilledText?: Phaser.GameObjects.Text;
    private waveText?: Phaser.GameObjects.Text;
    private timerText?: Phaser.GameObjects.Text;
    private healthBar?: Phaser.GameObjects.Graphics;
    private experienceBar?: Phaser.GameObjects.Graphics;
    private weaponIcons: Phaser.GameObjects.Sprite[] = [];
    private coinCounter?: Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
    }

    create() {
        // Create map background first (so it's behind everything else)
        this.createMap();

        // Initialize game objects
        this.createPlayer();
        this.createPlayerRange();
        this.createEnemies();
        this.createProjectiles();
        this.createCoins();
        this.createExperience();
        this.createDamageNumbers();

        // Create UI
        this.createUI();
        this.setupBg();

        // Setup collisions
        this.setupCollisions();

        // Start the game
        this.startGame();
        // Handle music
        this.setupMusic();

        // Record start time
        this.gameStartTime = this.time.now;
    }

    setupBg(){
        const bg = this.add.image(0, 0, 'game-background')
            .setOrigin(0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setToBack();
        // Get the map dimensions (assuming standard map size, adjust as needed)
        const mapWidth = 2000;  // Adjust to your map's actual width
        const mapHeight = 2000; // Adjust to your map's actual height
        // Set the origin to top-left corner for easier positioning
        bg.setOrigin(0, 0);
        // Make sure the map is behind everything else
        bg.setDepth(-10);

        // Set the world bounds based on the map size
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Enable camera to follow player
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    }

    update(time: number, delta: number) {
        if (!this.player) return;
        this.updatePlayer(delta);
        this.updatePlayerRange();

        // Update wave timer and invincibility
        this.waveTimer += delta;
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= delta;

            // Visual indicator for invincibility
            this.player.alpha = Math.sin(this.time.now * 0.01) * 0.3 + 0.7;
        } else if (this.player.alpha !== 1) {
            this.player.alpha = 1; // Ensure alpha is reset when invincibility ends
        }

        this.updateTimerText();

        // Check for wave completion
        if (this.waveTimer >= this.waveDuration) {
            this.completeWave();
        }

        // Update projectiles
        this.updateProjectiles();

        // Spawn enemies
        this.updateEnemySpawning(time);

        // Update game state in store
        this.updateGameStore();
    }

    private setupMusic() {
        // Stop menu music if playing
        const menuMusic = this.sound.get('main-menu');
        if (menuMusic?.isPlaying) menuMusic.stop();

        // Start battle music if not already playing
        try {
            const battleMusic = this.sound.get('music-battle') ||
                this.sound.add('music-battle', {loop: true, volume: 0.5});
            if (!battleMusic.isPlaying) battleMusic.play();
        } catch (error) {
            console.warn('Battle music could not be played:', error);
        }
    }

    private createMap() {
        // Get the map dimensions (assuming standard map size, adjust as needed)
        const mapWidth = 2000;  // Adjust to your map's actual width
        const mapHeight = 2000; // Adjust to your map's actual height

        // Create map image
        const map = this.add.image(0, 0, 'game-map-01');

        // Set the origin to top-left corner for easier positioning
        map.setOrigin(0, 0);

        // Make sure the map is behind everything else
        map.setDepth(-10);

        // Set the world bounds based on the map size
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Enable camera to follow player
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    }

    private createPlayer() {
        // Get player data from store
        const store = this.game.registry.get('zustandStore');
        const characterId = store?.getState().selectedCharacter || 'bill';

        this.player = this.physics.add.sprite(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `${characterId}`
        );

        if (!this.player) return;

        this.player.setCollideWorldBounds(true)
            .setScale(2.4)
            .setDepth(10);

        // Get stored player stats
        const playerStats = store?.getState().currentRun.playerStats || {
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
        };

        // Get stored weapons
        const weapons = store?.getState().currentRun.weapons || [{ type: 'BASIC', level: 1 }];
        const weaponTypes = weapons.map((w: { type: any; }) => w.type);

        // Set player data using a structured object for better type safety
        const playerData: PlayerData = {
            ...playerStats,
            weapons: weaponTypes,
            lastFired: 0
        };

        // Set all player properties at once
        Object.entries(playerData).forEach(([key, value]) => {
            this.player?.setData(key, value);
        });
    }

    private createPlayerRange() {
        // Create a circle graphic to show player's attack range
        this.playerRange = this.add.graphics();
        this.updatePlayerRange();
    }

    private updatePlayerRange() {
        if (!this.player || !this.playerRange) return;

        const range = this.player.getData('range') || 150;

        // Clear previous graphics
        this.playerRange.clear();

        // Draw range circle
        this.playerRange.lineStyle(2, 0x9966ff, 0.7);
        this.playerRange.fillStyle(0x9966ff, 0.1);
        this.playerRange.strokeCircle(this.player.x, this.player.y, range);
        this.playerRange.fillCircle(this.player.x, this.player.y, range);
    }

    private createEnemies() {
        this.enemies = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 100,
            runChildUpdate: true
        });
    }

    private createProjectiles() {
        this.projectiles = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 100,
            runChildUpdate: false // We'll handle updates manually for more control
        });
    }

    private createCoins() {
        this.coins = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 50
        });
    }

    private createExperience() {
        this.experience = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 50
        });
    }

    private createDamageNumbers() {
        this.damageNumbers = this.add.group();
    }

    private createUI() {
        // Create UI elements
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            font: '24px Arial',
            color: '#ffffff'
        });

        this.enemyKilledText = this.add.text(150, 16, 'Kills: 0', {
            font: '24px Arial',
            color: '#ffffff'
        })

        this.waveText = this.add.text(
            this.cameras.main.width - 16,
            16,
            'Wave: 1',
            {font: '24px Arial', color: '#ffffff'}
        ).setOrigin(1, 0);

        this.timerText = this.add.text(
            this.cameras.main.width / 2,
            16,
            '60',
            {font: '24px Arial', color: '#ffffff'}
        ).setOrigin(0.5, 0);

        // Health bar
        this.healthBar = this.add.graphics();
        this.updateHealthBar();

        // Experience bar
        this.experienceBar = this.add.graphics();
        this.updateExperienceBar();

        // Coin counter (top right)
        this.coinCounter = this.add.text(
            this.cameras.main.width - 16,
            50,
            '0',
            {font: '24px Arial', color: '#ffdd00'}
        ).setOrigin(1, 0);

        // Add coin icon
        this.add.sprite(this.cameras.main.width - 48, 50, 'coin')
            .setOrigin(1, 0)
            .setScale(0.5);

        // Create weapon icons at the top
        this.createWeaponIcons();
    }

    private createWeaponIcons() {
        // Clear existing icons
        this.weaponIcons.forEach(icon => icon.destroy());
        this.weaponIcons = [];

        // Get weapons from player data
        const weapons = this.player?.getData('weapons') || ['BASIC'];
        // Create icons
        weapons.forEach((weaponType: string, index: number) => {
            const icon = this.add.sprite(
                100 + (index * 60),
                50,
                `weapon-${weaponType.toLowerCase()}`
            );
            icon.setScale(2);
            this.weaponIcons.push(icon);
        });
    }

    private setupCollisions() {
        if (!this.player || !this.enemies || !this.projectiles || !this.coins || !this.experience) return;

        // Set up collision detection for combat
        this.physics.add.overlap(
            this.projectiles,
            this.enemies,
            this.handleProjectileEnemyCollision,
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            undefined,
            this
        );

        // Set up collision detection for pickups - with explicit type casting
        this.physics.add.overlap(
            this.player,
            this.coins,
            this.collectCoin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.experience,
            this.collectExperience as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );
    }

    private startGame() {
        this.score = 0;
        this.waveNumber = 1;
        this.waveTimer = 0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;

        // Get the current wave configuration
        this.currentWaveConfig = WAVE_CONFIGS[this.waveNumber - 1] || WAVE_CONFIGS[0];
        this.waveDuration = this.currentWaveConfig.duration;

        this.showWaveAnnouncement();

        // Reset registry values for enemy spawning
        this.registry.set('lastEnemySpawn', 0);
    }

    private updatePlayer(delta: number) {
        if (!this.player || !this.input.keyboard) return;

        // Get cursor keys and player speed
        const cursors = this.input.keyboard.createCursorKeys();
        const speed = this.player.getData('speed');

        // Reset velocity
        this.player.setVelocity(0);

        // Handle keyboard input
        const keys = {
            left: cursors.left.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('A')),
            right: cursors.right.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('D')),
            up: cursors.up.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('W')),
            down: cursors.down.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('S'))
        };

        // Set velocity based on input
        if (keys.left) this.player.setVelocityX(-speed);
        else if (keys.right) this.player.setVelocityX(speed);

        if (keys.up) this.player.setVelocityY(-speed);
        else if (keys.down) this.player.setVelocityY(speed);

        // Normalize velocity for diagonal movement
        if (this.player.body && (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0)) {
            this.player.body.velocity.normalize().scale(speed);
        }

        // Handle auto-attack
        const autoAttack = this.game.registry.get('zustandStore')?.getState().settings.autoAttack ?? true;
        if (autoAttack) {
            this.autoAttack(delta);
        }
    }

    private autoAttack(delta: number) {
        if (!this.player || !this.enemies) return;

        const time = this.time.now;
        const weapons = this.player.getData('weapons') || ['BASIC'];
        const lastFired = this.player.getData('lastFired') || 0;
        const attackSpeed = this.player.getData('attackSpeed') || 1;

        // Get the current weapon configuration
        const weaponType = weapons[0]; // Simplified to first weapon
        const weaponConfig = WEAPON_TYPES[weaponType];

        if (!weaponConfig) return;

        // Check fire rate
        const fireRate = weaponConfig.fireRate / attackSpeed;
        if (time <= lastFired + fireRate) return;

        // Find nearest enemy
        const activeEnemies = this.enemies.getChildren().filter(e => e.active);
        if (activeEnemies.length === 0) return;

        // Sort by distance to player
        activeEnemies.sort((a, b) => {
            const spriteA = a as Phaser.GameObjects.Sprite;
            const spriteB = b as Phaser.GameObjects.Sprite;
            const distA = Phaser.Math.Distance.Between(
                this.player!.x, this.player!.y, spriteA.x, spriteA.y
            );
            const distB = Phaser.Math.Distance.Between(
                this.player!.x, this.player!.y, spriteB.x, spriteB.y
            );
            return distA - distB;
        });

        // Fire projectiles based on player's projectile count
        const projectileCount = this.player.getData('projectiles') || 1;
        const targets = activeEnemies.slice(0, projectileCount);

        targets.forEach(target => {
            this.fireProjectile(target as Phaser.Types.Physics.Arcade.GameObjectWithBody);
        });

        this.player.setData('lastFired', time);
    }

    private fireProjectile(target: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
        if (!this.player || !this.projectiles) return;

        // Get player data
        const playerDamage = this.player.getData('power') || 10;
        const weaponType = this.player.getData('weapons')[0] || 'BASIC';
        const critChance = this.player.getData('critical') / 100 || 0.05;
        const weaponConfig = WEAPON_TYPES[weaponType];

        if (!weaponConfig) return;

        // Calculate if this is a critical hit
        const isCritical = Math.random() < critChance;

        // Get projectile from pool
        const projectile = this.projectiles.get(
            this.player.x,
            this.player.y,
            weaponConfig.projectileSprite
        ) as Phaser.Physics.Arcade.Sprite;

        if (!projectile) return;

        const targetSprite = target as Phaser.GameObjects.Sprite;
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            targetSprite.x, targetSprite.y
        );

        // Activate and set up projectile
        projectile.setActive(true).setVisible(true);
        projectile.setScale(weaponConfig.projectileScale);

        // Calculate damage with critical bonus
        const damage = playerDamage * weaponConfig.damage * (isCritical ? 2 : 1);

        // Store data for projectile
        const projectileData: ProjectileData = {
            damage: damage,
            range: weaponConfig.range,
            startX: this.player.x,
            startY: this.player.y,
            distance: 0,
            weaponType: weaponType,
            critical: isCritical
        };

        // Set all projectile properties
        Object.entries(projectileData).forEach(([key, value]) => {
            projectile.setData(key, value);
        });

        // If this is a critical hit, tint the projectile
        if (isCritical) {
            projectile.setTint(0xff0000);
        }

        // Set velocity and rotation
        this.physics.velocityFromRotation(
            angle,
            weaponConfig.projectileSpeed,
            projectile.body?.velocity
        );
        projectile.setRotation(angle);

        // Play sound effect
        try {
            this.sound.play('shoot', {volume: 0.3});
        } catch (error) {
            console.warn('Could not play shoot sound:', error);
        }
    }

    private updateProjectiles() {
        if (!this.projectiles) return;

        // Update each active projectile
        this.projectiles.getChildren().forEach(p => {
            const projectile = p as Phaser.Physics.Arcade.Sprite;
            if (!projectile.active) return;

            // Check if projectile has range data
            const startX = projectile.getData('startX');
            const startY = projectile.getData('startY');
            const maxRange = projectile.getData('range');

            if (startX !== undefined && startY !== undefined && maxRange) {
                // Calculate distance traveled
                const distance = Phaser.Math.Distance.Between(
                    startX, startY, projectile.x, projectile.y
                );

                // Deactivate if beyond range
                if (distance > maxRange) {
                    projectile.setActive(false).setVisible(false);
                }
            }
        });
    }

    private updateEnemySpawning(time: number) {
        // Get current wave config
        const waveConfig = this.currentWaveConfig;
        if (!waveConfig) return;
        // Calculate spawn interval //2000 for wave 1
        const spawnInterval = waveConfig.spawnInterval;

        // Spawn enemy if enough time has passed and haven't reached total enemies for wave
        if (time > this.lastSpawnTime + spawnInterval && this.enemiesSpawned < waveConfig.totalEnemies) {
            this.spawnEnemy();
            this.lastSpawnTime = time;
            this.enemiesSpawned++;
        }

        // Check if boss should spawn
        if (waveConfig.bossWave && this.enemiesKilled >= Math.floor(waveConfig.totalEnemies * 0.75) && !this.registry.get('bossSpawned')) {
            this.spawnBoss();
            this.registry.set('bossSpawned', true);
        }
    }

    private spawnEnemy() {
        if (!this.enemies) return;
        // Get spawn position and enemy from pool
        const spawnPosition = this.getRandomSpawnPosition();
        const enemy = this.enemies.get(
            spawnPosition.x,
            spawnPosition.y
        ) as Phaser.Physics.Arcade.Sprite;

        if (!enemy) return;

        // Determine available enemy types based on wave config
        const waveConfig = this.currentWaveConfig;
        const availableTypes = waveConfig.enemyTypes;

        // Select random enemy type
        const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const enemyConfig = ENEMY_TYPES[enemyType];

        if (!enemyConfig) return;

        // Scale difficulty based on wave number
        const waveScaleFactor = 1 + (this.waveNumber - 1) * 0.2;

        const size = 40;
        // Set up enemy appearance
        enemy.setActive(true).setVisible(true)
            .setTexture(enemyConfig.sprite)
            .setScale(enemyConfig.scale)
            .setSize(size,size)
            .setDisplaySize(size,size)
            .setTint(enemyConfig.tint)

        // Calculate values
        const healthValue = Math.floor(enemyConfig.health * waveScaleFactor);
        const damage = Math.floor(enemyConfig.damage * waveScaleFactor);
        const points = Math.floor(enemyConfig.points * waveScaleFactor);
        const experienceValue = Math.floor(5 + (this.waveNumber * 2));
        const coinValue = Math.random() < 0.2 ? 1 : 0; // 20% chance to drop a coin

        // Create enemy data object
        const enemyData: EnemyData = {
            type: enemyType,
            health: healthValue,
            maxHealth: healthValue,
            damage: damage,
            speed: enemyConfig.speed,
            points: points,
            experienceValue: experienceValue,
            coinValue: coinValue
        };

        // Set all enemy properties
        Object.entries(enemyData).forEach(([key, value]) => {
            enemy.setData(key, value);
        });

        // Set up enemy update behavior
        enemy.update = () => this.updateEnemy(enemy);
    }

    private spawnBoss() {
        if (!this.enemies) return;

        // Get current wave config
        const waveConfig = this.currentWaveConfig;
        if (!waveConfig || !waveConfig.bossType) return;

        // Get boss type
        const bossType = waveConfig.bossType;
        const bossConfig = ENEMY_TYPES[bossType];

        if (!bossConfig) return;

        // Spawn boss in the center of the screen, offset from player
        const playerX = this.player?.x || this.cameras.main.width / 2;
        const playerY = this.player?.y || this.cameras.main.height / 2;

        // Spawn boss at some distance from player
        const angle = Math.random() * Math.PI * 2;
        const distance = 300;
        const spawnX = playerX + Math.cos(angle) * distance;
        const spawnY = playerY + Math.sin(angle) * distance;

        const boss = this.enemies.get(spawnX, spawnY) as Phaser.Physics.Arcade.Sprite;

        if (!boss) return;

        // Scale difficulty based on wave number
        const waveScaleFactor = 1 + (this.waveNumber - 1) * 0.2;

        // Set up boss appearance
        boss.setActive(true).setVisible(true);
        boss.setTexture(bossConfig.sprite);
        boss.setScale(bossConfig.scale * 1.5); // Make boss bigger
        boss.setTint(bossConfig.tint);

        // Calculate boss stats
        const healthValue = Math.floor(bossConfig.health * waveScaleFactor);
        const damage = Math.floor(bossConfig.damage * waveScaleFactor);
        const points = Math.floor(bossConfig.points * waveScaleFactor);
        const experienceValue = Math.floor(50 + (this.waveNumber * 10));
        const coinValue = 5; // Guaranteed coins from boss

        // Create boss data
        const bossData: EnemyData = {
            type: bossType,
            health: healthValue,
            maxHealth: healthValue,
            damage: damage,
            speed: bossConfig.speed * 0.8, // Slightly slower
            points: points,
            experienceValue: experienceValue,
            coinValue: coinValue
        };

        // Set boss properties
        Object.entries(bossData).forEach(([key, value]) => {
            boss.setData(key, value);
        });

        // Add special 'boss' flag
        boss.setData('isBoss', true);

        // Set up boss update behavior
        boss.update = () => this.updateEnemy(boss);

        // Show boss announcement
        this.showBossAnnouncement();

        // Play boss music or sound effect
        try {
            this.sound.play('boss-appear', { volume: 0.5 });
        } catch (error) {
            console.warn('Could not play boss sound:', error);
        }
    }

    private showBossAnnouncement() {
        // Create boss announcement text
        const bossText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'BOSS INCOMING!',
            {
                font: 'bold 48px Arial',
                color: '#ff0000'
            }
        ).setOrigin(0.5).setDepth(100);

        // Add shaking effect
        this.tweens.add({
            targets: bossText,
            x: { from: bossText.x - 5, to: bossText.x + 5 },
            ease: 'Linear',
            duration: 50,
            repeat: 10,
            yoyo: true,
            onComplete: () => {
                // Fade out
                this.tweens.add({
                    targets: bossText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => bossText.destroy()
                });
            }
        });

        // Camera shake
        this.cameras.main.shake(500, 0.01);
    }

    private updateEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
        if (!this.player || !enemy.active) return;

        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        // Set velocity toward player
        const speed = enemy.getData('speed') || 100;
        this.physics.velocityFromRotation(angle, speed, enemy.body?.velocity);

        // Rotate enemy to face player
        const autoFace = this.game.registry.get('zustandStore')?.getState().settings.autoFaceClosestEnemy ?? true;
        if (autoFace) {
            enemy.setRotation(angle + Math.PI / 2);
        }

        // Boss special behavior (if applicable)
        if (enemy.getData('isBoss') && Math.random() < 0.01) {
            this.bossSummonMinions(enemy);
        }
    }

    private bossSummonMinions(boss: Phaser.Physics.Arcade.Sprite) {
        if (!this.enemies) return;

        // Summon 3 minions around the boss
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const spawnX = boss.x + Math.cos(angle) * distance;
            const spawnY = boss.y + Math.sin(angle) * distance;

            const minion = this.enemies.get(spawnX, spawnY) as Phaser.Physics.Arcade.Sprite;

            if (!minion) continue;

            // Setup minion (use FAST enemy type for minions)
            const minionConfig = ENEMY_TYPES['FAST'];

            // Set up minion appearance
            minion.setActive(true).setVisible(true);
            minion.setTexture(minionConfig.sprite);
            minion.setScale(minionConfig.scale * 0.8); // Smaller minions
            minion.setTint(boss.tintTopLeft); // Same color as boss

            // Set minion properties
            const minionData: EnemyData = {
                type: 'FAST',
                health: minionConfig.health / 2,
                maxHealth: minionConfig.health / 2,
                damage: minionConfig.damage / 2,
                speed: minionConfig.speed * 1.2, // Faster minions
                points: minionConfig.points / 2,
                experienceValue: 2,
                coinValue: 0
            };

            Object.entries(minionData).forEach(([key, value]) => {
                minion.setData(key, value);
            });

            // Set update behavior
            minion.update = () => this.updateEnemy(minion);
        }

        // Visual effect for summoning
        const summonCircle = this.add.circle(boss.x, boss.y, 50, 0xffa500, 0.5);
        this.tweens.add({
            targets: summonCircle,
            radius: 100,
            alpha: 0,
            duration: 500,
            onComplete: () => summonCircle.destroy()
        });

        // Sound effect
        try {
            this.sound.play('summon', { volume: 0.4 });
        } catch (error) {
            console.warn('Could not play summon sound:', error);
        }
    }

    private getRandomSpawnPosition() {
        const padding = 50;
        const camera = this.cameras.main;

        // Define camera bounds with padding
        const bounds = {
            left: camera.scrollX - padding,
            right: camera.scrollX + camera.width + padding,
            top: camera.scrollY - padding,
            bottom: camera.scrollY + camera.height + padding
        };

        // Choose a random edge (0: top, 1: right, 2: bottom, 3: left)
        const edge = Math.floor(Math.random() * 4);

        // Generate position based on edge
        const positions = [
            {x: Phaser.Math.Between(bounds.left, bounds.right), y: bounds.top},
            {x: bounds.right, y: Phaser.Math.Between(bounds.top, bounds.bottom)},
            {x: Phaser.Math.Between(bounds.left, bounds.right), y: bounds.bottom},
            {x: bounds.left, y: Phaser.Math.Between(bounds.top, bounds.bottom)}
        ];

        return positions[edge];
    }

    private handleProjectileEnemyCollision(
        projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
        enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
    ) {
        // Handle cases where we might get a Body instead of a GameObject
        let projectileSprite: Phaser.GameObjects.Sprite;
        let enemySprite: Phaser.GameObjects.Sprite;
        // Get the actual sprite from the body if needed
        if (projectile instanceof Phaser.Physics.Arcade.Body) {
            projectileSprite = projectile.gameObject as Phaser.GameObjects.Sprite;
        } else if (projectile instanceof Phaser.Physics.Arcade.StaticBody) {
            projectileSprite = projectile.gameObject as Phaser.GameObjects.Sprite;
        } else {
            projectileSprite = projectile as Phaser.GameObjects.Sprite;
        }
        projectileSprite.setActive(false).setVisible(false);

        if (enemy instanceof Phaser.Physics.Arcade.Body) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else if (enemy instanceof Phaser.Physics.Arcade.StaticBody) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else {
            enemySprite = enemy as Phaser.GameObjects.Sprite;
        }

        // Now proceed with the collision handling using the sprite references

        // Deal damage to enemy
        const damage = projectileSprite.getData('damage') || 10;
        const health = enemySprite.getData('health') || 50;
        const newHealth = health - damage;
        const isCritical = projectileSprite.getData('critical') || false;

        enemySprite.setData('health', newHealth);

        // Show damage number
        if (this.game.registry.get('zustandStore')?.getState().settings.showDamageNumbers) {
            this.showDamageNumber(enemySprite.x, enemySprite.y, damage, isCritical);
        }

        // Play hit sound
        try {
            this.sound.play('hit', { volume: 0.2 });
        } catch (error) {
            console.warn('Could not play hit sound:', error);
        }

        // Check if enemy is killed
        if (newHealth <= 0) {
            this.killEnemy(enemySprite);
        } else {
            // Flash enemy to show damage
            this.tweens.add({
                targets: enemySprite,
                alpha: 0.5,
                duration: 50,
                yoyo: true
            });
        }
    }

    private showDamageNumber(x: number, y: number, damage: number, isCritical: boolean = false) {
        // Format damage number
        const roundedDamage = Math.floor(damage);

        // Create text with appropriate style based on critical hit
        const text = this.add.text(
            x,
            y - 20,
            roundedDamage.toString(),
            {
                font: isCritical ? 'bold 24px Arial' : '20px Arial',
                color: isCritical ? '#ff0000' : '#ffffff'
            }
        );

        // Add to group for management
        if (this.damageNumbers) {
            this.damageNumbers.add(text);
        }

        // Animate the damage number
        this.tweens.add({
            targets: text,
            y: text.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }

    private handlePlayerEnemyCollision(
        player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
        enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
    ) {
        // Skip if player is invincible
        if (this.invincibilityTimer > 0) return;

        // Handle cases where we might get a Body instead of a GameObject
        let playerSprite: any;
        let enemySprite: Phaser.GameObjects.Sprite;

        // Get the actual sprite from the body if needed
        if (player instanceof Phaser.Physics.Arcade.Body) {
            playerSprite = player.gameObject as Phaser.GameObjects.Sprite;
        } else if (player instanceof Phaser.Physics.Arcade.StaticBody) {
            playerSprite = player.gameObject as Phaser.GameObjects.Sprite;
        } else {
            playerSprite = player as Phaser.GameObjects.Sprite;
        }

        if (enemy instanceof Phaser.Physics.Arcade.Body) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else if (enemy instanceof Phaser.Physics.Arcade.StaticBody) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else {
            enemySprite = enemy as Phaser.GameObjects.Sprite;
        }

        // Apply damage to player
        const damage = enemySprite.getData('damage') || 10;
        const armor = playerSprite.getData('armor') || 0;
        const evasion = playerSprite.getData('evasion') || 0;

        // Check for evasion (dodge)
        if (Math.random() * 100 < evasion) {
            // Dodged the attack!
            this.showDamageNumber(playerSprite.x, playerSprite.y - 20, 0, false);

            // Play dodge sound
            try {
                this.sound.play('dodge', { volume: 0.4 });
            } catch (error) {
                console.warn('Could not play dodge sound:', error);
            }

            return;
        }

        // Calculate actual damage after armor reduction
        const armorReduction = damage * (armor / 100);
        const actualDamage = Math.max(1, damage - armorReduction);

        const health = playerSprite.getData('health') || 100;
        const newHealth = health - actualDamage;

        playerSprite.setData('health', newHealth);

        // Set invincibility
        this.invincibilityTimer = 500; // 0.5 seconds invincibility

        // Visual and audio feedback
        try {
            this.sound.play('player-damage', { volume: 0.5 });
        } catch (error) {
            console.warn('Could not play player-damage sound:', error);
        }

        this.cameras.main.shake(100, 0.01);
        this.updateHealthBar();

        // Check if player is killed
        if (newHealth <= 0) {
            this.gameOver();
        } else {
            // Visual feedback and knockback
            this.tweens.add({
                targets: playerSprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 2
            });

            // Apply knockback force
            const angle = Phaser.Math.Angle.Between(
                enemySprite.x, enemySprite.y,
                playerSprite.x, playerSprite.y
            );

            // Create knockback velocity
            const knockbackVelocity = new Phaser.Math.Vector2();
            this.physics.velocityFromRotation(angle, 300, knockbackVelocity);

            // Apply to player body
            playerSprite.body.velocity.x = knockbackVelocity.x;
            playerSprite.body.velocity.y = knockbackVelocity.y;
        }
    }

    private killEnemy(
        enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile | Phaser.GameObjects.Sprite
    ) {
        // Handle cases where we might get different types
        let enemySprite: Phaser.GameObjects.Sprite;

        if (enemy instanceof Phaser.Physics.Arcade.Body) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else if (enemy instanceof Phaser.Physics.Arcade.StaticBody) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else {
            enemySprite = enemy as Phaser.GameObjects.Sprite;
        }
        enemySprite.setActive(false).setVisible(false)

        // Get enemy data
        const points = enemySprite.getData('points') || 10;
        const experienceValue = enemySprite.getData('experienceValue') || 5;
        const coinValue = enemySprite.getData('coinValue') || 0;
        const isBoss = enemySprite.getData('isBoss') || false;

        // Add score
        this.score += points;
        this.updateScoreText();

        // Increment kill count
        this.enemiesKilled++;
        this.updateKillText();

        // Drop experience
        this.dropExperience(enemySprite.x, enemySprite.y, experienceValue);

        // Drop coins if applicable
        if (coinValue > 0) {
            this.dropCoin(enemySprite.x, enemySprite.y, coinValue);
        }

        // Play appropriate death sound
        try {
            if (isBoss) {
                this.sound.play('boss-death', { volume: 0.6 });
            } else {
                // this.sound.play('enemy-death', { volume: 0.3 });
            }
        } catch (error) {
            console.warn('Could not play death sound:', error);
        }

        // Death animation
        // this.tweens.add({
        //     targets: enemySprite,
        //     alpha: 0,
        //     scale: enemySprite.scale * 1.5,
        //     duration: 200,
        //     onComplete: () => enemySprite.setActive(false).setVisible(false)
        // });

        // Update store with kill
        const store = this.game.registry.get('zustandStore');
        if (store) {
            const currentKills = store.getState().currentRun.kills || 0;
            store.setState((state: { currentRun: any; }) => ({
                currentRun: {
                    ...state.currentRun,
                    kills: currentKills + 1
                }
            }));
        }
    }

    private dropExperience(x: number, y: number, value: number) {
        if (!this.experience) return;

        // Get experience gem from pool
        const expGem = this.experience.get(x, y, 'experience') as Phaser.Physics.Arcade.Sprite;

        if (!expGem) return;

        const size = 30;
        // Set up experience gem
        expGem
            .setActive(true).setVisible(true)
            .setDisplaySize(size,size)
            .setSize(size,size)
            .setData('value', value);

        // Add a small random offset so multiple drops don't stack exactly
        expGem.x += Phaser.Math.Between(-10, 10);
        expGem.y += Phaser.Math.Between(-10, 10);

        // Add a slight pulsing animation
        this.tweens.add({
            targets: expGem,
            scale: 0.1,
            duration: 1200,
            yoyo: true,
            repeat: -1
        });
    }

    private dropCoin(x: number, y: number, value: number) {
        if (!this.coins) return;

        // Get coin from pool
        const coin = this.coins.get(x, y, 'coin') as Phaser.Physics.Arcade.Sprite;
        console.log(coin)
        if (!coin) return;

        // Set up coin
        coin.setActive(true).setVisible(true);
        coin.setScale(0.8);
        coin.setData('value', value);

        // Add a small random offset
        coin.x += Phaser.Math.Between(-10, 10);
        coin.y += Phaser.Math.Between(-10, 10);

        // Add a slight spinning animation
        this.tweens.add({
            targets: coin,
            angle: 360,
            duration: 1000,
            repeat: -1
        });
    }

    private collectExperience(
        player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
        expGem: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
    ) {
        // Get the sprite reference - handle all possible types
        let expSprite: Phaser.GameObjects.Sprite;

        if (expGem instanceof Phaser.Physics.Arcade.Body) {
            expSprite = expGem.gameObject as Phaser.GameObjects.Sprite;
        } else if (expGem instanceof Phaser.Physics.Arcade.StaticBody) {
            expSprite = expGem.gameObject as Phaser.GameObjects.Sprite;
        } else if ('body' in expGem) {
            expSprite = expGem as Phaser.GameObjects.Sprite;
        } else {
            // Handle tile or other cases if needed
            return;
        }

        // Get the value
        const value = expSprite.getData('value') || 5;

        // Deactivate the gem
        expSprite.setActive(false).setVisible(false);

        // Update experience in the store
        const store = this.game.registry.get('zustandStore');
        if (store) {
            store.getState().gainExperience(value);
        }

        // Update local experience bar
        this.updateExperienceBar();

        // Play sound
        try {
            this.sound.play('exp-pickup', { volume: 0.2 });
        } catch (error) {
            console.warn('Could not play experience pickup sound:', error);
        }
    }

    private collectCoin(
        player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
        coin: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
    ) {
        // Get the sprite reference - handle all possible types
        let coinSprite: Phaser.GameObjects.Sprite;

        if (coin instanceof Phaser.Physics.Arcade.Body) {
            coinSprite = coin.gameObject as Phaser.GameObjects.Sprite;
        } else if (coin instanceof Phaser.Physics.Arcade.StaticBody) {
            coinSprite = coin.gameObject as Phaser.GameObjects.Sprite;
        } else if ('body' in coin) {
            coinSprite = coin as Phaser.GameObjects.Sprite;
        } else {
            // Handle tile or other cases if needed
            return;
        }

        // Get the value
        const value = coinSprite.getData('value') || 1;

        // Deactivate the coin
        coinSprite.setActive(false).setVisible(false);

        // Update coins in the store
        const store = this.game.registry.get('zustandStore');
        if (store) {
            store.getState().collectCoin(value);
        }

        // Update coin counter
        if (this.coinCounter) {
            const store = this.game.registry.get('zustandStore');
            const collectedCoins = store?.getState().currentRun.coinsCollected || 0;
            this.coinCounter.setText(collectedCoins.toString());
        }

        // Play sound
        try {
            this.sound.play('coin-pickup', { volume: 0.3 });
        } catch (error) {
            console.warn('Could not play coin pickup sound:', error);
        }
    }

    private updateHealthBar() {
        if (!this.healthBar || !this.player) return;

        // Get health values
        const health = this.player.getData('health') || 0;
        const maxHealth = this.player.getData('maxHealth') || 100;
        const percentage = Math.max(0, health / maxHealth);

        // Clear and redraw health bar
        this.healthBar.clear();

        // Background
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(10, 50, 200, 20);

        // Health
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(10, 50, 200 * percentage, 20);
    }

    private updateExperienceBar() {
        if (!this.experienceBar) return;

        // Get experience values from store
        const store = this.game.registry.get('zustandStore');
        const currentExp = store?.getState().currentRun.playerStats.experience || 0;
        const expToNextLevel = store?.getState().currentRun.playerStats.experienceToNextLevel || 100;
        const percentage = Math.min(1, currentExp / expToNextLevel);

        // Clear and redraw experience bar
        this.experienceBar.clear();

        // Background
        this.experienceBar.fillStyle(0x000000, 0.5);
        this.experienceBar.fillRect(10, 80, 200, 10);

        // Experience
        this.experienceBar.fillStyle(0x00ffff, 1);
        this.experienceBar.fillRect(10, 80, 200 * percentage, 10);
    }

    private updateScoreText() {
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }

    private updateKillText() {
        if(this.enemyKilledText) {
            this.enemyKilledText.setText(`Kills: ${this.enemiesKilled}`);
        }
    }

    private updateTimerText() {
        if (this.timerText) {
            const remainingTime = Math.ceil((this.waveDuration - this.waveTimer) / 1000);
            this.timerText.setText(remainingTime.toString().padStart(2, '0'));
        }
    }

    private showWaveAnnouncement() {
        // Create wave announcement text
        const waveText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Wave ${this.waveNumber}`,
            {
                font: 'bold 48px Arial',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Animate text
        this.tweens.add({
            targets: waveText,
            alpha: 0,
            y: waveText.y - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => waveText.destroy()
        });
    }

    private completeWave() {
        // Increment wave counter and reset timer
        this.waveNumber++;
        this.waveTimer = 0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.registry.set('bossSpawned', false);

        // Get the new wave configuration
        this.currentWaveConfig = WAVE_CONFIGS[this.waveNumber - 1] || WAVE_CONFIGS[WAVE_CONFIGS.length - 1];
        this.waveDuration = this.currentWaveConfig.duration;

        // Update UI
        if (this.waveText) {
            this.waveText.setText(`Wave: ${this.waveNumber}`);
        }

        // Update game state in store
        const store = this.game.registry.get('zustandStore');
        if (store) {
            store.getState().completeWave();
        }

        // Pause this scene
        this.scene.pause();

        // Play level up sound
        try {
            this.sound.play('level-up', {volume: 0.6});
        } catch (error) {
            console.warn('Could not play level-up sound:', error);
        }
    }

    private gameOver() {
        // Update game state in store
        const store = this.game.registry.get('zustandStore');
        if (store) {
            store.getState().gameOver();
        }

        // Pause this scene
        this.scene.pause();

        // Play game over sound
        try {
            this.sound.play('game-over', {volume: 0.6});
        } catch (error) {
            console.warn('Could not play game-over sound:', error);
        }
    }

    private updateGameStore() {
        if (!this.player) return;

        // Update game state in store
        const store = this.game.registry.get('zustandStore');
        if (store) {
            store.getState().updateRunState({
                score: this.score,
                wave: this.waveNumber,
                timeElapsed: Math.floor((this.time.now - this.gameStartTime) / 1000)
            });

            store.getState().updatePlayerStats({
                health: this.player.getData('health'),
                maxHealth: this.player.getData('maxHealth')
            });
        }
    }
}