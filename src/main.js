
// Importação das cenas

import Phaser from 'phaser'; 
import PreloadScene from './scenes/PreloadScene.js'; 
import MainMenu from './scenes/MainMenu.js'; 
import MissionSelectScene from './scenes/MissionSelectScene.js'; 
import GameScene from './scenes/GameScene.js'; 
import GameOverScene from './scenes/GameOverScene.js'; 
import CutsceneScene from './scenes/CutsceneScene.js'; 

//Configuração geral do jogo

const config = {
   
    type: Phaser.AUTO, 
    
    // Resolução base do jogo em pixels
    width: 800,
    height: 600,
    
    // Essencial para jogos retro: desativa o "anti-aliasing" (borrão) 
    // das imagens para que a Pixel Art fique nítida e bem definida
    pixelArt: true, 
    
   
    // Ativação da física
    
    physics: {
        default: 'arcade', // Usa o motor físico Arcade 
        arcade: {
            gravity: { y: 800 }, // Gravidade global 
            
           
            //mostra as hitboxes 
           
            debug: false, 
        }
    },
    

    // Gerencia as cenas

    
    scene: [
        PreloadScene,
        MainMenu,
        MissionSelectScene,
        CutsceneScene,      
        GameScene,
        GameOverScene
    ]
};


// Inicialização do jogo

// Pega todas as configurações acima e injeta no motor gráfico, dando vida ao jogo
const game = new Phaser.Game(config);