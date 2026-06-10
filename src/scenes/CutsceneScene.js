export default class CutsceneScene extends Phaser.Scene {
    constructor() { 
        super('CutsceneScene'); 
    }

    // Apanha o ID da missão enviado pela cena anterior (ex: vindo do Menu ou da Seleção de Missão)
    init(data) {
        this.missaoId = data.missaoId !== undefined ? data.missaoId : 0;
    }

    create() {
       
        // Fundo e Configurações
    
        this.add.rectangle(400, 300, 800, 600, 0x000000);

        let textoCutscene = "";
        let yTexto = 260; // Posição Y padrão para centralizar o texto na tela

        //Cena final
        if (this.missaoId === 4) {
            // Adiciona a arte final 
            this.add.image(400, 300, 'img_final').setDisplaySize(800, 600);
            
           
            this.add.rectangle(400, 480, 800, 160, 0x000000, 0.7);
            
           
            yTexto = 480; 
        }

       
        // ifs narrativos, define o texto e a música baseando-se no ID da Missão
        
        if (this.missaoId === 0) {
            textoCutscene = "Um programador que se considerava jurássico e excepcional e fazia parte dos 1% dos programadores, criou uma IA chamada ADALGUSTA.\n\nEla saiu do controle e começou a causar o fim do mundo...\n\nEntão Mauro e Tobi foram até a base secreta onde fica o núcleo de Adalgusta para impedi-la.";
        } 
        else if (this.missaoId === 1) {
            textoCutscene = "Mauro e Tobi conseguiram acessar o elevador principal.\n\nA descida rumo às profundezas do Laboratório Ômega começa agora..., mas a energia caiu.";
             this.sound.play('sfx_missao2', { volume: 1.0 });
        } 
        else if (this.missaoId === 2) {
            textoCutscene = "Após restaurar a energia, o elevador desceu.\n\nEles finalmente chegaram ao Subsolo. O núcleo de Adalgusta está próximo.";
        } 
        else if (this.missaoId === 3) {
            textoCutscene = " Mauro e Tobi finalmente encontram as grandes portas do Núcleo Central.\n\nAdalgusta percebe a invasão e inicia seu protocolo de defesa.\n\nO Nucleo é ela. Destrua!";
        } 
        else if (this.missaoId === 4) {
            textoCutscene = "Adalgusta derrotada!\n\nVocê e Tobi conseguiram eliminar a ameaça e escapar das profundezas do Laboratório .";
            
            this.sound.play('sfx_final'); 

          
            this.add.rectangle(400, 80, 800, 80, 0x000000, 0.7);
            this.add.bitmapText(400, 80, 'soft_font', 'PARABÉNS! O JOGO TERMINOU!', 32)
                .setOrigin(0.5)
                .setTint(0xffd700) 
                .setCenterAlign();
        }

        
        // Texto com fontBitmap
        
        this.add.bitmapText(400, yTexto, 'soft_font', textoCutscene, 24)
            .setOrigin(0.5)
            .setTint(0xffffff)    
            .setMaxWidth(650)     // Força a quebra de linha  para não sair da tela
            .setCenterAlign();    // Alinha o parágrafo ao centro

        
        // texto para jogador
       
        let txtContinuar = this.add.bitmapText(400, 560, 'soft_font', 'Pressione [ ENTER ] ou Clique para iniciar...', 16)
            .setOrigin(0.5)
            .setTint(0xffffff);

        // Animação (Tween) que altera a transparência (alpha) repetidamente para simular efeito de "piscar"
        this.tweens.add({ targets: txtContinuar, alpha: 0.2, yoyo: true, repeat: -1, duration: 800 });

       
        // Enter ou clique mouse
    
        let iniciou = false; // Trava (flag) para impedir duplo clique

        let iniciarFase = () => {
            if (iniciou) return; // Se a transição já começou, ignora o comando
            iniciou = true;
            
            this.sound.play('sfx_click');
            
            // Interrompe faixas específicas de áudio da cutscene para não vazarem para a GameScene
            if (this.missaoId === 2) this.sound.stopByKey('sfx_missao2');
            if (this.missaoId === 4) this.sound.stopByKey('sfx_final');

            // Efeito visual de Fade Out (A tela escurece em 1 segundo)
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            
            // Aguarda o término do Fade Out para mudar de cena
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                
                // Se foi a cena final, reinicia o ciclo devolvendo ao Menu Principal
                if (this.missaoId === 4) {
                    this.scene.start('MainMenu');
                } 
                // Se for as missões 0, 1, 2 ou 3, injeta o jogador na GameScene passando o ID atual
                else {
                    this.scene.start('GameScene', { missaoId: this.missaoId });
                }
            });
        };

        // Regista os gatilhos para chamar a transição
        this.input.on('pointerdown', iniciarFase);
        this.input.keyboard.on('keydown-ENTER', iniciarFase);
    }
}