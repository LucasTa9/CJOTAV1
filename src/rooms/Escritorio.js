export default class Escritorio {
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

        this.portaDir = this.scene.add.image(this.startX + 100, 450, 'porta').setDisplaySize(200, 150).setDepth(1);
        this.scene.physics.add.existing(this.portaDir, true);
        this.portaDir.textoDica = "[E] VOLTAR À RECEPÇÃO";
        this.portaDir.tipoAcao = "ENTRAR_SALA";
        this.portaDir.destinoSala = "Recepcao";
        this.portaDir.posicaoSpawn = 650; 

        // O Cofre Ativa o UI Minigame 
        this.cofre = this.scene.add.image(this.startX + 750, 450, 'cofre').setDisplaySize(80, 150).setDepth(1);
        this.scene.physics.add.existing(this.cofre, true);
        this.cofre.textoDica = "[E] ABRIR COFRE";
        this.cofre.tipoAcao = "ABRIR_COFRE";

        // Objeto de Pista de Lore 
        this.quadro = this.scene.add.image(this.startX + 400, 250, 'quadro_solar').setDisplaySize(160, 100).setDepth(1);
        this.scene.physics.add.existing(this.quadro, true);
        this.quadro.textoDica = "[E] LER RELATÓRIO DO QUADRO";
        this.quadro.tipoAcao = "MOSTRAR_QUADRO_SOLAR";

        //Atualizado para Imagem
        
        this.notaParede = this.scene.add.image(this.startX + 400, 410, 'nota_parede').setDisplaySize(30, 40).setDepth(1); 
        this.scene.physics.add.existing(this.notaParede, true);
        this.notaParede.textoDica = "[E] LER NOTA";
        this.notaParede.tipoAcao = "LER_NOTA";
        this.notaParede.dadosId = "incidente_lab"; // Conecta com o seu JSON// Nome exato do objeto JSON atrelado a ele

        if (this.scene.player.inventario && this.scene.player.inventario.notas && this.scene.player.inventario.notas.includes(this.notaParede.dadosId)) {
            this.notaParede.setVisible(false);
            this.notaParede.body.enable = false; 
        }

        this.scene.physics.add.collider(this.scene.player, this.chao);
        this.scene.physics.add.collider(this.scene.pet, this.chao);
    }

    checarInteracoes(entidade) {
        let objetosInteragiveis = [this.portaDir, this.cofre, this.quadro];

        if (this.notaParede.visible) {
            objetosInteragiveis.push(this.notaParede);
        }
        
        let maisProximo = null;

        // Cálculos de trigonometria e limite vetorial para gerar a tooltip de colisão suave
        objetosInteragiveis.forEach(obj => {
            let distanciaX = Math.abs(entidade.x - obj.x);
            let distanciaY = Math.abs(entidade.y - obj.y);
            if (distanciaX < 80 && distanciaY < 150) { maisProximo = obj; }
        });
        return maisProximo;
    }

    destruir() {
        this.background.destroy();
        this.chao.destroy();
        this.portaDir.destroy();
        this.cofre.destroy();
        this.quadro.destroy();
        this.notaParede.destroy();
    }
}