import type Asteroids from "../scenes/Asteroids";

interface IGameOverMenuConfig {
    scene: Asteroids,
    onNewGame: () => void,
}
export default class GameOverMenu {
    onNewGame: () => void
    scene: Asteroids
    spacing = 100
    menuSize = 300
    x: number = 0
    y: number = 0

    constructor(cfg: IGameOverMenuConfig) {
        this.scene = cfg.scene 
        this.onNewGame = cfg.onNewGame
        this.initMenuPosition()
        this.initText()
    }

    private initMenuPosition() {
        const { x: midX, y: midY } = this.scene.getMiddlePoint()
        this.x = midX - (this.menuSize / 2)
        this.y = midY - (this.menuSize / 4)
    }

    private initText(){
        // Game Over
        const gameOverText = this.scene.add.text(this.x, this.y, 'Game Over', { 
            fontSize: '50px', 
            color: 'white',
            fixedWidth: this.menuSize,
            align: 'center',
        });

        // New Game
        const newGameText = this.scene.add.text(gameOverText.x, gameOverText.y + this.spacing, 'New Game', { 
            fontSize: '40px', 
            color: 'white',
            fixedWidth: this.menuSize,
            align: 'center',
        });
        
        newGameText.setInteractive()
        newGameText.on('pointerover', () => newGameText.setStyle({ color: '#bbb' }))
        newGameText.on('pointerout', () => newGameText.setStyle({ color: 'white' }))
        newGameText.on('pointerdown', () => {
            gameOverText.destroy()
            newGameText.destroy()
            this.onNewGame()
        })
    }
}