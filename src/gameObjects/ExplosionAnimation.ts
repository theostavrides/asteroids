import Phaser from "phaser"

import type Asteroids from "../scenes/Asteroids"

type ExplosionType = 'asteroid'|'player'
interface IConfig {
    scene: Asteroids;
    x: number;
    y: number;
    type: ExplosionType;
}

export default class ExplosionAnimation {
    scene: Asteroids
    initTime: number;
    type: ExplosionType

    constructor(cfg: IConfig){
        this.scene = cfg.scene
        this.type = cfg.type
        this.initTime = Date.now()

        if (this.type === 'asteroid') {
            const numParts = Phaser.Math.Between(3, 7)
    
            for (let i = 0; i < numParts; i ++) {            
                const rect = this.scene.add.rectangle(cfg.x, cfg.y, 5, 5, 0xffffff)
                this.scene.physics.add.existing(rect)
                rect.body.velocity.x = Phaser.Math.Between(-150, 150)
                rect.body.velocity.y = Phaser.Math.Between(-150, 150)
                
                setTimeout(() => {
                    rect.destroy()
                }, Phaser.Math.Between(300, 700))
            }
        } else {
            const numParts = Phaser.Math.Between(3, 7)
    
            for (let i = 0; i < 4; i ++) {            
                const rect = this.scene.add.rectangle(cfg.x, cfg.y, 2, 50, 0xffffff)
                rect.setRotation(Phaser.Math.Angle.Random())
                this.scene.physics.add.existing(rect)
                rect.body.velocity.x = Phaser.Math.Between(-150, 150)
                rect.body.velocity.y = Phaser.Math.Between(-150, 150)
                
                setTimeout(() => {
                    rect.destroy()
                }, Phaser.Math.Between(300, 700))
            }
        }
    }
}