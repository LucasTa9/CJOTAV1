export default class PortaChefao {
    constructor(scene, startX) {
        this.scene = scene;
        this.startX = startX;
        this.construirSala();
    }

    construirSala() {
        // Tonalidade 
        this.background = this.scene.add.image(this.startX + 400, 300, 'bg_subsolo').setDisplaySize(800, 600).setDepth(-1).setTint(0x333344);
        this.visualChao = this.scene.add.image(this.startX + 400, 560, 'chao_subsolo').setDisplaySize(800, 80).setDepth(0);

        
       
        //Porta
        
        this.portaBoss = this.scene.add.image(this.startX + 400, 650, 'porta_chefe')
            .setOrigin(0.5, 1)
            .setDepth(1)
            .setDisplaySize(400, 400); 
            
        this.scene.physics.add.existing(this.portaBoss, true);
        
        this.portaBoss.textoDica = "[E] ENTRAR NO NÚCLEO";
        this.portaBoss.tipoAcao = "ENTRAR_SALA";
        this.portaBoss.destinoSala = "LutaFinal"; // Roteia para LutaFinal.js
        this.portaBoss.posicaoSpawn = 100;

    }

    checarInteracoes(player) {
        let maisProximo = null;
        let distX = Math.abs(player.x - this.portaBoss.x);
        let distY = Math.abs(player.y - this.portaBoss.y);
        
        // Área de interação métrica alargada para englobar as dimensões maciças da porta Boss
        if (distX < 200 && distY < 300) { maisProximo = this.portaBoss; }
        return maisProximo;
    }
destruir() {
        this.background.destroy();
        this.visualChao.destroy();
        this.portaBoss.destroy();
    }
}