import Phaser, { GameObjects } from 'phaser'
import Asteroid from '../gameObjects/Asteroid'
import Player from '../gameObjects/Player'
import GameOverMenu from '../menus/GameOverMenu'
import Score from '../display/Score'
import LivesDisplay from '../display/LivesDisplay'
import Bullet from '../gameObjects/Bullet'
import Alien from '../gameObjects/Alien'


type LevelState = 'levelEnd'|'interLevel'|'level'|'waitingSafeRespawn'|'gameOver'

export default class Asteroids extends Phaser.Scene {
    // Game Objects
    player?: Player
    asteroids?: Phaser.Physics.Arcade.Group
    bullets?: Phaser.Physics.Arcade.Group
    aliens?: Phaser.Physics.Arcade.Group
    score?: Score
    livesDisplay?: LivesDisplay
    // Level State
    level: number = 0
    levelState: LevelState = 'levelEnd'
    nextAlienSpawnTimestamp: number = 0
    nextLevelStartTime: number = 0
    gameoverMenuVisible: boolean = false
    lastDeathTimestamp: number = 0
    // Input
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    // Misc
    bgMusicStarted: boolean = false

    constructor() {
        super('GameScene')
    }
  
    preload() {
        this.load.image('triangle', 'assets/triangle2.png')
        this.load.image('asteroid1', 'assets/asteroid1.png')
        this.load.image('asteroid2', 'assets/asteroid2.png')
        this.load.image('alien', 'assets/alien.png')

        this.load.audio('bgmusic', 'assets/audio/bgmusic.mp3');
        this.load.audio('blaster', 'assets/audio/blaster.mp3');
        this.load.audio('explosion', 'assets/audio/explosion.mp3');
        this.load.audio('meow', 'assets/audio/meow.mp3');
        this.load.audio('alien-death', 'assets/audio/alien-death.wav');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys()  
        
        // Game Objects
        this.player = new Player({ scene: this })
        this.asteroids = this.physics.add.group()  
        this.bullets = this.physics.add.group()
        this.aliens = this.physics.add.group()

        // Displays
        this.score = new Score({ scene: this })
        this.livesDisplay = new LivesDisplay({ scene: this })
        
        // Collisions
        this.physics.add.overlap(this.player, this.asteroids, () => this.handleDeath())

        this.physics.add.overlap(this.player, this.aliens, () => this.handleDeath())

        this.physics.add.overlap(this.bullets, this.asteroids, (bullet, asteroid) => {
            const aster = asteroid as Asteroid
            const bull = bullet as Bullet
            
            if (bull.shooter instanceof Player) {
                this.score?.add(10)
            }

            aster.kill()
            bull.destroy()
            
            if (this.asteroids?.getLength() === 0) {
                this.levelState = 'interLevel'
            }
        })

        this.physics.add.overlap(this.player, this.bullets, (_, bullet) => {
            const bull = bullet as Bullet
            if (bull.shooter instanceof Alien) {
                this.handleDeath()
                bull.destroy()
            }
        })

        this.physics.add.overlap(this.aliens, this.bullets, (alien, bullet) => {
            const bull = bullet as Bullet
            const ali = alien as Alien

            if (bull.shooter instanceof Player) {
                ali.kill()
                bull.destroy()
                this.score?.add(50)
            }
        })

        this.physics.add.overlap(this.aliens, this.asteroids, (alien, asteroid) => {
            const ali = alien as Alien
            const aster = asteroid as Asteroid
            ali.kill()
            aster.kill()
            if (this.asteroids?.getLength() === 0) {
                this.levelState = 'interLevel'
            }
        })

    }
  
    update(time: number, delta: number): void {   
        this.player?.handleInput(time)

        switch(this.levelState) {
            case 'levelEnd': 
                this.nextLevelStartTime = this.level > 0 ? time + 1000 : time
                this.levelState = 'interLevel'
                break
            case 'interLevel':
                if (this.nextLevelStartTime <= time) {
                    this.levelState = 'level'
                    this.level++
                    this.spawnNewAsteroids(this.level + 3)
                    this.nextAlienSpawnTimestamp = time + (3 * 1000)
                }
                break
            case 'level':
                 if (this.nextAlienSpawnTimestamp <= time && this.aliens?.getLength() === 0) {                    
                    // spawn alien
                    const alien = new Alien({ scene: this })
                }
                break
            case 'waitingSafeRespawn':
                if (this.player?.attemptSafeRespawn()) {
                    this.levelState = 'level'
                }
                break
            case 'gameOver':
                this.handleGameOver()
                break
        }

        if (this.bgMusicStarted === false) {
            if (
                this.cursors?.down.isDown || this.cursors?.left.isDown || this.cursors?.right.isDown ||
                this.cursors?.up.isDown || this.cursors?.space.isDown
            ) {
                this.bgMusicStarted = true
                this.sound.add('bgmusic', { volume: 0.5, loop: true }).play()
            }
        }

        this.physics.world.wrap(this.player)
        this.physics.world.wrap(this.asteroids)
        this.physics.world.wrap(this.bullets)
        this.physics.world.wrap(this.aliens)
    }

    handleDeath(){
        if (!this.player) return
        if (Date.now() - this.lastDeathTimestamp < 1000) return

        this.lastDeathTimestamp = Date.now()
        this.player.kill()
        
        if (this.player.lives > 0) {
            this.levelState = 'waitingSafeRespawn'

        } else {
            // game over
            this.levelState = 'gameOver'
        }
    }

    handleGameOver(){
        if (this.gameoverMenuVisible) return
        this.gameoverMenuVisible = true
        
        const gameOverMenu = new GameOverMenu({ scene: this, onNewGame: () => {
            this.time.removeAllEvents()
            this.asteroids?.children.each(a => a.destroy())
            this.aliens?.children.each(al => al.destroy())
            this.bullets?.children.each(b => b.destroy())
            this.player?.reset()
            this.level = 0
            this.levelState = 'levelEnd'
            this.score?.reset()
            this.gameoverMenuVisible = false
        }})
    }

    spawnNewAsteroids(numAsteroids: number){      
        for (let i = 0; i < numAsteroids; i++) {            
            const asteroid = new Asteroid({ scene: this, size: 'lrg' })
            asteroid.randomSafeSpawn()
        }
    }

    // --------------------------------- Util -----------------------------------

    getMiddlePoint(){
        return new Phaser.Math.Vector2(this.scale.width / 2, this.scale.height / 2)
    }
}