import type Asteroids from "../scenes/Asteroids"
import Bullet from "./Bullet"
import ExplosionAnimation from "./ExplosionAnimation"

interface IPlayerConfig { scene: Asteroids }

const playerConstants = {
    thrusterAccel: 800,
    maxVelocity: 800,
    fireRate: 200,
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
    lives: number = 3
    scene: Asteroids
    lastShotTime: number = 0

    constructor(cfg: IPlayerConfig) {
        let { scene } = cfg
        super(scene, scene.scale.width / 2, scene.scale.height / 2, 'triangle')
        this.scene = scene
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.scene.livesDisplay?.update(this.lives)
        this.setMaxVelocity(playerConstants.maxVelocity, playerConstants.maxVelocity)
        this.centerPlayer()
    }

    centerPlayer(){
        this.setOrigin(0.5, 0.51)
    }

    attemptSafeRespawn(){
        const mid = this.scene.getMiddlePoint()
        const closestAsteroid = this.scene.physics.closest(mid, this.scene.asteroids!.getChildren())
        const distance = Phaser.Math.Distance.Between(
            mid.x, 
            mid.y, 
            (closestAsteroid as Phaser.Physics.Arcade.Sprite).x,
            (closestAsteroid as Phaser.Physics.Arcade.Sprite).y,
        )
        const safeSpawnDistance = this.scene.scale.width / 8

        if (distance >= safeSpawnDistance) {
            this.enableBody(true, mid.x, mid.y, true, true)
            return true
        } else {
            return false
        }
    }

    reset(){
        this.lives = 3
        this.scene.livesDisplay?.update(this.lives)
        const mid = this.scene.getMiddlePoint()
        this.enableBody(true, mid.x, mid.y, true, true)
    }

    kill(){
        if (this.lives > 0) {
            this.scene.sound.add('explosion', { volume: 0.1, detune: 800 }).play()

            const explosion = new ExplosionAnimation({ 
                scene: this.scene, 
                x: this.x,
                y: this.y,
                type: 'player',
            })
    

            this.disableBody(true, true)
            this.lives--
            this.scene.livesDisplay?.update(this.lives)
        }
    }

    handleInput(time: number){
        if (this.lives === 0) return
        if (this.scene.levelState !== 'level') return

        const cursors = this.scene.cursors!
        const { rotation } = this

        if (cursors.right.isDown) this.angle += 6
        
        if (cursors.left.isDown) this.angle -= 6
        
        if (cursors.up.isDown) {
            this.setAccelerationX(Math.sin(rotation) * playerConstants.thrusterAccel)
            this.setAccelerationY(- Math.cos(rotation) * playerConstants.thrusterAccel)
        } else {
            this.setAccelerationY(0)
            this.setAccelerationX(0)
        }
        if (cursors.space.isDown) {
            if (time - this.lastShotTime > playerConstants.fireRate) {
                this.shoot()
                this.lastShotTime = time
            }
        }
    }

    shoot(){
        const bullet = new Bullet({ scene: this.scene, shooter: this })
        this.scene.sound.add('blaster', { volume: 0.1 }).play()

    }

}