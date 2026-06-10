export default class SalaTI {
    constructor(scene, startX) {
        // Recebe a referência da GameScene (scene) e a posição inicial da câmera (startX)
        this.scene = scene;
        this.startX = startX;
        this.construirSala(); // Chama a função de montagem assim que a sala é instanciada
    }

    construirSala() {
        // Cenario
        // Fundo da sala
        this.background = this.scene.add.image(this.startX + 400, 300, 'fundo_pedra').setDisplaySize(800, 600).setDepth(-1);
        
        // Chão construído como TileSprite (permite repetição de textura)
        this.chao = this.scene.add.tileSprite(this.startX + 400, 560, 800, 80, 'chao_madeira');
        this.scene.physics.add.existing(this.chao, true); // Adiciona corpo físico estático (true)
        this.chao.setDepth(0);

        const chaoY = 520; // Posição base do eixo Y para alinhar objetos no chão

        //porta saida
        this.portaSaida = this.scene.add.image(this.startX + 100, chaoY, 'porta').setDisplaySize(200, 150).setOrigin(0.5, 1).setDepth(1);
        this.scene.physics.add.existing(this.portaSaida, true);
        
        // Metadados lidos pela GameScene para criar o balão de interação e executar a transição
        this.portaSaida.textoDica = "[E] VOLTAR PARA O ELEVADOR";
        this.portaSaida.tipoAcao = "ENTRAR_SALA";
        this.portaSaida.destinoSala = "Elevador";
        this.portaSaida.posicaoSpawn = 650; // Onde o jogador nascerá na próxima sala
        
        this.textoPortaSaida = this.scene.add.text(this.startX + 100, chaoY - 170, 'ELEVADOR', { fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1);

        // Master
        this.mesaComputador = this.scene.add.image(this.startX + 400, 600, 'mesa_comp').setDisplaySize(300, 250).setOrigin(0.5, 1).setDepth(1);
        this.scene.physics.add.existing(this.mesaComputador, true);
        
        // Metadados que abrem a interface de digitação de senha na GameScene
        this.mesaComputador.textoDica = "[E] ACESSAR TERMINAL MASTER";
        this.mesaComputador.tipoAcao = "ACESSAR_PC"; 

        
        this.notaParede1 = this.scene.add.image(this.startX + 250, 430, 'nota_parede').setDisplaySize(30, 40).setOrigin(0.5, 0.5).setDepth(1);
        this.scene.physics.add.existing(this.notaParede1, true);
        this.notaParede1.dadosId = "senha_computador"; // Chave de busca no arquivo JSON
        this.notaParede1.textoDica = "[E] LER AVISO NA PAREDE";
        this.notaParede1.tipoAcao = "LER_NOTA";

        // Verifica o inventário do jogador: Se já leu, não renderiza a nota novamente
        if (this.scene.player.inventario && this.scene.player.inventario.notas && this.scene.player.inventario.notas.includes(this.notaParede1.dadosId)) {
            this.notaParede1.setVisible(false);
            this.notaParede1.body.enable = false; 
        }

        // Segunda Nota: Outro fragmento de história
        this.notaParede2 = this.scene.add.image(this.startX + 550, 430, 'nota_parede').setDisplaySize(30, 40).setOrigin(0.5, 0.5).setDepth(1);
        this.scene.physics.add.existing(this.notaParede2, true);
        this.notaParede2.dadosId = "encantado"; // Chave de busca no arquivo JSON
        this.notaParede2.textoDica = "[E] LER AVISO NA PAREDE";
        this.notaParede2.tipoAcao = "LER_NOTA";

        if (this.scene.player.inventario && this.scene.player.inventario.notas && this.scene.player.inventario.notas.includes(this.notaParede2.dadosId)) {
            this.notaParede2.setVisible(false);
            this.notaParede2.body.enable = false; 
        }

        // Adiciona colisão para que o jogador não caia através do chão
        this.scene.physics.add.collider(this.scene.player, this.chao);
    }

    // interações
    checarInteracoes(player) {
        let objetosInteragiveis = [this.portaSaida, this.mesaComputador];
        
        // Só tenta interagir com as notas se elas não foram apagadas pelo inventário
        if (this.notaParede1.visible) objetosInteragiveis.push(this.notaParede1);
        if (this.notaParede2.visible) objetosInteragiveis.push(this.notaParede2);

        let maisProximo = null;
        
        // Loop que calcula a distância em pixels entre o jogador e cada objeto usando valor absoluto
        objetosInteragiveis.forEach(obj => {
            let distanciaX = Math.abs(player.x - obj.x);
            let distanciaY = Math.abs(player.y - obj.y);
            
           
            if (distanciaX < 100 && distanciaY < 150) { maisProximo = obj; }
        });
        return maisProximo; // Retorna o objeto mais próximo para a GameScene mostrar o balão [E]
    }

 
    destruir() {
        this.background.destroy();
        this.chao.destroy();
        this.portaSaida.destroy();
        if (this.textoPortaSaida) this.textoPortaSaida.destroy();
        this.mesaComputador.destroy(); 
        this.notaParede1.destroy();
        this.notaParede2.destroy();
    }
}