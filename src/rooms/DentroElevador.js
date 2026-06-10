export default class DentroElevador {
    constructor(scene, startX) {
        this.scene = scene; // Guarda a referência da GameScene para aceder ao motor de física e UI
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        // desativa a colisão do chão global da GameScene para criar um buraco virtual 
        // impede que o jogador caminhe fora dos limites do elevador
        if(this.scene.chao) {
            this.scene.chao.setVisible(false);
            if(this.scene.chao.body) this.scene.chao.body.enable = false;
        }

        // fundo elevador
        this.backgroundLayer = this.scene.add.rectangle(this.startX + 400, 300, 800, 600, 0x000000).setDepth(-3);
        this.paredesElevador = this.scene.add.rectangle(this.startX + 400, 300, 300, 400, 0x333333).setStrokeStyle(4, 0x111111).setDepth(-1);

        //elevador
        const chaoY = 490; 
        this.chaoElevador = this.scene.add.rectangle(this.startX + 400, chaoY + 10, 300, 20, 0x555555).setDepth(0);
        this.scene.physics.add.existing(this.chaoElevador, true);

        this.paredeEsq = this.scene.add.rectangle(this.startX + 240, 300, 20, 400, 0x000000, 0).setDepth(0);
        this.scene.physics.add.existing(this.paredeEsq, true);
        
        this.paredeDir = this.scene.add.rectangle(this.startX + 560, 300, 20, 400, 0x000000, 0).setDepth(0);
        this.scene.physics.add.existing(this.paredeDir, true);
        
        this.tetoElevador = this.scene.add.rectangle(this.startX + 400, 90, 300, 20, 0x000000, 0).setDepth(0);
        this.scene.physics.add.existing(this.tetoElevador, true);

       
        //objetos interativos
        
        this.painelInterno = this.scene.add.image(this.startX + 480, 400, 'painel').setDisplaySize(30, 40).setDepth(1);
        this.scene.physics.add.existing(this.painelInterno, true);
        this.painelInterno.textoDica = "[E] INSPECIONAR PAINEL";
        this.painelInterno.tipoAcao = "PAINEL_INTERNO_ELEVADOR";

        this.notaPoema = this.scene.add.image(this.startX + 350, 400, 'nota_parede').setDisplaySize(20, 30).setDepth(1);
        this.scene.physics.add.existing(this.notaPoema, true);
        this.notaPoema.textoDica = "[E] LER NOTA AMASSADA";
        this.notaPoema.tipoAcao = "LER_NOTA";
        this.notaPoema.dadosId = "notaminigamefios";

        //  Se a nota já estiver guardada no inventário  ela não nasce novamente
        if (this.scene.player.inventario && this.scene.player.inventario.notas && this.scene.player.inventario.notas.includes(this.notaPoema.dadosId)) {
            this.notaPoema.setVisible(false);
        }

      //objetos interativos
        this.fiosDesc = this.scene.add.image(this.startX + 320, 200, 'painelFiosSala').setDisplaySize(60, 80).setDepth(1);
        this.scene.physics.add.existing(this.fiosDesc, true);
        this.fiosDesc.textoDica = "[E] CONCERTA FIOS"; 
        this.fiosDesc.tipoAcao = "CONCERTA_FIOS"; 

        this.painelEnergia = this.scene.add.image(this.startX + 480, 200, 'caixaEletricaSala').setDisplaySize(80, 100).setDepth(1);
        this.scene.physics.add.existing(this.painelEnergia, true);
        this.painelEnergia.textoDica = "[E] ATIVAR NÚCLEO DE ENERGIA";
        this.painelEnergia.tipoAcao = "ATIVAR_ENERGIA_ELEVADOR";

        // Guarda as colisões numa matriz para destruição fácil ao sair da sala
        this.colisores = [
            this.scene.physics.add.collider(this.scene.player, this.chaoElevador),
            this.scene.physics.add.collider(this.scene.player, this.paredeEsq),
            this.scene.physics.add.collider(this.scene.player, this.paredeDir),
            this.scene.physics.add.collider(this.scene.player, this.tetoElevador),
            this.scene.physics.add.collider(this.scene.pet, this.chaoElevador),
            this.scene.physics.add.collider(this.scene.pet, this.paredeEsq),
            this.scene.physics.add.collider(this.scene.pet, this.paredeDir),
            this.scene.physics.add.collider(this.scene.pet, this.tetoElevador)
        ];
    }

    checarInteracoes(player) {
        let objetos = [this.painelInterno];
        if (this.notaPoema.visible) objetos.push(this.notaPoema);

        let maisProximo = null;
        let menorDistancia = 9999;

        // Iteração métrica para saber qual o objeto fisicamente mais perto do Humano
        objetos.forEach(obj => {
            let distX = Math.abs(player.x - obj.x);
            let distY = Math.abs(player.y - obj.y);
            if (distX < 80 && distY < 150) { 
                let distTotal = distX + distY;
                if (distTotal < menorDistancia) {
                    menorDistancia = distTotal;
                    maisProximo = obj;
                }
            }
        });
        
        return maisProximo; // Devolve o objeto ativo para a GameScene gerir o Balão de Dica
    }

    checarInteracoesTobi(pet) {
        let objetos = [this.fiosDesc, this.painelEnergia];
        let maisProximo = null;
        
        // Iteração métrica isolada para o Tobi (Interações no ar)
        objetos.forEach(obj => {
            let distX = Math.abs(pet.x - obj.x);
            let distY = Math.abs(pet.y - obj.y);
            if (distX < 80 && distY < 120) { maisProximo = obj; }
        });
        return maisProximo;
    }

    destruir() {
        // Restaura o chão global para a próxima sala
        if(this.scene.chao) {
            this.scene.chao.setVisible(true);
            if(this.scene.chao.body) this.scene.chao.body.enable = true;
        }
        
        this.backgroundLayer.destroy();
        this.paredesElevador.destroy();
        this.chaoElevador.destroy();
        this.paredeEsq.destroy();
        this.paredeDir.destroy();
        this.tetoElevador.destroy();
        this.painelInterno.destroy();
        this.notaPoema.destroy(); 
        this.fiosDesc.destroy();
        this.painelEnergia.destroy();
        this.colisores.forEach(c => c.destroy());
    }
}