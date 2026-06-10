export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {

        // Tela que  Avisa ao jogador que o jogo está carregando 


        this.loadingText = this.add.text(400, 300, 'CONECTANDO AO SISTEMA...', {
            fontSize: '24px', fill: '#00ff00', fontStyle: 'bold', fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(1);

        // Efeito de pulsação na opacidade do texto
        this.tweens.add({ targets: this.loadingText, alpha: 0.2, yoyo: true, repeat: -1, duration: 600 });


        // Carregamento dos Gráficos base da Interface

        this.load.image('logo_preload', 'public/assets/tilesets/preloadtobis2.png');
        this.load.image('icone_jogo', 'public/assets/tilesets/icone.png');
        this.load.image('titulo_jogo', 'public/assets/tilesets/nomedogammenu.png');
        this.load.image('fonte_soft', 'public/assets/tilesets/soft.png'); // Mapa de bits para a fonte retro
        this.load.image('botao_hack', 'public/assets/tilesets/botaohack.png');
        this.load.image('quadro_fernando', 'public/assets/tilesets/fernandoflutuando.png');

        // Banco de Dados JSON 
        this.load.json('bancoDeLore', 'public/data/arquivos_lore.json');

        // Elementos de Cenário
        this.load.image('quadro_solar', 'public/assets/tilesets/quadro_solar.png');
        this.load.image('fundo_escritorio', 'public/assets/tilesets/fundoescritorio.png');

        // SpriteSheets
        this.load.spritesheet('player_sprite', 'public/assets/sprites/male_hero.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pet_sprite', 'public/assets/sprites/Player_Sprite_Sheet.png', { frameWidth: 32, frameHeight: 32 });
        // Elementos de Cenário
        this.load.image('fundo_pedra', 'public/assets/tilesets/backgroundrecepeleva.jpg');
        this.load.image('chao_madeira', 'public/assets/tilesets/chaom1.jpg');
        this.load.image('porta', 'public/assets/tilesets/portas.png');
        this.load.image('nota_parede', 'public/assets/tilesets/notaparede.png');
        this.load.image('nota_chao', 'public/assets/tilesets/notanochao.png');
        this.load.image('painel', 'public/assets/tilesets/paineis.png');
        this.load.image('cofre', 'public/assets/tilesets/cofeescritorio.png');
        this.load.image('mesa_comp', 'public/assets/tilesets/mesacomputador.png');
        this.load.image('img_elevador', 'public/assets/tilesets/elevador.png');
        this.load.image('escudo', 'public/assets/tilesets/gameescudo.png');

        this.load.image('painelFiosSala', 'public/assets/tilesets/painelminigamefios.jpg');
        this.load.image('caixaEletricaSala', 'public/assets/tilesets/caixaeletrica.jpg');
        this.load.image('bg_gameover', 'public/assets/tilesets/backgrounGameover.png');

        // Spritesheets 
        this.load.spritesheet('enemy_idle', 'public/assets/sprites/EnemyRobot_Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy_shot', 'public/assets/sprites/EnemyRobot_Shot.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy_death', 'public/assets/sprites/EnemyRobot_Death.png', { frameWidth: 32, frameHeight: 32 });
        // Elementos de Cenário
        this.load.image('bg_menu', 'public/assets/tilesets/backgroudnMenueSelecao.png');
        this.load.image('bg_subsolo', 'public/assets/tilesets/fundosubsolo.png');
        this.load.image('chao_subsolo', 'public/assets/tilesets/chaosubsolos.jpg');
        this.load.image('obstaculo_engrenagem', 'public/assets/tilesets/obstaculogira.png');
        this.load.image('porta_chefe', 'public/assets/tilesets/portachefefinal.png');

        this.load.image('telahack', 'public/assets/tilesets/telahack.png');
        this.load.image('img_final', 'public/assets/tilesets/endcena.png');


        // Carregamento dos Áudios e Trilhas

        this.load.audio('bgm_menu', 'public/assets/audio/musicmenuandmissaoselect.mp3');
        this.load.audio('bgm_m1m2', 'public/assets/audio/musicm1m2.mp3');
        this.load.audio('bgm_m3', 'public/assets/audio/musicm3.mp3');
        this.load.audio('bgm_boss', 'public/assets/audio/musicafinalboss.mp3');

        // SFX 
        this.load.audio('sfx_sucesso', 'public/assets/audio/acertarsenhaecofre.ogg');
        this.load.audio('sfx_click', 'public/assets/audio/clickopcoesmenuegameover.ogg');
        this.load.audio('sfx_erro', 'public/assets/audio/errotaks.mp3');
        this.load.audio('sfx_andar', 'public/assets/audio/andar.mp3');
        this.load.audio('sfx_escudo', 'public/assets/audio/destruirescudo.mp3');
        this.load.audio('sfx_explosao', 'public/assets/audio/destruirenemy.mp3');
        this.load.audio('sfx_cansado', 'public/assets/audio/chefecansado.mp3');
        this.load.audio('sfx_porta', 'public/assets/audio/entrarportas.mp3');
        this.load.audio('sfx_transicao', 'public/assets/audio/retanguloinvisivel.mp3');
        this.load.audio('sfx_objetivo', 'public/assets/audio/objetivotroca.mp3');
        this.load.audio('sfx_preload', 'public/assets/audio/preloadaudio.mp3');
        this.load.audio('sfx_missao2', 'public/assets/audio/scenemissao2.mp3');
        this.load.audio('sfx_tobi_click', 'public/assets/audio/somtobiclick.ogg');
        this.load.audio('sfx_enemy_idle', 'public/assets/audio/enemydescansando.ogg');
        this.load.audio('sfx_enemy_ataque', 'public/assets/audio/enemyvigiando.ogg');
        this.load.audio('sfx_desafio', 'public/assets/audio/completoudesafio.mp3');
        this.load.audio('sfx_teclar', 'public/assets/audio/pcteclar.mp3');
        this.load.audio('sfx_energia', 'public/assets/audio/energionelevator.mp3');
        this.load.audio('sfx_nota', 'public/assets/audio/notas.mp3');
        this.load.audio('sfx_final', 'public/assets/audio/finalaudio.mp3');
        this.load.audio('sfx_boss_ataque', 'public/assets/audio/atackboss.mp3');

        //SpriteBoss
        this.load.image('boss_ataque', 'public/assets/tilesets/rostochefeataque.png');
        this.load.image('boss_hackeavel', 'public/assets/tilesets/chefehackeavel.png');
    }

    create() {

        // Configurações do Bitmap FONT com acentuação

        let caracteresComAcentos = "";


        for (let i = 32; i <= 255; i++) {
            caracteresComAcentos += String.fromCharCode(i);
        }


        let configFonte = {
            image: 'fonte_soft',
            width: 8,
            height: 8,
            chars: caracteresComAcentos,
            charsPerRow: 16
        };

        // Analisa e regista a fonte recém-criada na memória cache do Phaser 
        this.cache.bitmapFont.add('soft_font', Phaser.GameObjects.RetroFont.Parse(this, configFonte));


        // Transição do carregamento para o menu


        //Mostra a Logo de Fundo e som de introdução
        this.add.image(400, 300, 'logo_preload').setDisplaySize(800, 600).setDepth(0);
        this.sound.play('sfx_preload');

        //Muda o texto de Carregando e coloca no começo da tela
        this.loadingText.setPosition(400, 560);
        this.loadingText.setText('SISTEMA PRONTO. INICIANDO...');

        //Temporizador de 3 segundos
        this.time.delayedCall(3000, () => {
            this.scene.start('MainMenu');
        });
    }
}