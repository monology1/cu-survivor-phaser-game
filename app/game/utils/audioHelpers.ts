/**
 * Safely plays a sound with error handling
 * @param scene The Phaser scene
 * @param key The sound key to play
 * @param config Optional sound config
 * @returns The sound object if successful, null if not
 */
export function playSoundSafe(
    scene: Phaser.Scene,
    key: string,
    config?: Phaser.Types.Sound.SoundConfig
): Phaser.Sound.BaseSound | null {
    if (!scene || !scene.sound) return null;

    try {
        // Check if sound exists in cache
        if (!scene.sound.get(key)) {
            // If sound isn't loaded yet, log and return
            if (!scene.cache.audio.exists(key)) {
                console.warn(`Sound "${key}" not found in cache`);
                return null;
            }

            // Add the sound if it exists in cache but isn't created yet
            return scene.sound.add(key, config);
        }

        // Get existing sound
        const sound = scene.sound.get(key);

        // Only play if not already playing
        if (sound && !sound.isPlaying) {
            sound.play(config);
        }

        return sound;
    } catch (error) {
        console.warn(`Error playing sound "${key}":`, error);
        return null;
    }
}

/**
 * Safely stops a sound with error handling
 * @param scene The Phaser scene
 * @param key The sound key to stop
 */
export function stopSoundSafe(scene: Phaser.Scene, key: string): void {
    if (!scene || !scene.sound) return;

    try {
        const sound = scene.sound.get(key);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    } catch (error) {
        console.warn(`Error stopping sound "${key}":`, error);
    }
}

/**
 * Safely sets global volume
 * @param scene The Phaser scene
 * @param volume Volume between 0 and 1
 */
export function setVolumeSafe(scene: Phaser.Scene, volume: number): void {
    if (!scene || !scene.sound || typeof volume !== 'number') return;

    try {
        // Clamp volume between 0 and 1
        const safeVolume = Math.max(0, Math.min(1, volume));

        // Use a generic approach that works with all sound managers
        try {
            // First try to set global volume if supported
            (scene.sound as any).volume = safeVolume;
        } catch (err) {
            // Fallback to setting volume on individual sounds
            const playingSounds = scene.sound.getAllPlaying();
            for (let i = 0; i < playingSounds.length; i++) {
                try {
                    // Use type assertion to avoid TypeScript errors
                    (playingSounds[i] as any).volume = safeVolume;
                } catch (soundErr) {
                    // Ignore errors for individual sounds
                }
            }
        }
    } catch (error) {
        console.warn('Error setting volume:', error);
    }
}

/**
 * Type guard to check if the sound manager is using Web Audio API
 * Does this in a TypeScript-friendly way
 */
export function isWebAudioSoundManager(
    sound: Phaser.Sound.BaseSoundManager
): boolean {
    // Use a safer approach with property detection
    return sound !== null &&
        typeof sound === 'object' &&
        'context' in sound;
}

/**
 * Initializes the audio system safely when user interacts
 * @param scene The Phaser scene
 */
export function initAudioOnUserInteraction(scene: Phaser.Scene): void {
    if (!scene || !scene.sound) return;

    try {
        // Check if audio is locked (needs user interaction)
        if (scene.sound.locked) {
            // Create a one-time listener for any user interaction
            const unlockAudio = () => {
                // Try to unlock the audio
                scene.sound.unlock();

                // Remove the listeners once audio is unlocked
                scene.input.off('pointerdown', unlockAudio);
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('keydown', unlockAudio);

                console.log('Audio unlocked by user interaction');
            };

            // Add listeners to various events that might indicate user interaction
            scene.input.on('pointerdown', unlockAudio);
            document.addEventListener('click', unlockAudio);
            document.addEventListener('keydown', unlockAudio);
        }

        // For Web Audio API, handle resuming AudioContext if it exists
        if (isWebAudioSoundManager(scene.sound)) {
            // Use type assertion to avoid TypeScript errors
            const webAudioManager = scene.sound as any;

            if (webAudioManager.context &&
                webAudioManager.context.state === 'suspended') {

                const resumeAudio = () => {
                    if (webAudioManager.context &&
                        webAudioManager.context.resume) {

                        webAudioManager.context.resume().then(() => {
                            console.log('AudioContext resumed successfully');
                        }).catch((err: any) => {
                            console.warn('AudioContext resume failed:', err);
                        });
                    }
                };

                // Add event listeners for user interactions that can resume audio
                scene.input.on('pointerdown', resumeAudio);
                document.addEventListener('click', resumeAudio, { once: true });
                document.addEventListener('keydown', resumeAudio, { once: true });
            }
        }
    } catch (error) {
        console.warn('Error setting up audio initialization:', error);
    }
}