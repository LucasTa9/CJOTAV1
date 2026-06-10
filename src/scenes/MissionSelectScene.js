export default class MissionSelectScene extends Phaser.Scene {
    constructor() { super('MissionSelectScene'); }

    create() {
        // Mantem a música do menu tocando
        let bgm = this.sound.get('bgm_menu');
        if (!bgm) {
            bgm = this.sound.add('bgm_menu', { loop: true, volume: 0.3 });
            bgm.play();
        } else if (!bgm.isPlaying) {
            bgm.play();
        }

        // Fundo
        this.add.image(400, 300, 'bg_menu').setDisplaySize(800, 600);
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6); 

        this.add.text(400, 60, 'SELECIONAR MISSÃO', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5);

     
        // Botões de Missão
        // A direção de cada botão passa um MissaoId diferente para a Cutscene, que envia para a GameScene
        
        let btnM1 = this.add.text(400, 160, 'MISSÃO 1: A Fuga', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btnM1.on('pointerdown', () => { this.sound.play('sfx_click'); this.scene.start('CutsceneScene', { missaoId: 0 }); });

        let btnM2 = this.add.text(400, 240, 'MISSÃO 2: O Elevador', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btnM2.on('pointerdown', () => { this.sound.play('sfx_click'); this.scene.start('CutsceneScene', { missaoId: 1 }); });

        let btnM3 = this.add.text(400, 320, 'MISSÃO 3: O Subsolo', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btnM3.on('pointerdown', () => { this.sound.play('sfx_click'); this.scene.start('CutsceneScene', { missaoId: 2 }); });

        // Destaque vermelho para alertar sobre a Batalha Final
        let btnM4 = this.add.text(400, 400, 'MISSÃO 4: A Batalha Final', { fontSize: '24px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btnM4.on('pointerdown', () => { this.sound.play('sfx_click'); this.scene.start('CutsceneScene', { missaoId: 3 }); });

        // Botão de Retorno
        let btnVoltar = this.add.text(400, 520, 'VOLTAR', { fontSize: '20px', fill: '#fff', backgroundColor: '#333333', padding: {x: 10, y: 10} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btnVoltar.on('pointerover', () => btnVoltar.setStyle({ fill: '#ff0000' }));
        btnVoltar.on('pointerout', () => btnVoltar.setStyle({ fill: '#fff' }));
        btnVoltar.on('pointerdown', () => { this.sound.play('sfx_click'); this.scene.start('MainMenu'); });
    }
}