export default class ChefaoFinal extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, startX) {
        super(scene, x, y, 'boss_ataque'); // Diferente do inimigo comum, herda de Image 
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.startX = startX;

        this.setDepth(1);
        this.setScale(0.6);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        
        // Máquina de Estados da IA Central
        this.estado = 'ESPERA'; 

        //chama o minigames
        this.textoDica = "[E] HACKEAR ADALGUSTA";
        this.tipoAcao = "HACKEAR_BOSS";

        // Tween 
        this.tweenMovimento = this.scene.tweens.add({
            targets: this,
            x: this.startX + 650,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut' // Acelera e desacelera nas pontas de forma orgânica
        });

        
        //Projétil 
       
        this.projetil = this.scene.add.image(this.x, this.y, 'obstaculo_engrenagem').setDisplaySize(70, 70).setDepth(2).setVisible(false);
        this.scene.physics.add.existing(this.projetil, false);
        this.projetil.body.setAllowGravity(false);
        this.projetil.body.enable = false;

        // Cálculos para ajustar a Hitbox Circular do projétil
        let raio1 = this.projetil.width * 0.35; 
        let offX1 = (this.projetil.width / 2) - raio1;
        let offY1 = (this.projetil.height / 2) - raio1;
        this.projetil.body.setCircle(raio1, offX1, offY1);

        // Se a arma tocar no player ou  Mascote, chama a morte.
        this.colisaoBoss = this.scene.physics.add.overlap(this.scene.player, this.projetil, () => this.scene.triggerGameOver(), null, this);
        this.colisaoBossPet = this.scene.physics.add.overlap(this.scene.pet, this.projetil, () => this.scene.triggerGameOver(), null, this);

        //  2 segundos  antes da batalha começar
        this.scene.time.delayedCall(2000, () => this.iniciarAtaque());
    }

    iniciarAtaque() {
        if (!this.scene || this.estado === 'MORTO') return;
        
        this.estado = 'ATACANDO';
        this.setTexture('boss_ataque'); // Rosto Agressivo
        this.clearTint(); 

        // Descongela a movimentação caso tenha sido suspensa
        if (this.tweenMovimento && this.tweenMovimento.isPaused()) {
            this.tweenMovimento.resume();
        }

        // Tiros Consecutivos 
        this.lancarProjetil(() => {
            //impede o código de prosseguir se o boss morreu no meio da animação
            if(this.estado === 'MORTO') return;
            
            this.scene.time.delayedCall(1000, () => {
                if(this.estado === 'MORTO') return;
                
                this.lancarProjetil(() => {
                    if(this.estado === 'MORTO') return;
                    
                    
                  
                    this.estado = 'EXAUSTO';
                    this.setTexture('boss_hackeavel'); // Rosto Passivo
                    this.scene.sound.play('sfx_cansado');
                    
                    // Paralisa o Boss 
                    if (this.tweenMovimento) {
                        this.tweenMovimento.pause();
                    }
                    
                    //  10 segundos para hackear, senão o Boss acorda.
                    this.eventoRecuperacao = this.scene.time.delayedCall(10000, () => {
                        if (this.estado === 'EXAUSTO') this.iniciarAtaque();
                    });
                });
            });
        });
    }

    // Calcula trajetória do ataque
    lancarProjetil(callbackFinalizou) {
        if(!this.scene || !this.projetil || this.estado === 'MORTO') return;

        this.scene.sound.play('sfx_boss_ataque');
        
        // Traz a arma para a posição (x,y) atual do rosto do Boss
        this.projetil.setPosition(this.x, this.y);
        this.projetil.setVisible(true);
        this.projetil.body.enable = true;

        // Dispara o projétil ndiretamente contra o Jogador
        this.scene.physics.moveToObject(this.projetil, this.scene.player, 350);
        
        // Efeito de Rotação
        this.tweenGiro = this.scene.tweens.add({ targets: this.projetil, angle: 360, duration: 500, repeat: -1 });

        // Duração do voo da arma. Passados 2.5 s, ela desaparece e o callback chama o próximo tiro ou exaustão.
        this.scene.time.delayedCall(2500, () => {
            this.projetil.setVisible(false);
            this.projetil.body.enable = false;
            this.projetil.body.setVelocity(0,0);
            if(this.tweenGiro) this.tweenGiro.stop();
            if(callbackFinalizou) callbackFinalizou();
        });
    }

    
    // Trava do Minigame
    
   
    congelarParaHack() {
        if (this.eventoRecuperacao) {
            this.eventoRecuperacao.remove(); // Apaga o relógio que o acordaria
        }
        if (this.tweenMovimento) {
            this.tweenMovimento.pause(); // Garante que a imagem não se move por trás da UI
        }
    }

    setSize() {} // Sobrescrito para não causar erros de API em objetos do tipo Image

    // Morte
    setFillStyle(cor) {
        this.estado = 'MORTO';
        this.setTint(0x333333); // Fica cinza 
        
        // Desliga todos os movimentos e loops cronometrados
        if (this.tweenMovimento) this.tweenMovimento.stop();
        if (this.tweenGiro) this.tweenGiro.stop();
        if (this.eventoRecuperacao) this.eventoRecuperacao.remove();
        
        // Desativa a arma no ar 
        this.projetil.setVisible(false);
        this.projetil.body.enable = false;
        this.projetil.body.setVelocity(0, 0);
    }

  
    destruir() {
        if (this.projetil) this.projetil.destroy();
        if (this.colisaoBoss) this.colisaoBoss.destroy();
        if (this.colisaoBossPet) this.colisaoBossPet.destroy();
        if (this.tweenGiro) this.tweenGiro.stop();
        if (this.tweenMovimento) this.tweenMovimento.stop();
        if (this.eventoRecuperacao) this.eventoRecuperacao.remove();
        this.destroy(); 
    }
}