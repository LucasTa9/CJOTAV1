export default class MainMenu extends Phaser.Scene {
    // Construtor da cena
    constructor() { super('MainMenu'); }

    create() {
        
        // SISTEMA DE ÁUDIO (Música de Fundo)
        
        // Verifica se a música do menu já está carregada na memória
        let bgm = this.sound.get('bgm_menu');
        if (!bgm) {
            // Se não existir, cria a música em loop com volume em 30% e dá o play
            bgm = this.sound.add('bgm_menu', { loop: true, volume: 0.3 });
            bgm.play();
        } else if (!bgm.isPlaying) {
            // Se já existir mas estiver pausada , toca novamente
            bgm.play();
        }

       
        // Fundo e Titulo
        
        // Imagem de fundo esticada para preencher a tela inteira 
        this.add.image(400, 300, 'bg_menu').setDisplaySize(800, 600);
        
        // Retângulo preto semi-transparente  
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.4);

        // Título do jogo centralizado no topo 
        this.add.image(380, 110, 'titulo_jogo').setScale(1.2);

        // Ícone decorativo
        this.add.image(100, 500, 'icone_jogo')
            .setDisplaySize(150, 150) 
            .setDepth(1); 

        
        // BoTões do Menu Pincipal
        // Inicia o jogo do zero 
        this.createMenuButton(400, 280, 'NOVO JOGO', () => {
            this.sound.play('sfx_click');
            this.scene.start('CutsceneScene', { missaoId: 0 });
        });

        //Vai para a tela de seleção de fases
        this.createMenuButton(400, 350, 'SELECIONAR MISSÃO', () => {
            this.sound.play('sfx_click');
            this.scene.start('MissionSelectScene');
        });

        // Abre a interface  de Controles
        this.createMenuButton(400, 420, 'CONTROLES', () => {
            if (this.sound.get('sfx_click')) this.sound.play('sfx_click'); 
            this.uiControles.setVisible(true); 
        });

        //tenta fechar a aba do navegador
        this.createMenuButton(400, 490, 'SAIR', () => {
            this.sound.play('sfx_click');
            this.cameras.main.fadeOut(1000, 0, 0, 0); // Tela escurece em 1 segundo
            
            // Aguarda a tela escurecer totalmente e tenta fechar a janela do navegador
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                window.close(); 
            });
        });

        // =========================================================
        // TELA DE CONTROLES (Container UI)
        // Agrupa os elementos da tela de controles para escondê-los/mostrá-los de uma vez
        // =========================================================
        // setDepth(100) garante que esta tela ficará por cima de absolutamente tudo no menu
        this.uiControles = this.add.container(0, 0).setDepth(100).setVisible(false);
        
        // Fundo quase totalmente preto (alpha 0.95) para bloquear a visão do menu atrás
        let fundoControles = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.95);
        
        // Título da janela de controles
        let tituloControles = this.add.text(400, 80, 'CONTROLES DO JOGO', { 
            fontSize: '36px', fill: '#00ff00', fontStyle: 'bold' 
        }).setOrigin(0.5); // setOrigin(0.5) centraliza o texto no eixo X e Y
        
        // Texto formatado com as instruções e quebras de linha (\n)
        let textoComandos = this.add.text(400, 260, 
            '[ W, A, S, D ] ou [ SETAS ] - Mover o Personagem\n\n' +
            '[ E ] - Interagir, Hackear e Ler Notas\n\n' +
            '[ I ] - Interagir com inventario\n\n' +
            '[ CLICK ] - Movimento Tobi\n\n' +
            '[ ENTER ] - Confirmar Senhas e Avançar Cutscenes\n\n' +
            '[ ESC ] - Fechar Janelas e Pausar o Jogo', 
            { fontSize: '22px', fill: '#ffffff', align: 'center', lineSpacing: 25 }
        ).setOrigin(0.5);
        
        // Botão para fechar a tela de controles
        let btnVoltar = this.add.text(400, 560, '[ VOLTAR ]', { 
            fontSize: '28px', fill: '#00ff00', fontStyle: 'bold' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }); // setInteractive transforma o texto num botão clicável

        // Efeitos de Hover (passar o mouse) no botão VOLTAR
        btnVoltar.on('pointerover', () => btnVoltar.setTint(0xff8888)); // Fica avermelhado
        btnVoltar.on('pointerout', () => btnVoltar.clearTint()); // Volta à cor normal
        btnVoltar.on('pointerdown', () => { // Evento de clique
            if (this.sound.get('sfx_click')) this.sound.play('sfx_click'); 
            this.uiControles.setVisible(false); // Esconde o container inteiro
        });

        // Adiciona todos os elementos criados acima para dentro do Container
        this.uiControles.add([fundoControles, tituloControles, textoComandos, btnVoltar]);
    }

    // =========================================================
    // FUNÇÃO AUXILIAR PARA CRIAR BOTÕES
    // Evita repetir a configuração de cor, tamanho e eventos de mouse para cada botão
    // =========================================================
    createMenuButton(x, y, text, onClick) {
        // Cria o texto com fundo cinza escuro (#222222) e espaçamento interno (padding)
        const button = this.add.text(x, y, text, {
            fontSize: '28px', fill: '#ffffff', backgroundColor: '#222222', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Muda as cores quando o mouse entra na área do botão (Hover)
        button.on('pointerover', () => button.setStyle({ fill: '#00ff00', backgroundColor: '#111111' }));
        
        // Restaura as cores originais quando o mouse sai da área
        button.on('pointerout', () => button.setStyle({ fill: '#ffffff', backgroundColor: '#222222' }));
        
        // Dispara a função (callback) enviada nos parâmetros quando houver o clique
        button.on('pointerdown', onClick);
        
        return button;
    }
}