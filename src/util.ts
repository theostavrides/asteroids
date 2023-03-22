import Asteroids from "./scenes/Asteroids"

export function getSafeSpawnVec(scene: Asteroids) {
    const getSafe = (direction: 'x'|'y') => {
        const scl = scene.scale[direction === 'x' ? 'width' : 'height']
        const chunk = scl / 10
    
        let min = (scene.player![direction] + (2 * chunk))            
        let max = (min + (6 * chunk))
        
        const rand = Phaser.Math.Between(min, max)
        
        return (rand > scl) ? rand - scl : rand
    }
    
    return new Phaser.Math.Vector2(getSafe('x'), getSafe('y'))        
}