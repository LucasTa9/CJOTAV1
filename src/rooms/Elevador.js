export default class Elevador {
    constructor(scene, startX) {
        this.scene = scene;
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        this.background = this.scene.add.image(this.startX + 400, 300, 'fundo_pedra').setDisplaySize(800, 600).setDepth(-1);
        const chaoY = 520; 

      
        // Area Auto-Trigger
      
        
        this.zonaRecepcao = this.scene.add.rectangle(this.startX + 5, chaoY, 10, 10, 0x000000, 0).setOrigin(0.5, 1);
        this.scene.physics.add.existing(this.zonaRecepcao, true);
        this.zonaRecepcao.autoTrigger = true; 
        this.zonaRecepcao.tipoAcao = "ENTRAR_SALA";
        this.zonaRecepcao.destinoSala = "Recepcao";
        this.zonaRecepcao.posicaoSpawn = 600; 

        this.portaElevador = this.scene.add.image(this.startX + 400, chaoY, 'img_elevador').setDisplaySize(130, 200).setOrigin(0.5, 1).setDepth(1);
        this.scene.physics.add.existing(this.portaElevador, true);
        this.textoElevador = this.scene.add.text(this.startX + 400, chaoY - 220, 'ELEVADOR PRINCIPAL', { fontSize: '18px', fill: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1);

        // Terminal do Tobi 
        this.painelElevador = this.scene.add.image(this.startX + 490, chaoY - 80, 'painel').setDisplaySize(30, 40).setOrigin(0.5, 0.5).setDepth(1); 
        this.scene.physics.add.existing(this.painelElevador, true); 
        this.painelElevador.tipoAcao = "HACKEAR_ELEVADOR";
        this.painelElevador.textoDica = "[E] HACKEAR PAINEL";

        this.notaChao = this.scene.add.image(this.startX + 300, chaoY, 'nota_chao').setDisplaySize(30, 30).setOrigin(0.5, 1).setDepth(1);
        this.scene.physics.add.existing(this.notaChao, true);
        this.notaChao.dadosId = "senha_cofre";
        this.notaChao.textoDica = "[E] LER BILHETE NO CHÃO";
        this.notaChao.tipoAcao = "LER_NOTA";

        // não repetir nota
        if (this.scene.player.inventario && this.scene.player.inventario.notas && this.scene.player.inventario.notas.includes(this.notaChao.dadosId)) {
            this.notaChao.setVisible(false);
            this.notaChao.body.enable = false; 
        }

        // Porta trancada Exige o Keycard .
        this.portaTI = this.scene.add.image(this.startX + 700, chaoY, 'porta').setDisplaySize(200, 150).setOrigin(0.5, 1).setDepth(1);
        this.scene.physics.add.existing(this.portaTI, true);
        this.portaTI.textoDica = "[E] ENTRAR NA SALA DE T.I.";
        this.portaTI.tipoAcao = "PORTA_TRANCADA"; 
        this.portaTI.destinoSala = "SalaTI";
        this.portaTI.posicaoSpawn = 150; 
        
        this.textoPortaTI = this.scene.add.text(this.startX + 700, chaoY - 170, 'SALA T.I.', { fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1);
    }

   checarInteracoes(player) {
        let objetosInteragiveis = [this.zonaRecepcao, this.painelElevador, this.portaTI];

        if (this.notaChao.visible) {
            objetosInteragiveis.push(this.notaChao);
        }
        
        let maisProximo = null;
        objetosInteragiveis.forEach(obj => {
            let distanciaX = Math.abs(player.x - obj.x);
            let distanciaY = Math.abs(player.y - obj.y);
            if (distanciaX < 100 && distanciaY < 150) { maisProximo = obj; }
        });
        return maisProximo;
    }

    destruir() {
        this.background.destroy();
        this.zonaRecepcao.destroy();
        this.portaElevador.destroy(); 
        if (this.textoElevador) this.textoElevador.destroy();
        this.painelElevador.destroy();
        this.notaChao.destroy();
        this.portaTI.destroy();
        if (this.textoPortaTI) this.textoPortaTI.destroy();
    }
}