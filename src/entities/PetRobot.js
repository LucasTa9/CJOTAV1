export default class PetRobot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'pet_sprite');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player = player;
        this.destino = null;

        
        this.speedManual = 150;  // Velocidade quando clica para ele ir a um local
        this.speedFollow = 170;  // Velocidade de voltar
        this.setScale(2); 
        this.body.setAllowGravity(false);
        this.body.setSize(20, 20); 
        this.body.setOffset(6, 12); 

        // Proteção contra duplicação de animações
        if (!scene.anims.exists('pet_idle')) {
            scene.anims.create({ key: 'pet_idle', frames: scene.anims.generateFrameNumbers('pet_sprite', { start: 0, end: 19 }), frameRate: 3, repeat: -1 });
            scene.anims.create({ key: 'pet_walk', frames: scene.anims.generateFrameNumbers('pet_sprite', { start: 60, end: 65 }), frameRate: 5, repeat: -1 });
        }
        this.play('pet_idle');
    }

    update() {
        // Verifica se o Player está a mover-se
        const playerMoving = Math.abs(this.player.body.velocity.x) > 0.1 || Math.abs(this.player.body.velocity.y) > 0.1;

        // seguir player
        if (playerMoving && this.destino) {
            this.destino = null; 
        }

        // click vai
        if (this.destino) {
            let distance = Phaser.Math.Distance.Between(this.x, this.y, this.destino.x, this.destino.y);
            if (distance < 5) {
                this.destino = null;
                this.body.setVelocity(0, 0);
                this.play('pet_idle', true);
            } else {
                this.scene.physics.moveToObject(this, this.destino, this.speedManual);
                this.play('pet_walk', true);
                if (this.body.velocity.x > 0) this.setFlipX(false);
                else if (this.body.velocity.x < 0) this.setFlipX(true);
            }
            return; 
        } 

        //Seguir player
        if (playerMoving) {
            let ombroX = this.player.x + (this.player.flipX ? 45 : -45);
            let ombroY = this.player.y - 60;
            let distanceToShoulder = Phaser.Math.Distance.Between(this.x, this.y, ombroX, ombroY);

            if (distanceToShoulder > 15) {
                this.scene.physics.moveTo(this, ombroX, ombroY, this.speedFollow);
                this.play('pet_walk', true);
                if (this.body.velocity.x > 0) this.setFlipX(false);
                else if (this.body.velocity.x < 0) this.setFlipX(true);
            } else {
                this.body.setVelocity(0, 0);
                this.play('pet_idle', true);
                this.setFlipX(this.player.flipX);
            }
        } else {
            // Flutuando parado
            this.body.setVelocity(0, 0);
            this.y += Math.sin(this.scene.time.now / 300) * 0.5;
            this.play('pet_idle', true);
            this.setFlipX(this.player.flipX);
        }
    }
}