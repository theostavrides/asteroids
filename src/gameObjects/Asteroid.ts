import Phaser from 'phaser'
import type Asteroids from '../scenes/Asteroids'
import ExplosionAnimation from './ExplosionAnimation'
import { getSafeSpawnVec } from '../util'

export type AsteroidSize = 'sml'|'med'|'lrg'
export interface IAsteroidParams { scene: Asteroids, size?: AsteroidSize }
const sizeToScaleMap: { [K in AsteroidSize]: number } = { sml: 0.7, med: 1.1, lrg: 1.5 }

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
    scene: Asteroids
    size: AsteroidSize

    constructor(cfg: IAsteroidParams){
        const { scene, size = 'lrg'} = cfg
        super(scene, 0, 0, 'asteroid1')
        this.scene = scene
        this.size = size
        this.setScale(sizeToScaleMap[ size ])   
        this.setRotation(Phaser.Math.Between(-Math.PI, Math.PI))     
    }
    
    randomSafeSpawn(){
        const vec = getSafeSpawnVec(this.scene)
        this.setX(vec.x)
        this.setY(vec.y)
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.scene.asteroids!.add(this)
        
        const maxVelocity = 50
        const getRandomVelocity = () => (Math.random() - 0.5) * 2 * maxVelocity
        this.setVelocity(getRandomVelocity(), getRandomVelocity())
        this.setCircle(this.height / 2)
    }

    spawnBabies() {
        const parent = this
        const getBabySize = () => parent.size === 'lrg' ? 'med' : 'sml'

        const getChildVelocity = (direction: 'x'|'y') => {
            const pv = parent.body.velocity[direction]
            const rv = (Math.random() * 2 - 1) * 150
            return pv + rv
        }

        for (let i = 0; i < 2; i++) {
            const childAsteroid = new Asteroid({ scene: parent.scene, size: getBabySize() })
            childAsteroid.setX(parent.x)
            childAsteroid.setY(parent.y)
            childAsteroid.scene.add.existing(childAsteroid)
            childAsteroid.scene.physics.add.existing(childAsteroid)
            childAsteroid.scene.asteroids!.add(childAsteroid)
            childAsteroid.setVelocity(getChildVelocity('x'), getChildVelocity('y'))
            childAsteroid.setCircle(childAsteroid.height / 2)   
        }
    }

    playExplosionSound() {
        let detune = - 500
        
        const randomDetuneConst = (Math.random() * 2 - 1) * 200

        if (this.size === 'med') detune += 500 + randomDetuneConst
        if (this.size === 'sml') detune += 1000 + randomDetuneConst

        this.scene.sound.add('explosion', { detune, volume: 0.1 }).play()
    }

    kill(){
        this.playExplosionSound()

        const explosion = new ExplosionAnimation({ 
            scene: this.scene, 
            x: this.x,
            y: this.y,
            type: 'asteroid',
        })

        if (this.size === 'lrg' || this.size === 'med') {
            this.spawnBabies()
        }

        this.destroy(true)
    }
}

export default Asteroid