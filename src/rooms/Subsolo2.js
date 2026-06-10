export default class Subsolo2 {
    constructor(scene, startX) {
        this.scene = scene;
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        // Fundo recebe uma tonalidade (Tint) mais escura (0x999999) para dar ideia de profundidade
        this.background = this.scene.add.image(this.startX + 400, 300, 'bg_subsolo').setDisplaySize(800, 600).setDepth(-1).setTint(0x999999); 
        this.visualChao = this.scene.add.image(this.startX + 400, 560, 'chao_subsolo').setDisplaySize(800, 80).setDepth(0);

        
        this.obs1 = this.scene.add.image(this.startX + 200, 150, 'obstaculo_engrenagem').setDisplaySize(80, 80).setDepth(1);
        this.scene.physics.add.existing(this.obs1, false); // Corpo físico dinâmico, não estático
        this.obs1.body.setAllowGravity(false); // Ignora a gravidade para flutuar
        this.obs1.body.setImmovable(true); // O personagem não pode empurrar o obstáculo
        
        
        let raio1 = this.obs1.width * 0.35; 
        let offX1 = (this.obs1.width / 2) - raio1;
        let offY1 = (this.obs1.height / 2) - raio1;
        this.obs1.body.setCircle(raio1, offX1, offY1);

        // Animação  Movimento sobe-desce 
        this.tweenY1 = this.scene.tweens.add({ targets: this.obs1, y: 480, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
       
        this.tweenRot1 = this.scene.tweens.add({ targets: this.obs1, angle: 360, duration: 1500, repeat: -1, ease: 'Linear' });

      
        this.obs2 = this.scene.add.image(this.startX + 600, 480, 'obstaculo_engrenagem').setDisplaySize(80, 80).setDepth(1);
        this.scene.physics.add.existing(this.obs2, false);
        this.obs2.body.setAllowGravity(false);
        this.obs2.body.setImmovable(true);
        
        // Aplicação do mesmo cálculo trigonométrico para redução de Hitbox
        let raio2 = this.obs2.width * 0.35; 
        let offX2 = (this.obs2.width / 2) - raio2;
        let offY2 = (this.obs2.height / 2) - raio2;
        this.obs2.body.setCircle(raio2, offX2, offY2);

        // Tweens inversos 
        this.tweenY2 = this.scene.tweens.add({ targets: this.obs2, y: 150, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweenRot2 = this.scene.tweens.add({ targets: this.obs2, angle: -360, duration: 1200, repeat: -1, ease: 'Linear' });

        
        this.colisoesMortais = [
            this.scene.physics.add.overlap(this.scene.player, this.obs1, () => this.scene.triggerGameOver(), null, this),
            this.scene.physics.add.overlap(this.scene.player, this.obs2, () => this.scene.triggerGameOver(), null, this),
            this.scene.physics.add.overlap(this.scene.pet, this.obs1, () => this.scene.triggerGameOver(), null, this),
            this.scene.physics.add.overlap(this.scene.pet, this.obs2, () => this.scene.triggerGameOver(), null, this)
        ];

    
        this.zonaSaida = this.scene.add.rectangle(this.startX + 780, 520, 40, 150, 0x00ff00, 0).setOrigin(0.5, 1);
        this.scene.physics.add.existing(this.zonaSaida, true);
        this.zonaSaida.autoTrigger = true;
        this.zonaSaida.tipoAcao = "ENTRAR_SALA";
        this.zonaSaida.destinoSala = "Subsolo3"; 
        this.zonaSaida.posicaoSpawn = 50;
    }

    // Calcula a distância do humano até o teleporte final
    checarInteracoes(player) {
        let objetos = [this.zonaSaida];
        let maisProximo = null;
        objetos.forEach(obj => {
            let distX = Math.abs(player.x - obj.x);
            let distY = Math.abs(player.y - obj.y);
            if (distX < 80 && distY < 150) { maisProximo = obj; }
        });
        return maisProximo;
    }

    destruir() {
       
        this.background.destroy(); this.visualChao.destroy(); this.zonaSaida.destroy();
        this.tweenY1.remove(); this.tweenRot1.remove(); this.tweenY2.remove(); this.tweenRot2.remove();
        this.obs1.destroy(); this.obs2.destroy();
        this.colisoesMortais.forEach(c => c.destroy());
    }
}