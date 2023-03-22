import type Asteroids from "../scenes/Asteroids";

interface ILivesConfig {
    scene: Asteroids,
}

export default class LivesDisplay {
    scene: Asteroids
    text?: Phaser.GameObjects.Text

    constructor(cfg: ILivesConfig) {
        this.scene = cfg.scene 
        
        this.text = this.scene.add.text(
            30, 
            80, 
            `Lives: ${3}`, 
            { fontSize: '30px', color: 'white' }
        )
    }

    update(lives: number){
        if (!this.text) {
        } else {
            this.text!.text = `Lives: ${lives}`
        }
    }
}