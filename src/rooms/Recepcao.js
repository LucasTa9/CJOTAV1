export default class Recepcao {
    constructor(scene, startX) {
        this.scene = scene;
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        this.background = this.scene.add.image(this.startX + 400, 300, 'fundo_pedra').setDisplaySize(800, 600).setDepth(-1);
        this.chao = this.scene.add.tileSprite(this.startX + 400, 560, 800, 80, 'chao_madeira');
        this.scene.physics.add.existing(this.chao, true); 
        this.chao.setDepth(0);
        const chaoY = 520; 

        // Roteia a coordenada de entrada para a classe "Escritorio"
        this.portaEscritorio = this.scene.add.image(this.startX + 500, chaoY, 'porta').setDisplaySize(200, 150).setOrigin(0.5, 1).setDepth(1);
        this.scene.physics.add.existing(this.portaEscritorio, true);
        this.portaEscritorio.textoDica = "[E] ENTRAR NO ESCRITÓRIO";
        this.portaEscritorio.tipoAcao = "ENTRAR_SALA";
        this.portaEscritorio.destinoSala = "Escritorio";
        this.portaEscritorio.posicaoSpawn = 150; 
        
        this.textoPortaEscritorio = this.scene.add.text(this.startX + 500, chaoY - 220, 'ESCRITÓRIO', { fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1);

        //Auto-Trigger
        this.zonaElevador = this.scene.add.rectangle(this.startX + 800, chaoY, 130, 200, 0x000000, 0).setOrigin(0.5, 1);
        this.scene.physics.add.existing(this.zonaElevador, true);
        this.zonaElevador.autoTrigger = true; 
        this.zonaElevador.tipoAcao = "ENTRAR_SALA";
        this.zonaElevador.destinoSala = "Elevador";
        this.zonaElevador.posicaoSpawn = 200; 

        // Coleta Assíncrona de Lore via Cache JSON (Dados: paz_fernando)
        this.notaParede = this.scene.add.image(this.startX + 250, 430, 'nota_parede').setDisplaySize(30, 40).setOrigin(0.5, 0.5).setDepth(1);
        this.scene.physics.add.existing(this.notaParede, true);
        this.notaParede.dadosId = "paz_fernando"; 
        this.notaParede.textoDica = "[E] LER AVISO NA PAREDE";
        this.notaParede.tipoAcao = "LER_NOTA";

        if (this.scene.player.inventario && this.scene.player.inventario.notas && this.scene.player.inventario.notas.includes(this.notaParede.dadosId)) {
            this.notaParede.setVisible(false);
            this.notaParede.body.enable = false; 
        }

        // Easter Egg
        this.quadroFernando = this.scene.add.image(this.startX + 650, 200, 'quadro_fernando').setDisplaySize(90, 90).setDepth(1);
        this.scene.physics.add.existing(this.quadroFernando, true);
        this.quadroFernando.textoDica = "[E] OBSERVAR QUADRO";
        this.quadroFernando.tipoAcao = "MOSTRAR_QUADRO_FERNANDO";
    }

    checarInteracoes(player) {
    
        
        if (player !== this.scene.player) return null;

        let objetosInteragiveis = [this.portaEscritorio, this.zonaElevador];
        
        if (this.notaParede.visible) {
            objetosInteragiveis.push(this.notaParede);
        }

        let maisProximo = null;

        // Cálculos convencionais para objetos ao nível do chão
        objetosInteragiveis.forEach(obj => {
            let distanciaX = Math.abs(player.x - obj.x);
            let distanciaY = Math.abs(player.y - obj.y);
            
            if (distanciaX < 100 && distanciaY < 150) { 
                maisProximo = obj; 
            }
        });

        // Verificação Isolada Especial para o Quadro Alto
        // Permite que a hitbox vertical de leitura alcance objetos no limite superior do eixo Y.
        let distQuadroX = Math.abs(player.x - this.quadroFernando.x);
        let distQuadroY = Math.abs(player.y - this.quadroFernando.y);
        if (distQuadroX < 100 && distQuadroY < 280) { 
            maisProximo = this.quadroFernando; 
        }

        return maisProximo;
    }

    destruir() {
        this.background.destroy();
        this.portaEscritorio.destroy();
        if (this.textoPortaEscritorio) this.textoPortaEscritorio.destroy();
        this.zonaElevador.destroy();
        this.notaParede.destroy();
        this.quadroFernando.destroy(); 
    }
}