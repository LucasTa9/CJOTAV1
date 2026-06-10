export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Inicializa o Sprite chamando o construtor da classe pai 
        super(scene, x, y, 'player_sprite');
        
        // Adiciona o jogador à cena visual e ao motor de física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(4); 
        this.setCollideWorldBounds(true); // Impede que o jogador saia dos limites do ecrã
        
        // Hitbox

        
        // O corpo 
        this.body.setSize(20, 30); 
        
        // O setOffset(X, Y) diz ao Phaser onde posicionar a caixa de colisão
    
        this.body.setOffset(49, 45); 

        // Ativa a renderização visual da caixa roxa para debug
        this.body.debugShowBody = true; 

        // Estrutura de dados para o Inventário 
        this.inventario = { notas: [] };

        //Criação das animações
        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('player_sprite', { start: 10, end: 19 }),
            frameRate: 10,
            repeat: -1 // Loop infinito
        });

        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNumbers('player_sprite', { start: 20, end: 29 }),
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'run',
            frames: scene.anims.generateFrameNumbers('player_sprite', { start: 30, end: 39 }),
            frameRate: 18,
            repeat: -1
        });

        this.play('idle');

        // Mapeamento de controlos (Setas direcionais e teclas WASD + SHIFT)
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,A,S,D,SHIFT');

        // Prepara o efeito sonoro de passos em loop para ser invocado no update()
        this.somAndar = scene.sound.add('sfx_andar', { loop: true, volume: 0.3 });
    }

    update() {
        // Verifica se o jogador está a pressionar a tecla SHIFT para correr
        let isRunning = this.keys.SHIFT.isDown;
        let speed = isRunning ? 250 : 120; // Altera a velocidade de acordo com o estado
        let velocityX = 0;

        // Lógica de Movimentação Horizontal
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            velocityX = -speed;
            this.setFlipX(true); // Espelha a imagem para a esquerda
        } 
        else if (this.cursors.right.isDown || this.keys.D.isDown) {
            velocityX = speed;
            this.setFlipX(false); // Mantém a imagem para a direita
        }

        this.setVelocityX(velocityX);

        
        // Se o player corre, e não há interfaces ou transições a bloquear a ação:
        if (velocityX !== 0 && !this.scene.isUIAberta() && !this.scene.isTransitioning) {
            if (!this.somAndar.isPlaying) {
                this.somAndar.play();
            }
            //  Aumenta a velocidadedo áudio se o boneco correr!
            this.somAndar.setRate(isRunning ? 1.5 : 1.0); 
        } else {
            if (this.somAndar.isPlaying) {
                this.somAndar.stop(); // Pára os passos 
            }
        }

        // Troca de Animações baseada na velocidade atual
        if (this.body.velocity.x === 0) {
            this.play('idle', true);
        } else {
            this.play(isRunning ? 'run' : 'walk', true);
        }
    }
}