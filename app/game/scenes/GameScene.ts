import * as Phaser from 'phaser';
import {ENEMY_TYPES, WEAPON_TYPES} from '../config';

// Define interfaces for better type safety
interface PlayerData {
    health: number;
    maxHealth: number;
    speed: number;
    damage: number;
    attackSpeed: number;
    critChance: number;
    range: number;
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
}

interface ProjectileData {
    damage: number;
    range: number;
    startX?: number;
    startY?: number;
    distance?: number;
}

export default class GameScene extends Phaser.Scene {
    // Game objects
    private player?: Phaser.Physics.Arcade.Sprite;
    private enemies?: Phaser.Physics.Arcade.Group;
    private projectiles?: Phaser.Physics.Arcade.Group;

    // Game state
    private score = 0;
    private waveNumber = 1;
    private waveTimer = 0;
    private waveDuration = 60000; // 60 seconds
    private gameStartTime = 0;
    private invincibilityTimer = 0; // For invincibility frames

    // UI elements
    private scoreText?: Phaser.GameObjects.Text;
    private waveText?: Phaser.GameObjects.Text;
    private timerText?: Phaser.GameObjects.Text;
    private healthBar?: Phaser.GameObjects.Graphics;

    constructor() {
        super('GameScene');
    }

    create() {
        // Initialize game objects
        this.createPlayer();
        this.createEnemies();
        this.createProjectiles();

        // Create UI
        this.createUI();

        // Setup collisions
        this.setupCollisions();

        // Start the game
        this.startGame();

        // Handle music
        this.setupMusic();

        // Record start time
        this.gameStartTime = this.time.now;
    }

    update(time: number, delta: number) {
        if (!this.player) return;

        this.updatePlayer(delta);

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

    private createPlayer() {
        this.player = this.physics.add.sprite(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'player'
        );

        if (!this.player) return;

        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);

        // Set player data using a structured object for better type safety
        const playerData: PlayerData = {
            health: 100,
            maxHealth: 100,
            speed: 200,
            damage: 10,
            attackSpeed: 1,
            critChance: 0.05,
            range: 1,
            weapons: ['BASIC'],
            lastFired: 0
        };

        // Set all player properties at once
        Object.entries(playerData).forEach(([key, value]) => {
            this.player?.setData(key, value);
        });
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

    private createUI() {
        // Create UI elements
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            font: '24px Arial',
            color: '#ffffff'
        });

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

        this.healthBar = this.add.graphics();
        this.updateHealthBar();
    }

    private setupCollisions() {
        if (!this.player || !this.enemies || !this.projectiles) return;

        // Set up collision detection
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
    }

    private startGame() {
        this.score = 0;
        this.waveNumber = 1;
        this.waveTimer = 0;
        this.showWaveAnnouncement();

        // Reset registry values
        this.registry.set('kills', 0);
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
        this.autoAttack(delta);
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

        // Fire at nearest enemy
        this.fireProjectile(activeEnemies[0] as Phaser.Types.Physics.Arcade.GameObjectWithBody);
        this.player.setData('lastFired', time);
    }

    private fireProjectile(target: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
        if (!this.player || !this.projectiles) return;

        // Get projectile from pool
        const projectile = this.projectiles.get(this.player.x, this.player.y, 'projectile-basic') as Phaser.Physics.Arcade.Sprite;
        if (!projectile) return;

        // Set up projectile properties
        const playerDamage = this.player.getData('damage') || 10;
        const weaponType = this.player.getData('weapons')[0] || 'BASIC';
        const weaponConfig = WEAPON_TYPES[weaponType];

        if (!weaponConfig) return;

        const targetSprite = target as Phaser.GameObjects.Sprite;
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            targetSprite.x, targetSprite.y
        );

        // Activate and set up projectile
        projectile.setActive(true).setVisible(true);

        // Store data for projectile
        const projectileData: ProjectileData = {
            damage: playerDamage * weaponConfig.damage,
            range: weaponConfig.range,
            startX: this.player.x,
            startY: this.player.y,
            distance: 0
        };

        // Set all projectile properties
        Object.entries(projectileData).forEach(([key, value]) => {
            projectile.setData(key, value);
        });

        // Set velocity and rotation
        this.physics.velocityFromRotation(
            angle,
            weaponConfig.projectileSpeed,
            projectile?.body?.velocity
        );
        projectile.setRotation(angle);

        // Play sound effect
        try {
            this.sound.play('shoot', {volume: 0.5});
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
        // Calculate spawn interval based on wave number
        const spawnInterval = Math.max(500, 2000 - this.waveNumber * 100);
        const lastSpawnTime = this.registry.get('lastEnemySpawn') || 0;

        // Spawn enemy if enough time has passed
        if (time > lastSpawnTime + spawnInterval) {
            this.spawnEnemy();
            this.registry.set('lastEnemySpawn', time);
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

        // Determine available enemy types based on wave number
        const availableTypes = [
            'BASIC',
            ...(this.waveNumber >= 2 ? ['FAST'] : []),
            ...(this.waveNumber >= 3 ? ['TANK'] : []),
            ...(this.waveNumber >= 4 ? ['RANGED'] : [])
        ];

        // Select random enemy type
        const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const enemyConfig = ENEMY_TYPES[enemyType];

        if (!enemyConfig) return;

        // Scale difficulty based on wave number
        const waveScaleFactor = 1 + (this.waveNumber - 1) * 0.2;

        // Set up enemy appearance
        enemy.setActive(true).setVisible(true);
        enemy.setTexture(`enemy-${enemyType.toLowerCase()}`);
        enemy.setScale(enemyConfig.scale);
        enemy.setTint(enemyConfig.tint);

        // Create enemy data object
        const enemyData: EnemyData = {
            type: enemyType,
            health: enemyConfig.health * waveScaleFactor,
            maxHealth: enemyConfig.health * waveScaleFactor,
            damage: enemyConfig.damage * waveScaleFactor,
            speed: enemyConfig.speed,
            points: enemyConfig.points * waveScaleFactor
        };

        // Set all enemy properties
        Object.entries(enemyData).forEach(([key, value]) => {
            enemy.setData(key, value);
        });

        // Set up enemy update behavior
        enemy.update = () => this.updateEnemy(enemy);
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
        this.physics.velocityFromRotation(angle, speed, enemy?.body?.velocity);

        // Rotate enemy to face player
        enemy.setRotation(angle + Math.PI / 2);
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

        if (enemy instanceof Phaser.Physics.Arcade.Body) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else if (enemy instanceof Phaser.Physics.Arcade.StaticBody) {
            enemySprite = enemy.gameObject as Phaser.GameObjects.Sprite;
        } else {
            enemySprite = enemy as Phaser.GameObjects.Sprite;
        }

        // Now proceed with the collision handling using the sprite references
        projectileSprite.setActive(false).setVisible(false);

        // Deal damage to enemy
        const damage = projectileSprite.getData('damage') || 10;
        const health = enemySprite.getData('health') || 50;
        const newHealth = health - damage;

        enemySprite.setData('health', newHealth);

        // Play hit sound
        try {
            this.sound.play('hit', { volume: 0.3 });
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

    private handlePlayerEnemyCollision(
        player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
        enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
    ) {
        // Skip if player is invincible
        if (this.invincibilityTimer > 0) return;

        // Handle cases where we might get a Body instead of a GameObject
        let playerSprite: Phaser.GameObjects.Sprite;
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
        const health = playerSprite.getData('health') || 100;
        const newHealth = health - damage;

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
            const playerBody = playerSprite.body as Phaser.Physics.Arcade.Body;
            if (playerBody) {
                playerBody.velocity.x = knockbackVelocity.x;
                playerBody.velocity.y = knockbackVelocity.y;
            }
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

        // Add score
        const points = enemySprite.getData('points') || 10;
        this.score += points;
        this.updateScoreText();

        // Play death sound
        try {
            this.sound.play('enemy-death', { volume: 0.4 });
        } catch (error) {
            console.warn('Could not play enemy-death sound:', error);
        }

        // Death animation
        this.tweens.add({
            targets: enemySprite,
            alpha: 0,
            scale: enemySprite.scale * 1.5,
            duration: 200,
            onComplete: () => enemySprite.setActive(false).setVisible(false)
        });

        // Update kill count
        const kills = (this.registry.get('kills') || 0) + 1;
        this.registry.set('kills', kills);
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

    private updateScoreText() {
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }

    private updateTimerText() {
        if (this.timerText) {
            const remainingTime = Math.ceil((this.waveDuration - this.waveTimer) / 1000);
            this.timerText.setText(remainingTime.toString());
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

        // Update UI
        if (this.waveText) {
            this.waveText.setText(`Wave: ${this.waveNumber}`);
        }

        // Update game state in store
        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) {
            zustandStore.getState().completeWave();
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
        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) {
            const elapsedTime = Math.floor((this.time.now - this.gameStartTime) / 1000);
            const kills = this.registry.get('kills') || 0;

            zustandStore.getState().updateRunState({
                score: this.score,
                kills,
                elapsedTime
            });

            zustandStore.getState().gameOver(this.score);
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
        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) {
            zustandStore.getState().updateRunState({
                score: this.score,
                wave: this.waveNumber,
                playerHealth: this.player.getData('health'),
                maxHealth: this.player.getData('maxHealth')
            });
        }
    }
}