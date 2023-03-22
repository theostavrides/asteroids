import Phaser from "phaser";
import type Asteroids from "../scenes/Asteroids";
import Bullet from "./Bullet";
import { getSafeSpawnVec } from "../util";
import Asteroid from "./Asteroid";
import Player from "./Player";

export interface IAlienConfig {
    scene: Asteroids
}

type AlienSize = 'sml'|'med'|'lrg'
const alienSizes: AlienSize[] = ['sml', 'med','lrg']

export default class Alien extends Phaser.Physics.Arcade.Sprite {
    scene: Asteroids
    movementLoop: Phaser.Time.TimerEvent
    shootLoop: Phaser.Time.TimerEvent
    size: AlienSize
    
    constructor(cfg: IAlienConfig) {
        const spawnPosition = getSafeSpawnVec(cfg.scene)

        super(cfg.scene, spawnPosition.x, spawnPosition.y, 'alien')
        this.scene = cfg.scene
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.scene.aliens?.add(this)
        this.size = this.getRandomSize()
        this.randomizeVelocity()
        this.setScale(this.size === 'lrg' ? 1.5 : this.size === 'med' ? 1.25 : 1)

        // Initiate random movements
        this.movementLoop = this.scene.time.addEvent({
            delay: this.size === 'lrg' ? 1000 : this.size === 'med' ? 500 : 200,
            loop: true,
            callbackScope: this,
            callback: () => this.randomizeVelocity()
        })

        // Initiate random shots
        this.shootLoop = this.scene.time.addEvent({
            delay: 2000,
            loop: true,
            callbackScope: this,
            callback: () => this.randomShot()
        })
    }

    getRandomSize(){
        switch(this.scene.level) {
            case 1:
                return 'lrg'
            case 2:
                return 'med'
            default:
                return alienSizes[Phaser.Math.Between(0,2)]
        }

    }

    randomizeVelocity() {
        if (Math.random() > 0.5 || !this.scene.player) {
            this.setVelocity(
                Phaser.Math.Between(-150, 150),
                Phaser.Math.Between(-150, 150),
            )
        } else {
            const theta = (Math.PI * .25) - Math.tan((this.y - this.scene.player.y) / (this.scene.player.x - this.x))
            const vel = 150
            const velX = Math.cos(theta) * vel
            const velY = Math.sin(theta) * vel
            this.setVelocity(velX, velY)
        }
    }
    
    randomShot() {
        const bullet = new Bullet({ scene: this.scene, shooter: this })
        this.scene.sound.add('blaster', { volume: 0.1 }).play()
    }

    

    kill(){
        if (this.scene) {
            this.scene.sound.add('alien-death', { volume: 0.2 }).play()
            this.scene.nextAlienSpawnTimestamp = this.scene.time.now + Phaser.Math.Between(3000, 5000)
            this.scene.time.removeEvent(this.movementLoop)
            this.scene.time.removeEvent(this.shootLoop)
        }
        this.destroy(true)
    }

}