import Player from '../entities/Player.js';
import PetRobot from '../entities/PetRobot.js';

// Importação de todas as Salas. 
import Recepcao from '../rooms/Recepcao.js';
import Escritorio from '../rooms/Escritorio.js';
import Elevador from '../rooms/Elevador.js';
import SalaTI from '../rooms/SalaTI.js'; 
import DentroElevador from '../rooms/DentroElevador.js';
import Subsolo1 from '../rooms/Subsolo1.js';
import Subsolo2 from '../rooms/Subsolo2.js';
import Subsolo3 from '../rooms/Subsolo3.js'; 
import PortaChefao from '../rooms/PortaChefao.js';
import LutaFinal from '../rooms/LutaFinal.js';

export default class GameScene extends Phaser.Scene {
    constructor() { 
        super('GameScene'); 
    }

    // A função init() apanha os dados passados quando esta cena é chamada 
    init(data) {
        this.missaoAtualId = data.missaoId !== undefined ? data.missaoId : 0; 
    }

    // A função create() roda uma única vez. Configura o mundo físico, instancia UI, personagens
    create() {
        // Pára a música do menu imediatamente 
        this.sound.stopByKey('bgm_menu'); 

        
        // Limpa a memória da música para ela voltar após Game Over
        
        this.currentBGMKey = null;
        this.bgmAtual = null;
        
        // Define o limite  e a câmara do mundo
        this.physics.world.setBounds(0, 0, 800, 600);
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.physics.world.gravity.y = 800; 

        // Fundo preto puro colocado numa camada bem profunda (-2)
        this.add.rectangle(0, 0, 800, 600, 0x000000).setOrigin(0).setDepth(-2); 
        
        //Luz dinamica: A darknessLayer cria uma camada multiplicativa para gerar o efeito de escuridão total 
        this.darknessLayer = this.add.renderTexture(0, 0, 800, 600).setOrigin(0).setDepth(100).setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.coneGraphics = this.make.graphics({ add: false });
        
        // Filtro vermelho global de alerta, fica invisível até um inimigo detetar o jogador
        this.filtroVermelho = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.2).setDepth(99).setScrollFactor(0).setVisible(false);

        // Chama a montagem pesada dos minigames e do inventário
        this.setupUI();
        
        // Chão global e invisível 
        this.chao = this.add.rectangle(400, 560, 800, 80, 0x0a0a0a);
        this.physics.add.existing(this.chao, true); 

        // Variaveis de estado global: Controlam a progressão da história e evitam repetição de ações
        this.isTransitioning = false; 
        this.elevadorHackeado = false; 
        this.sistemaMasterDesbloqueado = false; 
        this.inspecionouPainelInterno = false;
        this.fiosElevadorConsertados = false;
        this.energiaElevadorAtivada = false;
        this.alvoHack = null; 

       
       //Spawn: Cria os personagens na posição correta dependendo de que missão o jogador escolheu
        
        if (this.missaoAtualId === 0) {
            this.player = new Player(this, 100, 350);
            this.pet = new PetRobot(this, 100, 150, this.player);
            this.salaAtual = new Recepcao(this, 0);
            this.player.temUpgradeTobi = false; 
            
        } else if (this.missaoAtualId === 1) {
            this.player = new Player(this, 400, 420); 
            this.pet = new PetRobot(this, 350, 380, this.player);
            this.salaAtual = new DentroElevador(this, 0);
            // Simula que a Missão 0 já foi vencida
            this.elevadorHackeado = true;
            this.sistemaMasterDesbloqueado = true;
            this.player.temUpgradeTobi = true; 
            
            // Texto de contexto narrativo ao iniciar a Missão 1
            this.time.delayedCall(500, () => {
                this.corpoTexto.setText('"O elevador trava bruscamente. Você está preso."');
                this.uiLeitura.setVisible(true);
            });
            
        } else if (this.missaoAtualId === 2) {
            this.player = new Player(this, 100, 420); 
            this.pet = new PetRobot(this, 50, 380, this.player);
            this.salaAtual = new Subsolo1(this, 0);
            this.player.temUpgradeTobi = true; 
            
        } else if (this.missaoAtualId === 3) {
            this.player = new Player(this, 100, 420); 
            this.pet = new PetRobot(this, 50, 380, this.player);
            this.salaAtual = new LutaFinal(this, 0);
            this.player.temUpgradeTobi = true; 
        }
        
        // Traz os protagonistas para cima das artes das salas
        this.player.setDepth(10); 
        this.pet.setDepth(10); 
        this.physics.add.collider(this.player, this.chao);

        // Mapeamento de Teclas vitais Inventário, Interagir, Pausa
        this.keys = this.input.keyboard.addKeys('I,E,ESC');
        
        // Sistema de movimento Tobi: O clique do mouse gera o comando de deslocação apenas para o Tobi
        this.input.on('pointerdown', (p) => { 
            if (this.isUIAberta()) return; // Não clica no chão se um ecrã estiver aberto
            this.sound.play('sfx_tobi_click');
            this.pet.destino = new Phaser.Math.Vector2(p.worldX, p.worldY); 
        });

        // Balão de dicas (aparece quando se chega perto de um objeto)
        this.balaoDica = this.add.text(0, 0, '', { fontSize: '16px', fill: '#000', backgroundColor: '#fff', padding: { x: 5, y: 2 } }).setOrigin(0.5, 1).setVisible(false).setDepth(200);

        // Lógica de "Listener" de Teclado global: Captura teclas para decifrar a senha no terminal "Computador Master"
        this.senhaPC = "";
        this.input.keyboard.on('keydown', (event) => {
            if (!this.uiComputador || !this.uiComputador.visible) return; // Só escuta se a interface do PC estiver aberta
            
            if (event.keyCode === 27) { // Tecla ESC anula tudo
                this.uiComputador.setVisible(false); this.senhaPC = ""; this.visorPC.setText('________'); 
            } 
            else if (event.keyCode === 8) { // Tecla Backspace apaga um caractere
                this.sound.play('sfx_teclar'); 
                this.senhaPC = this.senhaPC.slice(0, -1); 
            } 
            else if (event.keyCode === 13) { // Tecla Enter tenta validar
                this.sound.play('sfx_teclar'); 
                this.verificarSenhaPC(); 
            } 
            else if (event.keyCode >= 65 && event.keyCode <= 90) { // Apanha apenas letras de A até Z
                this.sound.play('sfx_teclar'); 
                if (this.senhaPC.length < 8) this.senhaPC += event.key.toUpperCase();
            }
            // Atualiza o ecrã com underlines
            this.visorPC.setText(this.senhaPC.padEnd(8, '_'));
        });

        // Configura as matrizes de Missões e escreve o primeiro objetivo no ecrã
        this.configurarMissoes();
        this.textoMissaoUI = this.add.text(20, 20, `OBJETIVO: ${this.missoes[this.missaoAtualId].etapas[0].texto}`, { fontSize: '18px', fill: '#0f0' }).setDepth(500).setScrollFactor(0); 

        // Define a música base inicial
        this.gerenciarBGM();
    }

   
   update() {
        if (this.isTransitioning) return; // Paralisa lógicas enquanto a câmara faz "fade in/out"

        // Atualiza a física de ambos os personagens
        this.player.update();
        this.pet.update();

        // Se a sala instanciada no momento tiver mecânicas ativas, atualiza
        if (this.salaAtual.update) this.salaAtual.update();

        // Faz a câmara seguir o player com lentidão (0.05 de inércia para efeito dramático)
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Verifica asala para saber se precisa de ativar a lanterna radial
        let nomeDaSala = this.salaAtual ? this.salaAtual.constructor.name : "";
        let isSalaClara = nomeDaSala.startsWith("Subsolo") || nomeDaSala === "PortaChefao" || nomeDaSala === "LutaFinal";
        
        if (isSalaClara) {
            this.darknessLayer.clear(); // Limpa escuridão
        } else {
            this.desenharLuzRadial(); 
        }

        
        // Interações: Consulta a "Sala" dinamicamente para saber
        // se o Herói ou o Pet colidiram virtualmente com objetos interactivos.
       
        let objPlayer = this.salaAtual.checarInteracoes ? this.salaAtual.checarInteracoes(this.player) : null;
        let objPetNormal = this.salaAtual.checarInteracoes ? this.salaAtual.checarInteracoes(this.pet) : null;
        let objPetEspecifico = this.salaAtual.checarInteracoesTobi ? this.salaAtual.checarInteracoesTobi(this.pet) : null;
        
        // Define o objetoAtivo dando prioridade de interação ao Robô (Tobi) em caso de sobreposição
        this.objetoAtivo = objPetEspecifico || objPetNormal || objPlayer; 

        // Interação  como as Saídas das Zonas que dão Auto-Trigger
        if (this.objetoAtivo && this.objetoAtivo.autoTrigger) {
            this.executarAcao(this.objetoAtivo);
            return; 
        }

        // Gestão do Balão de Dica. Pega a coordenada Topo do objeto atual e flutua um balão com a variável "textoDica"
        if (this.objetoAtivo && !this.isUIAberta()) {
            this.balaoDica.setVisible(true);
            this.balaoDica.setText(this.objetoAtivo.textoDica);
            let limites = this.objetoAtivo.getBounds();
            this.balaoDica.setPosition(limites.centerX, limites.top - 20);
        } else if (this.balaoDica) {
            this.balaoDica.setVisible(false);
        }

        // Interação Ativa (Premir teclas I e E)
        if (Phaser.Input.Keyboard.JustDown(this.keys.I) && !this.isUIAberta()) { this.toggleInventario(); }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            // Se está num ecrã de leitura de nota, o E serve para fechá-la
            if (this.uiLeitura && this.uiLeitura.visible) { this.uiLeitura.setVisible(false); } 
            // Senão, invoca o sistema generalista de ações baseadas no que o boneco está a ver
            else if (this.objetoAtivo && !this.isUIAberta()) { this.executarAcao(this.objetoAtivo); }
        }

       // A Tecla ESC age como o fechador global de todas as interfaces
       if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            if (this.isUIAberta()) {
                if (this.uiPause && this.uiPause.visible) { 
                    this.uiPause.setVisible(false); 
                } 
                else {
                    if (this.uiInventario && this.uiInventario.visible) this.uiInventario.setVisible(false);
                    if (this.uiLeitura && this.uiLeitura.visible) this.uiLeitura.setVisible(false);
                    if (this.uiTerminal && this.uiTerminal.visible) this.uiTerminal.setVisible(false);
                    if (this.uiQuadroCheio && this.uiQuadroCheio.visible) this.uiQuadroCheio.setVisible(false);
                    if (this.uiQuadroFernando && this.uiQuadroFernando.visible) this.uiQuadroFernando.setVisible(false);
                    if (this.uiHack && this.uiHack.visible) this.uiHack.setVisible(false);
                    if (this.uiConcertaFios && this.uiConcertaFios.visible) this.uiConcertaFios.setVisible(false);
                    
                    // Condicional especial para o PC, pois temos de varrer a palavra-passe que o utilizador começou a escrever
                    if (this.uiComputador && this.uiComputador.visible) {
                        this.uiComputador.setVisible(false);
                        this.senhaPC = ""; 
                        this.visorPC.setText('________');
                    }
                }
            } else { 
                this.uiPause.setVisible(true); // Se não há nada aberto, abre o Menu de Pausa Principal
            }
        }
        
        // Rotina que escuta os requisitos para fazer o objetivo na tela
        this.verificarMissaoAtual();
    }

    // Morte. Silencia todos os eventos, pára as velocidades e chama o GAmeOver
    triggerGameOver() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.player.body.setVelocity(0,0);
        this.pet.body.setVelocity(0,0);
        
        this.sound.stopAll(); 

        this.cameras.main.fadeOut(500, 255, 0, 0); 
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameOverScene'); 
        });
    }

   // Função utilitária para travar inputs lógicos (de movimento ou escutas do ambiente)
   isUIAberta() {
        return (this.uiLeitura && this.uiLeitura.visible) || (this.uiInventario && this.uiInventario.visible) || 
               (this.uiTerminal && this.uiTerminal.visible) || (this.uiQuadroCheio && this.uiQuadroCheio.visible) || 
               (this.uiQuadroFernando && this.uiQuadroFernando.visible) || (this.uiComputador && this.uiComputador.visible) || 
               (this.uiHack && this.uiHack.visible) || (this.uiPause && this.uiPause.visible) ||
               (this.uiConcertaFios && this.uiConcertaFios.visible); 
    }

    // Máquina de Estado de Áudio. Lê o nome da classe atual da sala instanciada e empurra a música correta 
    gerenciarBGM() {
        let trackAlvo = '';
        let nomeDaSala = this.salaAtual ? this.salaAtual.constructor.name : "";

        if (nomeDaSala === 'LutaFinal') trackAlvo = 'bgm_boss';
        else if (this.missaoAtualId === 2) trackAlvo = 'bgm_m3';
        else if (this.missaoAtualId === 0 || this.missaoAtualId === 1) trackAlvo = 'bgm_m1m2';

        if (this.currentBGMKey !== trackAlvo) {
            if (this.bgmAtual) this.bgmAtual.stop();
            if (trackAlvo !== '') {
                this.bgmAtual = this.sound.add(trackAlvo, { loop: true, volume: 0.4 });
                this.bgmAtual.play();
            }
            this.currentBGMKey = trackAlvo;
        }
    }

    // Subsistema Matemático para a Lanterna 
    desenharLuzRadial() {
        this.darknessLayer.clear().fill(0x000000, 0.98); // Opacidade severa do fundo
        this.coneGraphics.clear();
        
        // Empilha 3 círculos com Alpha decrescente sobre as coordenadas absolutas (x,y) do Mascote Cibernético
        this.coneGraphics.fillStyle(0xffffff, 0.1); this.coneGraphics.fillCircle(this.pet.x, this.pet.y, 220); 
        this.coneGraphics.fillStyle(0xffffff, 0.4); this.coneGraphics.fillCircle(this.pet.x, this.pet.y, 120); 
        this.coneGraphics.fillStyle(0xffffff, 0.8); this.coneGraphics.fillCircle(this.pet.x, this.pet.y, 50); 
        
        // Imprime a matemática gráfica por cima da câmara escura multiplicativa
        this.darknessLayer.draw(this.coneGraphics, 0, 0);
    }

    // Roteador Central. Todos os cliques e E's passam por aqui antes de se materializarem em código.
    executarAcao(objeto) {
        switch (objeto.tipoAcao) {
            // Leitura de texto
            case "LER_NOTA": 
                this.coletarNota(objeto); 
                break;
            
            //Elementos Visuais do Cenário 
            case "MOSTRAR_QUADRO_SOLAR": 
                this.sound.play('sfx_sucesso');
                this.uiQuadroCheio.setVisible(true); 
                this.player.body.setVelocityX(0); 
                break;

            case "MOSTRAR_QUADRO_FERNANDO": 
                this.sound.play('sfx_sucesso');
                this.uiQuadroFernando.setVisible(true); 
                this.player.body.setVelocityX(0); 
                break;
            
            // Interação com Cofre 
            case "ABRIR_COFRE":
                if (this.player.temKeycardTI) { 
                    this.corpoTexto.setText('"O cofre já está aberto e vazio."'); 
                    this.uiLeitura.setVisible(true); 
                } else { this.abrirTerminal(); }
                this.player.body.setVelocityX(0);
                this.pet.body.setVelocity(0,0);
                break;
            
            // Tratamento de Portas trancadas
            case "PORTA_TRANCADA":
                if (this.player.temKeycardTI) {
                    this.isTransitioning = true;
                    this.cameras.main.fadeOut(300, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.salaAtual.destruir();
                        this.salaAtual = new SalaTI(this, 0);
                        this.player.body.reset(objeto.posicaoSpawn || 100, 350);
                        this.pet.body.reset(objeto.posicaoSpawn || 100, 150);
                        this.cameras.main.fadeIn(300, 0, 0, 0);
                        this.isTransitioning = false;
                        this.gerenciarBGM();
                    });
                } else {
                    this.corpoTexto.setText('"SALA DE T.I.\nTrancada. Requer chave que está no escritório."');
                    this.uiLeitura.setVisible(true);
                }
                this.player.body.setVelocityX(0);
                break;
            
            // Ativa os Minijogos de Hack se o Tobi tiver acesso Master
            case "HACKEAR_ELEVADOR":
                if (this.player.temUpgradeTobi && this.sistemaMasterDesbloqueado) {
                    this.alvoHack = "ELEVADOR"; 
                    this.pet.destino = new Phaser.Math.Vector2(objeto.x, objeto.y);
                    this.player.body.setVelocityX(0);
                    this.time.delayedCall(800, () => { this.iniciarMiniGameHack(); });
                } else {
                    this.corpoTexto.setText('"FIREWALL ATIVO.\n\nLibere o Sistema Master na Sala de TI primeiro."');
                    this.uiLeitura.setVisible(true);
                }
                this.player.body.setVelocityX(0);
                break;
            
            // Hack para desconstruir  inimigos 
            case "HACKEAR_INIMIGO":
                this.alvoHack = "INIMIGO";
                this.sound.play('sfx_sucesso');
                this.pet.destino = new Phaser.Math.Vector2(objeto.x, objeto.y + 30);
                this.player.body.setVelocityX(0);
                this.pet.body.setVelocity(0,0);
                this.time.delayedCall(800, () => { this.iniciarMiniGameHack(); });
                break;
            
            case "HACKEAR_BOSS":
                this.alvoHack = "BOSS";
                this.sound.play('sfx_sucesso');
                this.pet.destino = new Phaser.Math.Vector2(objeto.x, objeto.y);
                this.player.body.setVelocityX(0);
                this.pet.body.setVelocity(0,0);
                
                // Trava o loop  do chefe para ele não causar Game over durante o minigame UI
                if (this.salaAtual && this.salaAtual.boss) {
                    this.salaAtual.boss.congelarParaHack();
                }

                this.time.delayedCall(800, () => { this.iniciarMiniGameHack(); });
                break;

            // Roteador de Viagem entre Ambientes 
        case "ENTRAR_SALA":

                
                if (objeto.autoTrigger) {
                    this.sound.play('sfx_transicao');
                } else {
                    this.sound.play('sfx_porta');
                }
                
                this.isTransitioning = true;
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    
                    
                    // Para a Luta Final e chama a Cutscene 
                    
                    if (objeto.destinoSala === "LutaFinal") {
                        this.sound.stopAll(); // Silencia o ambiente atual
                        this.scene.start('CutsceneScene', { missaoId: 3 }); // instancia a cena da história
                        return; // O 'return' impede que o código continue e quebre o jogo!
                    }

                    this.salaAtual.destruir(); //destroi os  elementos velhos da memória
                    
                    //Cria uma nova classe solta e injeta na referência "salaAtual"
                    if (objeto.destinoSala === "Escritorio") this.salaAtual = new Escritorio(this, 0);
                    else if (objeto.destinoSala === "Recepcao") this.salaAtual = new Recepcao(this, 0);
                    else if (objeto.destinoSala === "Elevador") this.salaAtual = new Elevador(this, 0);
                    else if (objeto.destinoSala === "SalaTI") this.salaAtual = new SalaTI(this, 0);
                    else if (objeto.destinoSala === "Subsolo2") this.salaAtual = new Subsolo2(this, 0);
                    else if (objeto.destinoSala === "Subsolo3") this.salaAtual = new Subsolo3(this, 0);
                    else if (objeto.destinoSala === "PortaChefao") this.salaAtual = new PortaChefao(this, 0);
                    
                    let nascerEmX = objeto.posicaoSpawn || 100;
                    this.player.body.reset(nascerEmX, 420); 
                    this.pet.body.reset(nascerEmX, 380);
                    this.cameras.main.fadeIn(300, 0, 0, 0);
                    this.isTransitioning = false;
                    this.gerenciarBGM(); 
                });
                break;

            // Puzzle  do Elevador 
            case "CONCERTA_FIOS":
                this.player.body.setVelocityX(0);
                this.pet.body.setVelocity(0,0);
                this.pet.destino = null; 
                
                // Avalia a situação
                if (!this.inspecionouPainelInterno) {
                    this.sound.play('sfx_erro'); 
                    this.corpoTexto.setText('"O Tobi aguarda a verificação do painel principal primeiro."');
                    this.uiLeitura.setVisible(true);
                } 
                //  Já concluiu
                else if (this.fiosElevadorConsertados) {
                    this.corpoTexto.setText('"As conexões elétricas de emergência já foram restauradas!"');
                    this.uiLeitura.setVisible(true);
                } 
                // Libertar Minigame UI
                else {
                    this.abrirConcertaFios(); 
                }
                break;
            
            case "ACESSAR_PC": this.uiComputador.setVisible(true); break;
            
            case "PAINEL_INTERNO_ELEVADOR": 
                this.sound.play('sfx_sucesso');
                this.inspecionouPainelInterno = true; 
                this.corpoTexto.setText('"SISTEMA EM EMERGÊNCIA.\n\nEnvie o Tobi para inspecionar o nucleo de energia."'); 
                this.uiLeitura.setVisible(true); 
                break;
            
            
    case "ATIVAR_ENERGIA_ELEVADOR":
                if (this.fiosElevadorConsertados) {
                    this.sound.play('sfx_energia');
                    this.energiaElevadorAtivada = true;
                    this.corpoTexto.setText('"Tobi ativou o Núcleo de Energia!\n\nAs luzes de emergência se acenderam."');
                    this.uiLeitura.setVisible(true);

                    // Espera 4 segundos
                    this.time.delayedCall(4000, () => {
                        if (this.isTransitioning) return;
                        this.isTransitioning = true;
                        this.cameras.main.fadeOut(1500, 0, 0, 0);

                        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                         
                            // para os sons e chama a Cutscene da Missão 3, ID: 2
                            
                            this.sound.stopAll();
                            this.scene.start('CutsceneScene', { missaoId: 2 });
                        });
                    });
                } else {
                    this.corpoTexto.setText('"NÚCLEO BLOQUEADO.\n\nAs Conexões Elétricas ainda estão rompidas."');
                    this.uiLeitura.setVisible(true);
                }
                this.pet.body.setVelocity(0, 0);
                break;
        }
    }

    // Leitura e coleta de notas
    coletarNota(notaColetada) {
        this.sound.play('sfx_nota');

        const bancoDeDados = this.cache.json.get('bancoDeLore');
        if (!bancoDeDados) return; 

        // Recupera o ID guardado no objeto colidido no cenário 
        const idDoArquivo = notaColetada.dadosId;

        // Se o JSON estiver quebrado, bloqueia o jogo gentilmente em vez de causar Crash crítico
        if (!bancoDeDados[idDoArquivo]) {
            console.warn("ERRO: Ficheiro de texto [" + idDoArquivo + "] não encontrado no JSON!");
            this.corpoTexto.setText('Erro 404: Arquivo corrompido ou não encontrado no banco de dados.');
            this.uiLeitura.setVisible(true);
            return; 
        }

        if (!this.player.inventario) this.player.inventario = {};
        if (!this.player.inventario.notas) this.player.inventario.notas = [];
        
        if (!this.player.inventario.notas.includes(idDoArquivo)) {
            this.player.inventario.notas.push(idDoArquivo);
        }
        
        // Remove a malha de colisão geométrica permanentemente 
        notaColetada.setVisible(false);
        if (notaColetada.body) notaColetada.body.enable = false;

        // Higienização de Strings (Apaga as aspas residuais  do formato de texto cru da IDE)
        let textoLimpo = bancoDeDados[idDoArquivo].texto.replace(/"/g, '');
        this.corpoTexto.setText(textoLimpo);
        
        this.uiLeitura.setVisible(true);
    }
    
    // Função utilitária que gera uma lista infinita a partir da Array embutida no Player
    toggleInventario() {
        const status = !this.uiInventario.visible;
        this.uiInventario.setVisible(status);
        if (status) {
            const bancoDeDados = this.cache.json.get('bancoDeLore');
            if (this.textosInventario) this.textosInventario.forEach(txt => txt.destroy());
            this.textosInventario = [];
            
            // Varredura da Matriz de Strings com ForEach e construção de linhas Y
            if (this.player.inventario.notas && this.player.inventario.notas.length > 0) {
                this.listaNotasUI.setText("");
                this.player.inventario.notas.forEach((id, index) => {
                    let doc = bancoDeDados[id];
                    let itemTxt = this.add.text(100, 150 + (index * 40), (doc.temDica ? "[!] " : "- ") + doc.titulo, { fontSize: '20px', fill: '#ffff00' }).setScrollFactor(0).setInteractive();
                    itemTxt.on('pointerdown', () => this.abrirNotaDoInventario(id));
                    this.uiInventario.add(itemTxt);
                    this.textosInventario.push(itemTxt);
                });
            } else { this.listaNotasUI.setText("Nenhum ficheiro encontrado."); }
        }
    }

    abrirNotaDoInventario(id) {
        
        let textoLimpo = this.cache.json.get('bancoDeLore')[id].texto.replace(/"/g, '');
        this.corpoTexto.setText(textoLimpo);
        this.uiInventario.setVisible(false);
        this.uiLeitura.setVisible(true);
    }

    // Cofre
    abrirTerminal() { this.senhaDigitada = ""; this.visorSenha.setText("___"); this.uiTerminal.setVisible(true); }

    clicarTerminal(valor) {
        this.sound.play('sfx_teclar'); 

        if (valor === 'X') { this.senhaDigitada = ""; this.visorSenha.setText("___"); }
        else if (valor === 'OK') {
            this.uiTerminal.setVisible(false);
            if (this.senhaDigitada === "371") { // Hardcoded Pass
                this.sound.play('sfx_desafio'); 
                this.player.temKeycardTI = true;
                this.corpoTexto.setText('"SENHA ACEITA.\n\nCofre destrancado. Keycard obtido!. Vá para Sala de TI"');
            } else {
                this.sound.play('sfx_erro');
                this.corpoTexto.setText('"SENHA INCORRETA."');
            }
            this.uiLeitura.setVisible(true);
        } else if (this.senhaDigitada.length < 3) {
            this.senhaDigitada += valor;
            this.visorSenha.setText(this.senhaDigitada.padEnd(3, '_'));
        }
    }

    //  Palavra-passe do PC Master
    verificarSenhaPC() {
        if (this.senhaPC === "MVTMASUN") {
            this.sound.play('sfx_desafio');
            this.uiComputador.setVisible(false);
            this.sistemaMasterDesbloqueado = true;
            this.player.temUpgradeTobi = true; 
            this.corpoTexto.setText('"Sistema Master Desbloqueado.\n\nTobi recebeu o Módulo de Invasão, agora voce consegue hackear o sistema"');
            this.uiLeitura.setVisible(true);
        } else {
            this.sound.play('sfx_erro'); 
            this.visorPC.setFill('#ff0000');
            this.time.delayedCall(500, () => { this.senhaPC = ""; this.visorPC.setText('________').setFill('#ffffff'); });
        }
    }

   
    //Minigame dos Fios
   
    abrirConcertaFios() {
        this.uiConcertaFios.setVisible(true);
        this.graphicsFios.clear(); 
        this.fioSelecionado = null;
        this.fiosConectados = 0;
        this.conexoesFeitas = { azul: false, verde: false, vermelho: false };
        this.textoStatusFios.setText('Clique na ponta de um fio à esquerda.').setFill('#ffffff');
    }

    selecionarFioEsq(fio) {
        if (this.conexoesFeitas[fio.id]) {
            this.textoStatusFios.setText('Esse fio já está conectado!').setFill('#ffaa00');
            return;
        }
        this.fioSelecionado = fio;
        this.textoStatusFios.setText(`Fio selecionado! Agora clique no destino correto à direita.`).setFill('#ffff00');
    }

    conectarFioDir(alvo) {
        if (!this.fioSelecionado) {
            this.textoStatusFios.setText('Primeiro clique num fio à esquerda!').setFill('#ff0000');
            return;
        }

        // Verifica se as cordenadas clicadas na direita são correspondentes ao ponto selecionado
        if (this.fioSelecionado.id === alvo.id) {
            this.conexoesFeitas[this.fioSelecionado.id] = true;
            this.fiosConectados++;

            this.graphicsFios.lineStyle(8, this.fioSelecionado.cor, 1);
            this.graphicsFios.beginPath();
            this.graphicsFios.moveTo(this.fioSelecionado.x, this.fioSelecionado.y);
            this.graphicsFios.lineTo(alvo.x, alvo.y);
            this.graphicsFios.strokePath();

            this.textoStatusFios.setText('Conexão perfeita!').setFill('#00ff00');
            this.sound.play('sfx_click'); 
            this.fioSelecionado = null; 

            // 3 ligações resolvidas acionam o Sucesso
            if (this.fiosConectados === 3) {
                this.fiosElevadorConsertados = true; 

                this.time.delayedCall(1000, () => {
                    this.uiConcertaFios.setVisible(false);
                    this.sound.play('sfx_sucesso');
                    this.corpoTexto.setText('"SISTEMA RESTAURADO!\n\nAs conexões elétricas foram consertadas com sucesso."');
                    this.uiLeitura.setVisible(true);
                });
            }
        } else {
            this.sound.play('sfx_erro');
            this.textoStatusFios.setText('ERRO: É preciso ser da mesma cor!').setFill('#ff0000');
            this.fioSelecionado = null; 
        }
    }

  
    // Hacking
   
    iniciarMiniGameHack() {
        this.uiHack.setVisible(true);
        this.hackPart1.setVisible(true);
        this.hackPart2.setVisible(false);
        this.hackPartDestruir.setVisible(false); 
        this.hackPart1.removeAll(true);
        this.escudosRestantes = 7;
        
        // Projeta Escudos em Coordenadas aleatórias na Tela Inteira
        for(let i = 0; i < 7; i++) {
            let rx = Phaser.Math.Between(200, 600);
            let ry = Phaser.Math.Between(180, 420);
            let escudo = this.add.image(rx, ry, 'escudo').setInteractive({ useHandCursor: true }).setScrollFactor(0).setScale(0.5);
            
            escudo.on('pointerdown', () => {
                this.sound.play('sfx_escudo');
                escudo.destroy(); this.escudosRestantes--;
                
                // Conclusão com ramificações. Máquinas pedem "Senhas", Robôs pedem "Destruição Imediata"
                if (this.escudosRestantes <= 0) { 
                    if (this.alvoHack === "ELEVADOR" || this.alvoHack === "TETO_ELEVADOR") {
                        this.iniciarHackParte2(); 
                    } else if (this.alvoHack === "INIMIGO" || this.alvoHack === "BOSS") {
                        this.iniciarHackDestruir();
                    }
                }
            });
            this.hackPart1.add(escudo);
        }
    }

    // Memorização 
    iniciarHackParte2() {
        this.hackPart1.setVisible(false);
        this.hackPart2.setVisible(true);
        this.quadradosHack.forEach(q => q.setTint(0xffe800)); 
        this.sequenciaHack = []; 
        this.inputHack = [];
        
        
        let ultimoBotao = -1; // Variável para lembrar qual foi o botão anterior

        for(let i = 0; i < 3; i++) { 
            let novoBotao = Phaser.Math.Between(0, 2); // Sorteia de 0 a 2
            
            // O laço 'while' obriga o jogo a sortear de novo se cair repetido
            while (novoBotao === ultimoBotao) {
                novoBotao = Phaser.Math.Between(0, 2);
            }
            
            this.sequenciaHack.push(novoBotao); // Salva na senha oficial
            ultimoBotao = novoBotao; // Atualiza a memória para o próximo giro
        }
        
        this.time.delayedCall(1000, () => this.mostrarSequenciaHack());
    }

    iniciarHackDestruir() {
        this.hackPart1.setVisible(false);
        this.hackPartDestruir.setVisible(true); 
    }

   // imterupção direta nos atributos do inimigo via Classe Original 
   clicarDestruirInimigo() {
        this.uiHack.setVisible(false);
        this.sound.play('sfx_explosao'); 
        
        if (this.alvoHack === "INIMIGO") {
            if (this.salaAtual && this.salaAtual.enemy) {
                this.salaAtual.enemy.die();
            }
        } 
        else if (this.alvoHack === "BOSS") {
            this.salaAtual.boss.estado = 'MORTO';
            this.salaAtual.boss.clearTint(); 
            
            this.sound.stopAll(); 
            this.pet.body.setVelocity(0,0);

            //  O encerramento definitivo após derrotar Adalgusta, chamando a cutscene 
            this.time.delayedCall(2000, () => {
                this.cameras.main.fadeOut(2000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('CutsceneScene', { missaoId: 4 });
                });
            });
        }
        
        this.alvoHack = "";
        this.podeClicarHack = false;
        this.inputHack = [];
    }


   mostrarSequenciaHack() {
        this.podeClicarHack = false; // Bloqueia o clique do jogador enquanto o jogo mostra a sequência
        let delay = 0;

        this.sequenciaHack.forEach((indice) => {
            this.time.delayedCall(delay, () => {
                
              
                this.sound.play('sfx_click'); 
                
                // Pisca o botão 
                this.quadradosHack[indice].setTint(0xffffff); 
                
                // Volta para a cor amarela 
                this.time.delayedCall(400, () => {
                    this.quadradosHack[indice].setTint(0xffe800); 
                });
            });
            delay += 800; // Tempo de espera para o próximo botão piscar
        });

        // Libera o jogador para clicar após a sequência terminar
        this.time.delayedCall(delay, () => {
            this.podeClicarHack = true;
        });
    }

    


//Valida click do jogador
    clicarQuadradoHack(indice) {
        if (!this.podeClicarHack) return;
        
       
        this.sound.play('sfx_click'); 

        this.quadradosHack[indice].clearTint();
        this.time.delayedCall(200, () => this.quadradosHack[indice].setTint(0xffe800));
        
        this.inputHack.push(indice);
        let posicaoAtual = this.inputHack.length - 1;
        
        // Fracasso se o jogador falhar 
        if (this.inputHack[posicaoAtual] !== this.sequenciaHack[posicaoAtual]) {
            this.sound.play('sfx_escudo');
            this.podeClicarHack = false; this.inputHack = [];
            this.quadradosHack.forEach(q => q.setTint(0xff0000));
            this.time.delayedCall(1000, () => {
                this.quadradosHack.forEach(q => q.setTint(0xffe800));
                this.mostrarSequenciaHack(); 
            });
        } 
        else if (this.inputHack.length === this.sequenciaHack.length) {
            this.uiHack.setVisible(false);
            
            // Conclusão com sucesso - Altera a hierarquia da Missão Corrente
            if (this.alvoHack === "ELEVADOR") {
                this.elevadorHackeado = true;
                this.isTransitioning = true;
                this.cameras.main.fadeOut(500, 0, 0, 0);
                
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    
                    // Para os sons e chama a Cutscene da Missão 2, ID: 1
                    
                    this.sound.stopAll();
                    this.scene.start('CutsceneScene', { missaoId: 1 });
                });
            }
        }
    }

   // Estruturação  de Eventos Lineares e Booleanas Globais 
   configurarMissoes() {
        this.missoes = [
            { id: 0, titulo: "Buscando um caminho", etapaAtual: 0, etapas: [
                { texto: "Encontre a sala do elevador.", checarConclusao: (cena) => cena.salaAtual.constructor.name === "Elevador" },
                { texto: "Libere o Sistema Master no PC.", checarConclusao: (cena) => cena.sistemaMasterDesbloqueado === true },
                { texto: "Use o Tobi para hackear o elevador.", checarConclusao: (cena) => cena.elevadorHackeado === true }
            ]},
            { id: 1, titulo: "Preso no Elevador", etapaAtual: 0, etapas: [
                { texto: "Inspecione o painel interno.", checarConclusao: (cena) => cena.inspecionouPainelInterno === true },
                { texto: "Restaute a energia.", checarConclusao: (cena) => cena.fiosElevadorConsertados === true },
                { texto: "Ligue o elevador.", checarConclusao: (cena) => cena.energiaElevadorAtivada === true } 
            ]},
            { id: 2, titulo: "O Subsolo", etapaAtual: 0, etapas: [
                { texto: "Vá até a sala do núcleo de Adalgusta.", checarConclusao: (cena) => cena.salaAtual.constructor.name === "PortaChefao" }
            ]},
            { id: 3, titulo: "A Batalha Final", etapaAtual: 0, etapas: [
                { texto: "Derrote a Adalgusta ", checarConclusao: (cena) => false }
            ]}
        ];
    }

    // Leitor que atualiza os elementos UI Base no canto superior esquerdo da tela sempre que a validação for True
    verificarMissaoAtual() {
        let missao = this.missoes[this.missaoAtualId];
        if (!missao || missao.etapaAtual >= missao.etapas.length) return;
        if (missao.etapas[missao.etapaAtual].checarConclusao(this)) {
            missao.etapaAtual++;
            this.sound.play('sfx_objetivo');
            if (missao.etapaAtual < missao.etapas.length) this.textoMissaoUI.setText(`OBJETIVO: ${missao.etapas[missao.etapaAtual].texto}`);
            else this.textoMissaoUI.setText("MISSÃO CONCLUÍDA!").setColor('#ffff00');
        }
    }

    // Chamdo no  Create(). Gera todos os subníveis da Interface
    setupUI() {
        // UI Minigame Fios
        this.uiConcertaFios = this.add.container(0, 0).setDepth(1600).setVisible(false);

        let fundoEscuroFios = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.95).setScrollFactor(0);
        let imagemFios = this.add.image(400, 300, 'painelFiosSala').setScrollFactor(0).setDisplaySize(600, 480);
        this.graphicsFios = this.add.graphics().setScrollFactor(0);
        this.textoStatusFios = this.add.text(400, 540, 'Selecione um fio à esquerda!', { fontSize: '20px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        this.uiConcertaFios.add([fundoEscuroFios, imagemFios, this.graphicsFios, this.textoStatusFios]);

      // Array mapeando pontos fixos dos fios Esquerda e alvos de destino da Direita
        this.botoesEsq = [
            { id: 'azul', x: 185, y: 245, cor: 0x0088ff },
            { id: 'verde', x: 185, y: 325, cor: 0x00ff00 },
            { id: 'vermelho', x: 185, y: 405, cor: 0xff0000 }
        ];

        this.botoesEsq.forEach(fio => {
            let btn = this.add.circle(fio.x, fio.y, 18, fio.cor, 0.8).setInteractive({ useHandCursor: true }).setScrollFactor(0);
            btn.on('pointerdown', () => this.selecionarFioEsq(fio));
            this.uiConcertaFios.add(btn);
        });

        this.botoesDir = [
            { id: 'vermelho', x: 615, y: 200 }, 
            { id: 'verde', x: 615, y: 278 },    
            { id: 'azul', x: 615, y: 355 },     
            { id: 'errado1', x: 615, y: 395 },  
            { id: 'errado2', x: 615, y: 475 }   
        ];

        this.botoesDir.forEach(alvo => {
            let btn = this.add.circle(alvo.x, alvo.y, 18, 0xffffff, 0.8).setInteractive({ useHandCursor: true }).setScrollFactor(0);
            btn.on('pointerdown', () => this.conectarFioDir(alvo));
            this.uiConcertaFios.add(btn);
        });
        
        // UI Inventário
        this.uiInventario = this.add.container(0, 0).setDepth(1000).setVisible(false);
        this.uiInventario.add([
            this.add.rectangle(400, 300, 800, 600, 0x050505, 0.98).setScrollFactor(0),
            this.add.text(400, 50, 'Inventário', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5).setScrollFactor(0),
            this.listaNotasUI = this.add.text(100, 150, '', { fontSize: '18px', fill: '#fff' }).setScrollFactor(0)
        ]);

        this.uiLeitura = this.add.container(0, 0).setDepth(1100).setVisible(false);
        this.corpoTexto = this.add.text(400, 300, '', { fontSize: '32px', align: 'center', wordWrap: { width: 600 }, fill: '#000000' }).setOrigin(0.5).setScrollFactor(0);
        this.uiLeitura.add([
            this.add.rectangle(400, 300, 800, 600, 0xffffff, 0.99).setScrollFactor(0), 
            this.corpoTexto, this.add.text(400, 550, 'Pressiona [E] para fechar', { fontSize: '16px', fill: '#555' }).setOrigin(0.5).setScrollFactor(0)
        ]);

        // Ui Cofre
        this.uiTerminal = this.add.container(0, 0).setDepth(1200).setVisible(false);
        this.uiTerminal.add(this.add.rectangle(400, 300, 800, 600, 0x000000, 0.90).setScrollFactor(0));
        this.uiTerminal.add(this.add.rectangle(400, 300, 350, 480, 0x051105).setStrokeStyle(4, 0x00ff00).setScrollFactor(0));
        this.uiTerminal.add(this.add.text(400, 110, 'SISTEMA DE SEGURANÇA', { fontSize: '20px', fill: '#00ff00' }).setOrigin(0.5).setScrollFactor(0));
        this.visorSenha = this.add.text(400, 170, '___', { fontSize: '48px', fill: '#00ff00', letterSpacing: 10 }).setOrigin(0.5).setScrollFactor(0);
        this.uiTerminal.add(this.visorSenha);
        const botoes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'X', '0', 'OK'];
        let startX = 300; let startY = 260;
        botoes.forEach((btn, index) => {
            let col = index % 3; let row = Math.floor(index / 3);
            let x = startX + (col * 100); let y = startY + (row * 75); 
            let fundoBtn = this.add.rectangle(x, y, 80, 55, 0x0a220a).setStrokeStyle(2, 0x00ff00).setScrollFactor(0).setInteractive({ useHandCursor: true });
            let textBtn = this.add.text(x, y, btn, { fontSize: '28px', fill: '#00ff00' }).setOrigin(0.5).setScrollFactor(0);
            fundoBtn.on('pointerdown', () => this.clicarTerminal(btn));
            this.uiTerminal.add([fundoBtn, textBtn]);
        });
        this.uiTerminal.add(this.add.text(400, 500, '[ SAIR ]', { fontSize: '18px', fill: '#00ff00' }).setOrigin(0.5).setScrollFactor(0).setInteractive().on('pointerdown', () => this.uiTerminal.setVisible(false)));

        // Ui ver quadros
        this.uiQuadroCheio = this.add.container(0, 0).setDepth(1300).setVisible(false);
        let fundoQuadro = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.95).setScrollFactor(0).setInteractive({ useHandCursor: true });
        fundoQuadro.on('pointerdown', () => { this.uiQuadroCheio.setVisible(false); });
        let moldura = this.add.rectangle(400, 300, 600, 400, 0x000000).setStrokeStyle(6, 0x22b14c).setScrollFactor(0);
        let imagemGrande = this.add.image(400, 300, 'quadro_solar').setDisplaySize(580, 380).setScrollFactor(0);
        let textoFechar = this.add.text(400, 560, 'Clique fora da imagem para fechar', { fontSize: '18px', fill: '#aaaaaa', fontStyle: 'italic' }).setOrigin(0.5).setScrollFactor(0);
        this.uiQuadroCheio.add([fundoQuadro, moldura, imagemGrande, textoFechar]);

        this.uiQuadroFernando = this.add.container(0, 0).setDepth(1301).setVisible(false);
        let fundoQuadroF = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.95).setScrollFactor(0).setInteractive({ useHandCursor: true });
        fundoQuadroF.on('pointerdown', () => { this.uiQuadroFernando.setVisible(false); });
        let molduraF = this.add.rectangle(400, 300, 420, 420, 0x000000).setStrokeStyle(6, 0xffaa00).setScrollFactor(0);
        let imagemGrandeF = this.add.image(400, 300, 'quadro_fernando').setDisplaySize(400, 400).setScrollFactor(0);
        let textoFecharF = this.add.text(400, 560, 'Clique fora da imagem para fechar', { fontSize: '18px', fill: '#aaaaaa', fontStyle: 'italic' }).setOrigin(0.5).setScrollFactor(0);
        this.uiQuadroFernando.add([fundoQuadroF, molduraF, imagemGrandeF, textoFecharF]);

       // Ui PC Master 
        this.uiComputador = this.add.container(0, 0).setDepth(1400).setVisible(false);
        this.uiComputador.add(this.add.rectangle(400, 300, 800, 600, 0x000000, 0.95).setScrollFactor(0));
        this.uiComputador.add(this.add.rectangle(400, 300, 600, 300, 0x001133).setStrokeStyle(4, 0x00aaff).setScrollFactor(0));
        this.uiComputador.add(this.add.text(400, 180, 'SISTEMA MASTER', { fontSize: '32px', fill: '#00aaff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0));
        this.visorPC = this.add.text(400, 260, '________', { fontSize: '48px', fill: '#ffffff', letterSpacing: 15 }).setOrigin(0.5).setScrollFactor(0);
        this.uiComputador.add(this.visorPC);
        let textoDicaTeclado = this.add.text(400, 340, 'Use o seu teclado para digitar a palavra-passe', { fontSize: '18px', fill: '#aaaaaa', fontStyle: 'italic' }).setOrigin(0.5).setScrollFactor(0);
        let textoBotoesPC = this.add.text(400, 390, '[ ENTER ] Confirmar   |   [ ESC ] Fechar', { fontSize: '20px', fill: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        this.uiComputador.add([textoDicaTeclado, textoBotoesPC]);

        // Ui Hacking
        this.uiHack = this.add.container(0, 0).setDepth(1500).setVisible(false);
        let fundoVert = this.add.image(400, 300, 'telahack').setDisplaySize(600, 400).setScrollFactor(0);
        this.uiHack.add(fundoVert);
        let textoHack = this.add.text(400, 140, 'BYPASS DE SEGURANÇA', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5).setScrollFactor(0);
        this.uiHack.add(textoHack);
        
        this.hackPart1 = this.add.container(0, 0);
        this.uiHack.add(this.hackPart1);
        
        this.hackPart2 = this.add.container(0, 0).setVisible(false);
        this.uiHack.add(this.hackPart2);
        this.quadradosHack = [];
        for (let i = 0; i < 3; i++) {
            let q = this.add.image(250 + (i * 150), 300, 'botao_hack')
                .setDisplaySize(80, 80)
                .setTint(0xffe800) // Amarelo
                .setInteractive({ useHandCursor: true })
                .setScrollFactor(0);
            this.quadradosHack.push(q); this.hackPart2.add(q);
            q.on('pointerdown', () => this.clicarQuadradoHack(i));
        }
        
        this.hackPartDestruir = this.add.container(0, 0).setVisible(false);
        this.uiHack.add(this.hackPartDestruir);
        
        let btnDestruir = this.add.rectangle(400, 300, 250, 80, 0xcc0000).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        let txtDestruir = this.add.text(400, 300, 'DESTRUIR', { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        
        btnDestruir.on('pointerdown', () => this.clicarDestruirInimigo());
        btnDestruir.on('pointerover', () => btnDestruir.setFillStyle(0xff0000));
        btnDestruir.on('pointerout', () => btnDestruir.setFillStyle(0xcc0000));
        
        this.hackPartDestruir.add([btnDestruir, txtDestruir]);

        // Ui pause
        this.uiPause = this.add.container(0, 0).setDepth(2000).setVisible(false);
        this.uiPause.add(this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9).setScrollFactor(0));
        this.uiPause.add(this.add.text(400, 100, 'PAUSA / CONTROLES', { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0));
        let controlesTexto = "MOVIMENTO: Teclas W, A, S, D ou Setas\n\nINTERAÇÃO: Tecla [ E ]\n\nINVENTÁRIO: Tecla [ I ]\n\nCOMANDAR O TOBI: Clique do Mouse\n\nPAUSAR / FECHAR: Tecla [ ESC ]";
        this.uiPause.add(this.add.text(400, 250, controlesTexto, { fontSize: '20px', fill: '#00ff00', align: 'center', lineSpacing: 10 }).setOrigin(0.5).setScrollFactor(0));
        let btnVoltar = this.add.text(400, 420, 'VOLTAR AO JOGO', { fontSize: '24px', fill: '#ffffff', backgroundColor: '#333333', padding: {x: 10, y: 10} }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
        btnVoltar.on('pointerdown', () => { this.sound.play('sfx_click'); this.uiPause.setVisible(false); });
        let btnSair = this.add.text(400, 500, 'SAIR PARA O MENU', { fontSize: '24px', fill: '#ffffff', backgroundColor: '#8b0000', padding: {x: 10, y: 10} }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
        btnSair.on('pointerdown', () => { 
            this.sound.stopAll();
            this.sound.play('sfx_click'); 
            if (this.bgmAtual) this.bgmAtual.stop(); 
            this.scene.start('MainMenu'); 
        });
        this.uiPause.add([btnVoltar, btnSair]);
    }
}