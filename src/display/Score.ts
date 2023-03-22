import type Asteroids from "../scenes/Asteroids";

interface IScoreConfig {
    scene: Asteroids,
}

export default class Score {
    scene: Asteroids
    text?: Phaser.GameObjects.Text
    score: number = 0

    constructor(cfg: IScoreConfig) {
        this.scene = cfg.scene

        this.text = this.scene.add.text(30, 30,
            `Score: ${this.score}`,
            { fontSize: '30px', color: 'white' }
        )
    }

    private render(){
        this.text!.text = `Score: ${this.score}`
    }
    
    add(val: number) {
        this.score += val
        
        this.render()
    }
    
    reset() {
        this.score = 0

        this.render()
    }

}