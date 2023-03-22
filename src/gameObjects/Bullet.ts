import Phaser from "phaser"
import type Asteroids from "../scenes/Asteroids"
import Player from "./Player";
import type Alien from "./Alien";

type Shooter = Player|Alien

interface IBulletConfig { 
    scene: Asteroids;
    shooter: Shooter;
}

const size = 8
const color = 0xffffff
const velocity = 800

export default class Bullet extends Phaser.GameObjects.Rectangle {
    scene: Asteroids
    createdAt: number
    shooter: Shooter

    constructor(cfg: IBulletConfig){
        super(cfg.scene, cfg.shooter.x, cfg.shooter.y, size, size, color)
        this.shooter = cfg.shooter
        this.scene = cfg.scene
        this.createdAt = Date.now()
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.scene.bullets?.add(this)

        const svx = this.shooter.body.velocity.x
        const svy = this.shooter.body.velocity.y
        
        const rotation = this.shooter instanceof Player 
            ? this.shooter.rotation 
            : (Math.PI * 2 * Math.random()) - Math.PI

        const bvx = Math.sin(rotation) * velocity
        const bvy = - Math.cos(rotation) * velocity

        this.body.velocity.x = svx + bvx
        this.body.velocity.y = svy + bvy

        setTimeout(() => {
            this.destroy(true)
        }, 800)
    }
}