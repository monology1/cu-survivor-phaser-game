# Arena Survivors Game - Embedded Programming Project

This is a Vampire Survivors / Brotato style game implementation, created as a project for an Embedded Programming class. The game is built using Next.js, Phaser, and Zustand for state management.

## Game Features

- **Top-down survival gameplay** where you fight waves of enemies
- **Auto-attacking weapons** that fire at nearby enemies
- **Character progression system** with level-ups and power-up selections
- **Multiple playable characters** with unique stats and abilities
- **Permanent powerup system** for long-term progression
- **Wave-based enemies** with increasing difficulty
- **Boss encounters** that test your skills

## Embedded Programming Concepts

This game demonstrates several embedded programming concepts:

1. **State-Based Programming**: Game uses a state machine architecture similar to embedded systems with different states (IDLE, PLAYING, WAVE_TRANSITION, etc.)

2. **Interrupt-Based Programming**: Game events simulate hardware interrupts:
    - Enemy spawning triggers "interrupt handlers"
    - Collision detection acts like external interrupts
    - Wave completion triggers a "service routine" (upgrade menu)

3. **Concurrent Task Management**: Simulates concurrent processes:
    - Main game loop (similar to a real-time operating system)
    - Enemy behavior systems run alongside player systems
    - Projectile and particle systems operate independently

4. **Resource Management**: Simulates resource constraints:
    - Object pooling for projectiles and effects (memory reuse)
    - Asset preloading and management
    - Optimized rendering for performance

5. **Real-Time Requirements**: Game has timing requirements:
    - Frame rate targets (60 FPS = 16.6ms per frame)
    - Animation timing and synchronization
    - Game balance through consistent update cycles

## Technical Implementation

- **Frontend**: Next.js 15 (React 19)
- **Game Engine**: Phaser 3
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Language**: TypeScript

## Project Structure

```
app/
├── components/     # React components for UI
├── game/           # Phaser game implementation
│   ├── config.ts   # Game constants and configurations
│   ├── scenes/     # Game scenes (preload, menu, game, etc.)
│   └── systems/    # Game systems (combat, upgrades, etc.)
├── store/          # Zustand state management
├── globals.css     # Global styles
└── page.tsx        # Main app component
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd arena-survivors
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Create asset directories**:
   ```
   mkdir -p public/assets/{audio,characters,enemies,items,maps,powerups,ui,upgrades,weapons}
   ```

4. **Run the development server**:
   ```
   npm run dev
   ```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Controls

- **Movement**: WASD or Arrow Keys
- **Toggle Fullscreen**: F11 or Ctrl+F
- **Pause**: Escape

## Asset Credits

For a complete project, you'll need to add your own assets or use free assets from sources like:
- [OpenGameArt](https://opengameart.org/)
- [Kenney Assets](https://kenney.nl/)
- [itch.io](https://itch.io/game-assets/free)

## License

This project is created for educational purposes. Feel free to use it as a learning resource.