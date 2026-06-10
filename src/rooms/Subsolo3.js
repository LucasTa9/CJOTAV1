import EnemyRobot from '../entities/EnemyRobot.js';

export default class Subsolo3 {
    constructor(scene, startX) {
        this.scene = scene;
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        // Tonalidade base ainda mais escura (0x888899) preparando o clímax
        this.background = this.scene.add.image(this.startX + 400, 300, 'bg_subsolo').setDisplaySize(800, 600).setDepth(-1).setTint(0x888899);
        this.visualChao = this.scene.add.image(this.startX + 400, 560, 'chao_subsolo').setDisplaySize(800, 80).setDepth(0);

        //Engrenagem
        this.obs1 = this.scene.add.image(this.startX + 250, 300, 'obstaculo_engrenagem').setDisplaySize(80, 80).setDepth(1);
        this.scene.physics.add.existing(this.obs1, false);
        this.obs1.body.setAllowGravity(false); 
        this.obs1.body.setImmovable(true); 
        
        // Ajuste da hitbox circular
        let raio = this.obs1.width * 0.35; 
        let offX = (this.obs1.width / 2) - raio;
        let offY = (this.obs1.height / 2) - raio;
        this.obs1.body.setCircle(raio, offX, offY); 

        // Animações de movimento e rotação da engrenagem
        this.tweenY1 = this.scene.tweens.add({ targets: this.obs1, y: 500, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweenRot1 = this.scene.tweens.add({ targets: this.obs1, angle: 360, duration: 1500, repeat: -1, ease: 'Linear' });

        // Definição das condições de colisão e Game Over
        this.colisoesMortais = [
            this.scene.physics.add.overlap(this.scene.player, this.obs1, () => this.scene.triggerGameOver(), null, this),
            this.scene.physics.add.overlap(this.scene.pet, this.obs1, () => this.scene.triggerGameOver(), null, this)
        ];

        //Inimigo
        this.enemy = new EnemyRobot(this.scene, this.startX + 400, 10, this.scene.player, this.scene.pet);
                
        // Retângulo fantasma posicionado perfeitamente abaixo do robô para que o balão [E] 
        // apareça na tela de forma limpa, e que o Phaser consiga ler pelo getBounds() na GameScene
        this.pontoHack = this.scene.add.rectangle(this.enemy.x, this.enemy.y + 140, 50, 50, 0x000000, 0);
        this.pontoHack.textoDica = "[E] HACKEAR SENTINELA";
        this.pontoHack.tipoAcao = "HACKEAR_INIMIGO";

       //zona invisivel
        this.zonaSaida = this.scene.add.rectangle(this.startX + 780, 520, 40, 150, 0x00ff00, 0).setOrigin(0.5, 1);
        this.scene.physics.add.existing(this.zonaSaida, true);
        this.zonaSaida.autoTrigger = true; 
        this.zonaSaida.tipoAcao = "ENTRAR_SALA";
        this.zonaSaida.destinoSala = "PortaChefao"; 
        this.zonaSaida.posicaoSpawn = 100;
    }

    
    
    
    update() {
        if (this.enemy) {
            this.enemy.update(); // Avisa o inimigo para checar o movimento do jogador a cada frame!
        }
    }
    
    
    checarInteracoes(player) {
        let distX = Math.abs(player.x - this.zonaSaida.x);
        let distY = Math.abs(player.y - this.zonaSaida.y);
        
        // Se o Mauro encostar no retângulo invisível
        if (distX < 50 && distY < 150) { 
            return this.zonaSaida;
        }
        return null;
    }

  
    checarInteracoesTobi(pet) {
        if (this.enemy && !this.enemy.isDead) { 
            let distX = Math.abs(pet.x - this.enemy.x);
            let distY = Math.abs(pet.y - this.enemy.y);
            
            // Distância de ativação ampla no eixo Y. Se o Tobi chegar perto, devolvemos o retângulo real
            if (distX < 150 && distY < 400) { 
                return this.pontoHack;
            }
        }
        return null;
    }

    destruir() {
        // Limpa completamente os visuais, animações da engrenagem e os escutadores lógicos da memória
        this.background.destroy(); 
        this.visualChao.destroy(); 
        this.zonaSaida.destroy();
        this.tweenY1.remove(); 
        this.tweenRot1.remove();
        this.obs1.destroy();
        this.colisoesMortais.forEach(c => c.destroy());
        if (this.enemy) this.enemy.destroy();
        if (this.pontoHack) this.pontoHack.destroy(); // Limpa o retângulo fantasma da memória
    }
}