export default class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    create() {
        // Arte de fundo da tela de Derrota
        this.add.image(400, 300, 'bg_gameover').setDisplaySize(800, 600);

       
        // Botão de Tentar Novamente  ou Selecionar Missão
        
        let btnMissoes = this.add.text(400, 460, 'SELECIONAR MISSÃO', { 
            fontSize: '24px', fill: '#ffffff', backgroundColor: '#333333', padding: {x: 20, y: 10} 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Transita para a tela de escolher a missão
        btnMissoes.on('pointerdown', () => { this.sound.play('sfx_click'); this.scene.start('MissionSelectScene'); });
        
        // Hover , se passar o mousse verde
        btnMissoes.on('pointerover', () => btnMissoes.setStyle({ fill: '#2bb91e' }));
        btnMissoes.on('pointerout', () => btnMissoes.setStyle({ fill: '#ffffff' }));

       
        // botão Voltar ao Menu Principal
       
        let btnMenu = this.add.text(400, 530, 'MENU PRINCIPAL', { 
            fontSize: '24px', fill: '#ffffff', backgroundColor: '#8b0000', padding: {x: 20, y: 10} 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        btnMenu.on('pointerdown', () => { this.sound.play('sfx_click'); this.scene.start('MainMenu'); });
        btnMenu.on('pointerover', () => btnMenu.setStyle({ fill: '#ff0000' }));
        btnMenu.on('pointerout', () => btnMenu.setStyle({ fill: '#ffffff' }));
    }
}