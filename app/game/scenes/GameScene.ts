import * as Phaser from 'phaser';
import { ENEMY_TYPES, WEAPON_TYPES } from '../config';

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
        const music = this.sound.get('main-menu');
        if (music?.isPlaying) music.stop();

        const battleMusic = this.sound.get('music-battle') || this.sound.add('music-battle', { loop: true, volume: 0.5 });
        if (!battleMusic.isPlaying) battleMusic.play();

        this.gameStartTime = this.time.now;
    }

    update(time: number, delta: number) {
        if (!this.player) return;

        this.updatePlayer(delta);

        // Update wave timer and invincibility
        this.waveTimer += delta;
        if (this.invincibilityTimer > 0) this.invincibilityTimer -= delta;

        this.updateTimerText();

        if (this.waveTimer >= this.waveDuration) {
            this.completeWave();
        }

        this.updateEnemySpawning(time);
        this.updateGameStore();
    }

    private createPlayer() {
        this.player = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.setData({
            health: 100,
            maxHealth: 100,
            speed: 200,
            damage: 10,
            attackSpeed: 1,
            critChance: 0.05,
            range: 1,
            weapons: ['BASIC'],
            lastFired: 0
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
            runChildUpdate: true
        });
    }

    private createUI() {
        this.scoreText = this.add.text(16, 16, 'Score: 0', { font: '24px Arial', color: '#ffffff' });
        this.waveText = this.add.text(this.cameras.main.width - 16, 16, 'Wave: 1', { font: '24px Arial', color: '#ffffff' }).setOrigin(1, 0);
        this.timerText = this.add.text(this.cameras.main.width / 2, 16, '60', { font: '24px Arial', color: '#ffffff' }).setOrigin(0.5, 0);
        this.healthBar = this.add.graphics();
        this.updateHealthBar();
    }

    private setupCollisions() {
        if (!this.player || !this.enemies || !this.projectiles) return;

        this.physics.add.overlap(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, undefined, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);
    }

    private startGame() {
        this.score = 0;
        this.waveNumber = 1;
        this.waveTimer = 0;
        this.showWaveAnnouncement();
    }

    private updatePlayer(delta: number) {
        if (!this.player || !this.input.keyboard) return;

        const cursors = this.input.keyboard.createCursorKeys();
        const speed = this.player.getData('speed');
        this.player.setVelocity(0);

        if (cursors.left.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('A'))) {
            this.player.setVelocityX(-speed);
        } else if (cursors.right.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('D'))) {
            this.player.setVelocityX(speed);
        }

        if (cursors.up.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('W'))) {
            this.player.setVelocityY(-speed);
        } else if (cursors.down.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('S'))) {
            this.player.setVelocityY(speed);
        }

        if (this.player.body) this.player.body.velocity.normalize().scale(speed);

        this.autoAttack(delta);
    }

    private autoAttack(delta: number) {
        if (!this.player || !this.enemies) return;

        const time = this.time.now;
        const weapons = this.player.getData('weapons');
        const lastFired = this.player.getData('lastFired');
        const attackSpeed = this.player.getData('attackSpeed');
        const weaponType = weapons[0]; // Simplified to first weapon
        const weaponConfig = WEAPON_TYPES[weaponType];

        if (!weaponConfig || time <= lastFired + weaponConfig.fireRate / attackSpeed) return;

        const activeEnemies = this.enemies.getChildren().filter(e => e.active);
        if (activeEnemies.length === 0) return;

        activeEnemies.sort((a, b) =>
            Phaser.Math.Distance.Between(this.player!.x, this.player!.y, (a as Phaser.GameObjects.Sprite).x, (a as Phaser.GameObjects.Sprite).y) -
            Phaser.Math.Distance.Between(this.player!.x, this.player!.y, (b as Phaser.GameObjects.Sprite).x, (b as Phaser.GameObjects.Sprite).y)
        );

        this.fireProjectile(activeEnemies[0] as Phaser.Types.Physics.Arcade.GameObjectWithBody);
        this.player.setData('lastFired', time);
    }

    private fireProjectile(target: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
        if (!this.player || !this.projectiles) return;

        const projectile = this.projectiles.get(this.player.x, this.player.y, 'projectile-basic');
        if (!projectile) return;

        const playerDamage = this.player.getData('damage');
        const weaponType = this.player.getData('weapons')[0];
        const weaponConfig = WEAPON_TYPES[weaponType];
        const targetSprite = target as Phaser.GameObjects.Sprite;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetSprite.x, targetSprite.y);

        projectile.setActive(true).setVisible(true);
        projectile.setData({ damage: playerDamage * weaponConfig.damage, range: weaponConfig.range });
        this.physics.velocityFromRotation(angle, weaponConfig.projectileSpeed, projectile.body.velocity);
        projectile.setRotation(angle);
        this.sound.play('shoot', { volume: 0.5 });
    }

    private updateEnemySpawning(time: number) {
        const spawnInterval = Math.max(500, 2000 - this.waveNumber * 100);
        const lastSpawnTime = this.registry.get('lastEnemySpawn') || 0;

        if (time > lastSpawnTime + spawnInterval) {
            this.spawnEnemy();
            this.registry.set('lastEnemySpawn', time);
        }
    }

    private spawnEnemy() {
        if (!this.enemies) return;

        const spawnPosition = this.getRandomSpawnPosition();
        const enemy = this.enemies.get(spawnPosition.x, spawnPosition.y);
        if (!enemy) return;

        const availableTypes = ['BASIC', ...(this.waveNumber >= 2 ? ['FAST'] : []), ...(this.waveNumber >= 3 ? ['TANK'] : []), ...(this.waveNumber >= 4 ? ['RANGED'] : [])];
        const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const enemyConfig = ENEMY_TYPES[enemyType];
        const waveScaleFactor = 1 + (this.waveNumber - 1) * 0.2;

        enemy.setActive(true).setVisible(true);
        enemy.setTexture(`enemy-${enemyType.toLowerCase()}`).setScale(enemyConfig.scale).setTint(enemyConfig.tint);
        enemy.setData({
            type: enemyType,
            health: enemyConfig.health * waveScaleFactor,
            maxHealth: enemyConfig.health * waveScaleFactor,
            damage: enemyConfig.damage * waveScaleFactor,
            speed: enemyConfig.speed,
            points: enemyConfig.points * waveScaleFactor
        });

        enemy.update = () => {
            if (this.player) {
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                this.physics.velocityFromRotation(angle, enemy.getData('speed'), enemy.body.velocity);
                enemy.setRotation(angle + Math.PI / 2);
            }
        };
    }

    private getRandomSpawnPosition() {
        const padding = 50;
        const camera = this.cameras.main;
        const bounds = {
            left: camera.scrollX - padding,
            right: camera.scrollX + camera.width + padding,
            top: camera.scrollY - padding,
            bottom: camera.scrollY + camera.height + padding
        };
        const edge = Math.floor(Math.random() * 4);
        return [
            { x: Phaser.Math.Between(bounds.left, bounds.right), y: bounds.top },
            { x: bounds.right, y: Phaser.Math.Between(bounds.top, bounds.bottom) },
            { x: Phaser.Math.Between(bounds.left, bounds.right), y: bounds.bottom },
            { x: bounds.left, y: Phaser.Math.Between(bounds.top, bounds.bottom) }
        ][edge];
    }

    private handleProjectileEnemyCollision(projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
        (projectile as Phaser.GameObjects.Sprite).setActive(false).setVisible(false);
        const damage = (projectile as Phaser.GameObjects.Sprite).getData('damage');
        const newHealth = (enemy as Phaser.GameObjects.Sprite).getData('health') - damage;
        (enemy as Phaser.GameObjects.Sprite).setData('health', newHealth);

        this.sound.play('hit', { volume: 0.3 });
        if (newHealth <= 0) {
            this.killEnemy(enemy);
        } else {
            this.tweens.add({ targets: enemy, alpha: 0.5, duration: 50, yoyo: true });
        }
    }

    private handlePlayerEnemyCollision(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
        if (this.invincibilityTimer > 0) return;

        const damage = (enemy as Phaser.GameObjects.Sprite).getData('damage');
        const newHealth = (player as Phaser.GameObjects.Sprite).getData('health') - damage;
        (player as Phaser.GameObjects.Sprite).setData('health', newHealth);
        this.invincibilityTimer = 500; // 0.5 seconds invincibility

        this.sound.play('player-damage', { volume: 0.5 });
        this.cameras.main.shake(100, 0.01);
        this.updateHealthBar();

        if (newHealth <= 0) {
            this.gameOver();
        } else {
            this.tweens.add({ targets: player, alpha: 0.5, duration: 100, yoyo: true, repeat: 2 });
            const angle = Phaser.Math.Angle.Between((enemy as Phaser.GameObjects.Sprite).x, (enemy as Phaser.GameObjects.Sprite).y, (player as Phaser.GameObjects.Sprite).x, (player as Phaser.GameObjects.Sprite).y);
            const knockbackVelocity = new Phaser.Math.Vector2();
            this.physics.velocityFromRotation(angle, 300, knockbackVelocity);
            const playerBody = (player as Phaser.GameObjects.Sprite).body!;
            playerBody.velocity.x = knockbackVelocity.x;
            playerBody.velocity.y = knockbackVelocity.y;
        }
    }

    private killEnemy(enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
        this.score += (enemy as Phaser.GameObjects.Sprite).getData('points');
        this.updateScoreText();
        // this.sound.play('enemy-death', { volume: 0.4 });

        this.tweens.add({
            targets: enemy,
            alpha: 0,
            scale: (enemy as Phaser.GameObjects.Sprite).scale * 1.5, // Fixed scale syntax
            duration: 200,
            onComplete: () => (enemy as Phaser.GameObjects.Sprite).setActive(false).setVisible(false)
        });

        const kills = (this.registry.get('kills') || 0) + 1;
        this.registry.set('kills', kills);
    }

    private updateHealthBar() {
        if (!this.healthBar || !this.player) return;

        const health = this.player.getData('health');
        const maxHealth = this.player.getData('maxHealth');
        const percentage = Math.max(0, health / maxHealth);

        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 0.5).fillRect(10, 50, 200, 20);
        this.healthBar.fillStyle(0xff0000, 1).fillRect(10, 50, 200 * percentage, 20);
    }

    private updateScoreText() {
        if (this.scoreText) this.scoreText.setText(`Score: ${this.score}`);
    }

    private updateTimerText() {
        if (this.timerText) this.timerText.setText(Math.ceil((this.waveDuration - this.waveTimer) / 1000).toString());
    }

    private showWaveAnnouncement() {
        const waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `Wave ${this.waveNumber}`, {
            font: 'bold 48px Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

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
        this.waveNumber++;
        this.waveTimer = 0;

        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) zustandStore.getState().completeWave();

        this.scene.pause();
        this.sound.play('level-up', { volume: 0.6 });

        // Example: Transition to upgrade scene (uncomment and adjust as needed)
        // this.scene.launch('UpgradeScene');
    }

    private gameOver() {
        const zustandStore = this.game.registry.get('zustandStore');
        if (zustandStore) {
            const elapsedTime = Math.floor((this.time.now - this.gameStartTime) / 1000);
            const kills = this.registry.get('kills') || 0;
            zustandStore.getState().updateRunState({ score: this.score, kills, elapsedTime });
            zustandStore.getState().gameOver(this.score);
        }

        this.scene.pause();
        this.sound.play('game-over', { volume: 0.6 });

        // Example: Transition to game over scene (uncomment and adjust as needed)
        // this.scene.start('GameOverScene');
    }

    private updateGameStore() {
        if (!this.player) return;

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