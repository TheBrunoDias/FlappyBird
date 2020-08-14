const sprites = new Image();
sprites.src = './sprites.png';

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

//Sons do jogo
const som_HIT = new Audio();
som_HIT.src = './efeitos/hit.wav'

const som_pulo = new Audio();
som_pulo.src = './efeitos/pulo.wav'

const som_caiu = new Audio();
som_caiu.src = './efeitos/caiu.wav'

const som_ponto = new Audio();
som_ponto.src = './efeitos/ponto.wav'

let frames = 0;
let pontos = 0;

// [Plano de Fundo]
const planoDeFundo = {
    spriteX: 390,
    spriteY: 0,
    largura: 275,
    altura: 204,
    x: 0,
    y: canvas.height - 204,
    desenha() {
        contexto.fillStyle = '#70c5ce'; //cor do fundo
        contexto.fillRect(0, 0, canvas.width, canvas.height) //tamanho que vai cobrir o fundo
        
        //desenhar o fundo
        contexto.drawImage(
            sprites,
            planoDeFundo.spriteX, planoDeFundo.spriteY,
            planoDeFundo.largura, planoDeFundo.altura,
            planoDeFundo.x, planoDeFundo.y,
            planoDeFundo.largura, planoDeFundo.altura,
        );
        //desenhar o fundo novamente para cobrir toda o canvas
        contexto.drawImage(
            sprites,
            planoDeFundo.spriteX, planoDeFundo.spriteY,
            planoDeFundo.largura, planoDeFundo.altura,
            (planoDeFundo.x + planoDeFundo.largura), planoDeFundo.y,
            planoDeFundo.largura, planoDeFundo.altura,
        );
    },
};

// [Chao]
function criaChao() {
    const chao = {
        spriteX: 0,
        spriteY: 610,
        largura: 224,
        altura: 112,
        x: 0,
        y: canvas.height - 112, //para ficar na posição certa e não no final da tela
        atualiza() {
            //deixar o chão infinito
            const movimentoDoChao = 1;
            const repeteEm = chao.largura / 2;
            const movimentacao = chao.x - movimentoDoChao;

            chao.x = movimentacao % repeteEm;
        },
        desenha() {
            contexto.drawImage(
                sprites,
                chao.spriteX, chao.spriteY,
                chao.largura, chao.altura,
                chao.x, chao.y,
                chao.largura, chao.altura,
            );

            //para desenhar o chão porém alguns pixels para frente para preencher a tela
            contexto.drawImage(
                sprites,
                chao.spriteX, chao.spriteY,
                chao.largura, chao.altura,
                (chao.x + chao.largura), chao.y,
                chao.largura, chao.altura,
            );
        }
    };
    return chao;
}
 
//[Colisão com o Chão]
function fazColisao(flappyBird, chao) {
    const flappyBirdY = flappyBird.y + flappyBird.altura;
    const chaoY = chao.y;

    if (flappyBirdY >= chaoY) {
        return true
    } else {
        return false
    }
}

//Desenhar e reiniciar o FlappyBird sempre que perder
function criaFlappyBird() {
    const flappyBird = {
        spriteX: 0,
        spriteY: 0,
        largura: 33,
        altura: 24,
        x: 10,
        y: 50,
        pulo: 4.6,
        
        //[Animação de pular]
        pula() {
            console.log("Pulando!");
            flappyBird.velocidade = - flappyBird.pulo;
            som_pulo.play();
        },

        gravidade: 0.25,
        velocidade: 0,

        //Verificar se fez colisão com o chão
        atualiza() {
            if (fazColisao(flappyBird, globais.chao)) {
                console.log('Fez colisão');
                som_caiu.play();

                setTimeout(() => {
                    mudaParaTela(Telas.INICIO);

                }, 500);
                return;
            }
            flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade;
            flappyBird.y = flappyBird.y + flappyBird.velocidade; //para fazer o desenho 1px para baixo a cada loop
        },

        //Animação de bater asa
        movimentos: [
            { spriteX: 0, spriteY: 0, },//asa para cima
            { spriteX: 0, spriteY: 26, },//asa no meio
            { spriteX: 0, spriteY: 52, }, //asa para baixo
            { spriteX: 0, spriteY: 26, },//asa no meio
        ],
        frameAtual: 0,
        atualizaFrameAtual() {
            const intervaloDeFrames = 10;
            const passouOIntervao = frames % intervaloDeFrames === 0;
            if (passouOIntervao) {
                const basedoIncremento = 1;
                const incremento = basedoIncremento + flappyBird.frameAtual;
                const baseRepeticao = flappyBird.movimentos.length;
                flappyBird.frameAtual = incremento % baseRepeticao;
            }
        },

        //desenhar o flappy bird
        desenha() {
            flappyBird.atualizaFrameAtual();
            const { spriteX, spriteY } = flappyBird.movimentos[flappyBird.frameAtual]
            contexto.drawImage(
                sprites,
                spriteX, spriteY, // posição inicial  na sprite
                flappyBird.largura, flappyBird.altura, // Tamanho do recorte na sprite
                flappyBird.x, flappyBird.y, //posição que ira printar na tela;
                flappyBird.largura, flappyBird.altura, // tamanho que irá aparecer na tela
            );
        }
    }

    return flappyBird;
}

/// [Mensagem de Inicar]
const mensagemGetReady = {
    sX: 134,
    sY: 0,
    w: 174,
    h: 152,
    x: (canvas.width / 2) - 174 / 2,
    y: 50,
    desenha() {
        contexto.drawImage(
            sprites,
            mensagemGetReady.sX, mensagemGetReady.sY,
            mensagemGetReady.w, mensagemGetReady.h,
            mensagemGetReady.x, mensagemGetReady.y,
            mensagemGetReady.w, mensagemGetReady.h
        );
    }
}

// [criar, movimentar e colisão com os canos]
function criaCanos() {
    const canos = {
        largura: 52,
        altura: 400,
        chao: {
            spriteX: 0,
            spriteY: 169,
        },
        ceu: {
            spriteX: 52,
            spriteY: 169,
        },

        //espaço entre os canos
        espaco: 80, 

        //desenhar o cano em cima e em baixo
        desenha() {
            canos.pares.forEach(function (par) {
                const yRandom = par.y;
                const espacamentoEntreCanos = 90;

                const canoCeuX = par.x
                const canoCeuY = yRandom

                //[Cano do Céu]
                contexto.drawImage(
                    sprites,
                    canos.ceu.spriteX, canos.ceu.spriteY,
                    canos.largura, canos.altura,
                    canoCeuX, canoCeuY,
                    canos.largura, canos.altura,
                )

                const canoChaoX = par.x
                const canoChaoY = canos.altura + espacamentoEntreCanos + yRandom;
                //[Cano do Chão]
                contexto.drawImage(
                    sprites,
                    canos.chao.spriteX, canos.chao.spriteY,
                    canos.largura, canos.altura,
                    canoChaoX, canoChaoY,
                    canos.largura, canos.altura,
                )

                par.canoCeu = {
                    x: canoCeuX,
                    y: canos.altura + canoCeuY,
                }
                par.canoChao = {
                    x: canoChaoX,
                    y: canoChaoY
                }
            })

        },

        //veriricar se houve a colisão com o flappy
        temColisaoComOFlappyBird(par) {
            const cabecaDoFlappy = globais.flappyBird.y;
            const peDoFlappy = globais.flappyBird.y + globais.flappyBird.altura;

            if (globais.flappyBird.x >= par.x) {
                if (cabecaDoFlappy <= par.canoCeu.y) {
                    return true;
                }

                if (peDoFlappy >= par.canoChao.y) {
                    return true;
                }
            }
            return false;

        },

        //vetor que vai receber os canos desenhados na tela
        pares: [],

        //desenhar os canos em tamanhos aleatorios
        atualiza() {
            const passou100Frames = frames % 100 === 0;
            if (passou100Frames) {
                canos.pares.push({
                    x: canvas.width,
                    y: -150 * (Math.random() + 1),
                })
            }

            canos.pares.forEach(function (par) {
                par.x = par.x - 2;

                //se houve a colisão volta pra tela inicial
                if (canos.temColisaoComOFlappyBird(par)) {
                    som_HIT.play();
                    mudaParaTela(Telas.INICIO)
                }

                //se passou o cano soma 1 ponto e destrói o cano
                if (par.x + canos.largura <= 0) {
                    canos.pares.shift(); //deletar o cano após sair da tela
                    pontos++;
                    som_ponto.play();
                    const telaPontos = document.getElementById('pontos');
                    telaPontos.innerHTML = (pontos);
                }
            })
        }
    }
    return canos;
}



//[Telas]

const globais = {};
let telaAtiva = {};

//função para mudar de tela
function mudaParaTela(novaTela) {
    telaAtiva = novaTela;

    if (telaAtiva.inicializa) {
        telaAtiva.inicializa();
    }
}

const Telas = {

    //tela inicial
    INICIO: {
        inicializa() {
            globais.flappyBird = criaFlappyBird();
            globais.chao = criaChao();
            globais.canos = criaCanos();
        },
        desenha() {
            planoDeFundo.desenha();
            globais.flappyBird.desenha();
            globais.canos.desenha();
            globais.chao.desenha();
            mensagemGetReady.desenha();
        },
        click() {
            mudaParaTela(Telas.JOGO);
            pontos = 0;
            const telaPontos = document.getElementById('pontos');
            telaPontos.innerHTML = (pontos);
        },
        atualiza() {
            globais.chao.atualiza();
        }
    },
};

//tela do jogo que só vai entrar após o primeiro clique na tela
Telas.JOGO = {
    desenha() {
        planoDeFundo.desenha();
        globais.canos.desenha();
        globais.chao.desenha();
        globais.flappyBird.desenha();
    },
    click() {
        globais.flappyBird.pula();
    },
    atualiza() {
        globais.canos.atualiza();
        globais.chao.atualiza();
        globais.flappyBird.atualiza();
    }
}

//função que fica se chamando para dar a sensação de animação
function loop() {
    telaAtiva.desenha();
    telaAtiva.atualiza();

    frames = frames + 1;
    requestAnimationFrame(loop); //comando para chamar a função novamente, entrando no loop
}

//função que monitora os cliques na tela
window.addEventListener('click', function () {
    if (telaAtiva.click) {
        telaAtiva.click();
    }
})

mudaParaTela(Telas.INICIO);
loop();