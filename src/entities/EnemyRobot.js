export default class EnemyRobot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player, pet) {
        super(scene, x, y, 'enemy_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player = player;
        this.pet = pet;
        
        // Máquina de Estados  
        this.isAttacking = false;
        this.isDead = false;
        this.timer = null; // Temporizador para alternar estados

        // Carregamento e criação de animações 
        if (!scene.anims.exists('anim_enemy_idle')) {
            scene.anims.create({ key: 'anim_enemy_idle', frames: scene.anims.generateFrameNumbers('enemy_idle', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
            scene.anims.create({ key: 'anim_enemy_attack', frames: scene.anims.generateFrameNumbers('enemy_shot', { start: 0, end: 1 }), frameRate: 8, repeat: -1 });
            scene.anims.create({ key: 'anim_enemy_death', frames: scene.anims.generateFrameNumbers('enemy_death', { start: 0, end: 3 }), frameRate: 8, repeat: 0 }); // Morte não tem loop
        }

        // Canais de áudio de background da inteligência artificial
        this.somIdle = scene.sound.add('sfx_enemy_idle', { loop: true, volume: 0.4 });
        this.somAtaque = scene.sound.add('sfx_enemy_ataque', { loop: true, volume: 0.6 });

        this.setOrigin(0.5, 0); 
        this.setScale(3); 
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Dispara o comportamento inicial
        this.entrarModoIdle();
    }

    // Funçãode limpeza 
    limparTimer() {
        if (this.timer) {
            this.timer.remove();
            this.timer = null;
        }
    }

    //Descanso
    entrarModoIdle() {
        if (this.isDead) return;
        this.limparTimer(); 
        
        this.isAttacking = false;
        this.clearTint(); // Remove luzes vermelhas 
        this.play('anim_enemy_idle', true);

        
        if (this.somAtaque.isPlaying) this.somAtaque.stop();
        if (!this.somIdle.isPlaying) this.somIdle.play();

        // Desliga o filtrovisual de toda a câmara do jogo
        if (this.scene.filtroVermelho) {
            this.scene.filtroVermelho.setVisible(false);
        }
        
        // Passados 4 segundos descansando, muda para o modo de ataque
        this.timer = this.scene.time.delayedCall(4000, () => {
            if (this.scene && this.active) this.entrarModoAtaque();
        });
    }

    // Atacando
    entrarModoAtaque() {
        if (this.isDead) return;
        this.limparTimer(); 
        
        this.isAttacking = true;
        this.setTint(0xff0000); // Pinta o sprite nativamente de vermelho vibrante
        this.play('anim_enemy_attack', true);

        if (this.somIdle.isPlaying) this.somIdle.stop();
        if (!this.somAtaque.isPlaying) this.somAtaque.play();

        // Liga o filtro 
        if (this.scene.filtroVermelho) {
            this.scene.filtroVermelho.setVisible(true);
        }
        
        // Passados 3 segundos a atacando, desiste e volta a descansar
        this.timer = this.scene.time.delayedCall(3000, () => {
            if (this.scene && this.active) this.entrarModoIdle();
        });
    }

    // Destruido pelo hack
    die() {
        if (this.isDead) return; 
        
        this.isDead = true;
        this.isAttacking = false;
        
        this.limparTimer(); 
        this.clearTint();
        
        // Silencia completamente 
        if (this.somIdle.isPlaying) this.somIdle.stop();
        if (this.somAtaque.isPlaying) this.somAtaque.stop();

        this.body.enable = false; // Desativa a física 

        if (this.scene.filtroVermelho) {
            this.scene.filtroVermelho.setVisible(false);
        }

        this.play('anim_enemy_death', true);
        
        
        this.scene.time.delayedCall(3000, () => {
            if (this.active) this.setVisible(false);
        });
    }

    
    destroy(fromScene) {
        if (this.somIdle && this.somIdle.isPlaying) this.somIdle.stop();
        if (this.somAtaque && this.somAtaque.isPlaying) this.somAtaque.stop();
        this.limparTimer();
        super.destroy(fromScene);
    }

    
    update() {
        if (!this.active || !this.isAttacking || this.isDead) return;

        // Calcula se o player esta parado para detectar movimento
        const playerAndando = Math.abs(this.player.body.velocity.x) > 0.1;
        const petVoando = Math.abs(this.pet.body.velocity.x) > 0.1 || Math.abs(this.pet.body.velocity.y) > 0.1;

        //  Se o inimigo está vermelho e detetar movimento, o jogador perde
        if (playerAndando || petVoando) {
            this.scene.triggerGameOver();
        }
    }
}