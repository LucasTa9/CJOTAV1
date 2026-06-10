import EnemyRobot from '../entities/EnemyRobot.js';

export default class Subsolo1 {
    constructor(scene, startX) {
        this.scene = scene;
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        // Renderiza o fundo e o chão temático do subsolo
        this.background = this.scene.add.image(this.startX + 400, 300, 'bg_subsolo').setDisplaySize(800, 600).setDepth(-1);
        const chaoY = 560; 
        this.visualChao = this.scene.add.image(this.startX + 400, chaoY, 'chao_subsolo').setDisplaySize(800, 80).setDepth(0);

      
        this.notaDica = this.scene.add.image(this.startX + 120, chaoY, 'nota_chao').setDisplaySize(30, 30).setOrigin(0.5, 1).setDepth(1);
        this.scene.physics.add.existing(this.notaDica, true);
        this.notaDica.dadosId = "dica_sentinela"; // Chave que vai puxar o texto do arquivo JSON
        this.notaDica.textoDica = "[E] LER BILHETE NO CHÃO";
        this.notaDica.tipoAcao = "LER_NOTA";

        // Verifica se o jogador já coletou essa nota no inventário para não mostrá-la de novo
        if (this.scene.player.inventario && this.scene.player.inventario.notas && this.scene.player.inventario.notas.includes(this.notaDica.dadosId)) {
            this.notaDica.setVisible(false);
            this.notaDica.body.enable = false; 
        }

       
        this.enemy = new EnemyRobot(this.scene, this.startX + 400, 10, this.scene.player, this.scene.pet);
        
     
        this.pontoHack = this.scene.add.rectangle(this.enemy.x, this.enemy.y + 140, 50, 50, 0x000000, 0);
        this.pontoHack.textoDica = "[E] HACKEAR SENTINELA";
        this.pontoHack.tipoAcao = "HACKEAR_INIMIGO";
       
        this.zonaSaida = this.scene.add.rectangle(this.startX + 780, 520, 40, 150, 0x00ff00, 0).setOrigin(0.5, 1);
        this.scene.physics.add.existing(this.zonaSaida, true);
        this.zonaSaida.autoTrigger = true; 
        this.zonaSaida.tipoAcao = "ENTRAR_SALA";
        this.zonaSaida.destinoSala = "Subsolo2"; 
        this.zonaSaida.posicaoSpawn = 50; 
    }

    
    checarInteracoes(player) {
        let objetos = [this.zonaSaida];
        
        // Adiciona a nota na lista de interações apenas se ela estiver visível
        if (this.notaDica.visible) {
            objetos.push(this.notaDica);
        }

        let maisProximo = null;
        
        // Calcula a proximidade com os objetos
        objetos.forEach(obj => {
            let distX = Math.abs(player.x - obj.x);
            let distY = Math.abs(player.y - obj.y);
            if (distX < 80 && distY < 400) { maisProximo = obj; }
        });
        return maisProximo;
    }

    
    checarInteracoesTobi(pet) {
        if (this.enemy && !this.enemy.isDead) { 
            let distX = Math.abs(pet.x - this.enemy.x);
            let distY = Math.abs(pet.y - this.enemy.y);
            
            if (distX < 150 && distY < 400) { 
                return this.pontoHack;
            }
        }
        return null;
    }

    update() {
        if (this.enemy) this.enemy.update();
    }

    destruir() {
        this.background.destroy();
        this.visualChao.destroy(); 
        this.zonaSaida.destroy();
        this.notaDica.destroy(); // Garante a limpeza da nota da memória
        if (this.enemy) this.enemy.destroy();
        if (this.pontoHack) this.pontoHack.destroy(); 
    }
}