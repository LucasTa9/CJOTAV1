import ChefaoFinal from '../entities/ChefaoFinal.js';

export default class LutaFinal {
    constructor(scene, startX) {
        this.scene = scene;
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        // Tonalidade de cor extrema (setTint Vermelho Sangue = 0x330000) aplicada globalmente à textura
        this.background = this.scene.add.image(this.startX + 400, 300, 'bg_subsolo').setDisplaySize(800, 600).setDepth(-1).setTint(0x330000); 
        this.visualChao = this.scene.add.image(this.startX + 400, 560, 'chao_subsolo').setDisplaySize(800, 80).setDepth(0);

        
        this.boss = new ChefaoFinal(this.scene, this.startX + 150, 180, this.startX);
    }

    // A Adalgusta voa num eixo superior que Mauro não alcança fisicamente. 
    // Logo, o humano devolve null em todas as interações
    checarInteracoes(player) { 
        return null; 
    }

    checarInteracoesTobi(pet) {
        // Trava para evitar morte do jogador enquanto hackeia: A tooltip [E] só surge se a Boss estiver descansando.
        if (this.boss.estado !== 'EXAUSTO') return null; 
        
        let distX = Math.abs(pet.x - this.boss.x);
        let distY = Math.abs(pet.y - this.boss.y);
        
        if (distX < 180 && distY < 350) { 
            this.boss.textoDica = "[E] DESTRUIR NÚCLEO"; 
            this.boss.tipoAcao = "HACKEAR_BOSS"; 
            return this.boss; 
        }
        return null;
    }

    update() {
        // Transmite o Lifecycle do Phaser (update/frame) para dentro do Boss
        if (this.boss) {
            this.boss.update();
        }
    }

    destruir() {
        this.background.destroy(); 
        this.visualChao.destroy();
        
        // Assegura o Garbage Collection (Varredura de lixo) caso a classe morra
        if (this.boss) {
            this.boss.destruir();
        }
    }
}