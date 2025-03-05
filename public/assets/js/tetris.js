/**
 * Tetris dos Cria - Jogo Moderno em JavaScript Puro
 * Desenvolvido por DevFerreiraG
 * https://linkedin.com/in/DevFerreiraG
 */

class TetrisGame {
    constructor() {
        // Canvas e contexto - com verificação de existência
        this.canvas = document.getElementById('game-board');
        if (!this.canvas) {
            console.error('Elemento do canvas principal não encontrado!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas para próxima peça - verificando existência
        this.nextPieceCanvas = document.getElementById('next-piece');
        this.nextPieceCtx = this.nextPieceCanvas ? this.nextPieceCanvas.getContext('2d') : null;
        
        // Canvas para partículas - verificando existência
        this.particlesCanvas = document.getElementById('particles-canvas');
        this.particlesCtx = this.particlesCanvas ? this.particlesCanvas.getContext('2d') : null;
        
        // Dimensões do tabuleiro
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.cellSize = this.canvas.width / this.boardWidth;
        
        // Estado do jogo
        this.gameOver = false;
        this.isPaused = false;
        this.isRunning = false;
        this.board = this.createEmptyBoard();
        this.particles = [];
        
        // Pontuação e nível
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.combo = 0;
        this.highscore = parseInt(localStorage.getItem('tetrisDosCriaHighscore')) || 0;
        
        // Referências dos elementos HTML - com verificação de existência
        this.scoreElement = document.getElementById('score');
        this.highscoreElement = document.getElementById('highscore');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameOverElement = document.getElementById('game-over');
        
        // Peça atual e próxima
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Velocidade do jogo (ms)
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        
        // Definição das peças do Tetris (formato e cor)
        this.pieces = [
            { shape: [[1, 1, 1, 1]], color: '#00FFFF' },                        // I
            { shape: [[1, 1, 1], [0, 1, 0]], color: '#800080' },                // T
            { shape: [[1, 1, 0], [0, 1, 1]], color: '#00FF00' },                // S
            { shape: [[0, 1, 1], [1, 1, 0]], color: '#FF0000' },                // Z
            { shape: [[1, 1], [1, 1]], color: '#FFFF00' },                      // O
            { shape: [[1, 1, 1], [1, 0, 0]], color: '#0000FF' },                // J
            { shape: [[1, 1, 1], [0, 0, 1]], color: '#FF7F00' }                 // L
        ];
        
        // Manipuladores de eventos para cenários do mundo real (bateria baixa, página oculta)
        this.setupRealWorldHandlers();
        
        // Inicializa os manipuladores de eventos
        this.initEventHandlers();
        
        // Atualiza o display inicial
        this.updateScoreDisplay();
    }
    
    /**
     * Configura manipuladores de eventos para cenários do mundo real
     */
    setupRealWorldHandlers() {
        // Pausar o jogo quando a página estiver oculta (economia de bateria)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning && !this.gameOver && !this.isPaused) {
                // Salva que o jogo foi pausado automaticamente
                this._autoPaused = true;
                this.togglePause();
            } else if (!document.hidden && this.isRunning && this.isPaused && this._autoPaused) {
                // Retoma o jogo apenas se foi pausado automaticamente
                this._autoPaused = false;
                this.togglePause();
            }
        });
        
        // Salva o estado do jogo quando o navegador for fechado
        window.addEventListener('beforeunload', () => {
            if (this.isRunning && !this.gameOver) {
                try {
                    // Salva estado atual como progresso
                    const gameState = {
                        board: this.board,
                        score: this.score,
                        level: this.level,
                        lines: this.lines,
                        timestamp: Date.now()
                    };
                    
                    localStorage.setItem('tetrisDosCriaGameProgress', JSON.stringify(gameState));
                } catch (e) {
                    console.error('Erro ao salvar progresso:', e);
                }
            }
        });
        
        // Verifica bateria baixa para reduzir efeitos visuais
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                // Se menos de 15% de bateria, reduz efeitos visuais
                if (battery.level < 0.15) {
                    this._lowBatteryMode = true;
                }
                
                // Monitorar mudanças no nível de bateria
                battery.addEventListener('levelchange', () => {
                    this._lowBatteryMode = battery.level < 0.15;
                });
            });
        }
    }
    
    /**
     * Cria um tabuleiro vazio
     */
    createEmptyBoard() {
        return Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
    }
    
    /**
     * Inicializa manipuladores de eventos
     */
    initEventHandlers() {
        // Botões da UI - com verificação de existência
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.resetGame());
        }
        
        // Controles por teclado
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Variáveis para controle de repetição de toques (como propriedades da classe)
        this.touchStartTime = 0;
        this.lastTouchBtn = null;
        this.touchRepeatDelay = 100; // ms
        
        // Função auxiliar para prevenir repetições rápidas de toque
        const handleTouchControl = (btn, action) => {
            const now = Date.now();
            // Previne repetição muito rápida do mesmo botão
            if (this.lastTouchBtn === btn && now - this.touchStartTime < this.touchRepeatDelay) {
                return;
            }
            
            this.lastTouchBtn = btn;
            this.touchStartTime = now;
            action();
        };
        
        // Verificação de suporte a opção passive
        let passiveSupported = false;
        try {
            // Teste para verificar se o navegador suporta a opção passive
            const options = Object.defineProperty({}, "passive", {
                get: function() {
                    passiveSupported = true;
                    return true;
                }
            });
            window.addEventListener("test", null, options);
            window.removeEventListener("test", null, options);
        } catch(err) {
            passiveSupported = false;
        }
        
        // Cria as opções corretas com base no suporte
        const touchOptions = passiveSupported ? { passive: false } : false;
        
        // Botões de controle mobile - com verificação de existência
        const leftBtn = document.getElementById('left-btn');
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                if (e.cancelable) e.preventDefault();
                handleTouchControl('left', () => this.movePiece(-1, 0));
            }, touchOptions);
            
            leftBtn.addEventListener('click', () => this.movePiece(-1, 0));
        }
        
        const rightBtn = document.getElementById('right-btn');
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                if (e.cancelable) e.preventDefault();
                handleTouchControl('right', () => this.movePiece(1, 0));
            }, touchOptions);
            
            rightBtn.addEventListener('click', () => this.movePiece(1, 0));
        }
        
        const downBtn = document.getElementById('down-btn');
        if (downBtn) {
            downBtn.addEventListener('touchstart', (e) => {
                if (e.cancelable) e.preventDefault();
                handleTouchControl('down', () => this.movePiece(0, 1));
            }, touchOptions);
            
            downBtn.addEventListener('click', () => this.movePiece(0, 1));
        }
        
        const rotateBtn = document.getElementById('rotate-btn');
        if (rotateBtn) {
            rotateBtn.addEventListener('touchstart', (e) => {
                if (e.cancelable) e.preventDefault();
                handleTouchControl('rotate', () => this.rotatePiece());
            }, touchOptions);
            
            rotateBtn.addEventListener('click', () => this.rotatePiece());
        }
        
        // Previne eventos de arrastar nos botões móveis
        const controlBtns = document.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.addEventListener('touchmove', (e) => {
                if (e.cancelable) e.preventDefault();
            }, touchOptions);
            
            btn.addEventListener('touchend', (e) => {
                if (e.cancelable) e.preventDefault();
            }, touchOptions);
        });
        
        // Adiciona manipulador para swipe (alternativa para dispositivos mobile)
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('control-btn')) return; // Ignora botões
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('control-btn')) return; // Ignora botões
            
            if (!this.isRunning || this.gameOver || this.isPaused) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            // Detecta se é um swipe (movimento rápido)
            const swipeDistance = 50; // pixels mínimos para considerar um swipe
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeDistance) {
                // Swipe horizontal
                if (deltaX > 0) {
                    this.movePiece(1, 0); // Direita
                } else {
                    this.movePiece(-1, 0); // Esquerda
                }
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeDistance) {
                // Swipe vertical
                if (deltaY > 0) {
                    this.movePiece(0, 1); // Baixo
                } else {
                    this.rotatePiece(); // Cima (rotação)
                }
            } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                // Detecta tap (toque simples sem movimento)
                this.rotatePiece();
            }
        }, { passive: true });
    }
    
    /**
     * Manipula eventos de teclado
     */
    handleKeyPress(event) {
        // Tecla 'p' ou 'P' para pausar deve funcionar mesmo se o jogo não estiver rodando
        if (event.key === 'p' || event.key === 'P') {
            if (this.isRunning && !this.gameOver) {
                this.togglePause();
            }
            return;
        }
        
        // Para outras teclas, verificamos se o jogo está rodando e não está pausado
        if (!this.isRunning || this.gameOver || this.isPaused) return;
        
        // Usando key ao invés de keyCode (que está obsoleto)
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.rotatePiece();
                break;
            case ' ': // Espaço (queda rápida)
                event.preventDefault();
                this.hardDrop();
                break;
        }
    }
    
    /**
     * Inicia o jogo
     */
    startGame() {
        if (this.isRunning) return;
        
        // Verificações cruciais para ambientes do mundo real
        if (!this.canvas || !this.ctx) {
            console.error('Canvas ou contexto não disponíveis. Não é possível iniciar o jogo.');
            return;
        }
        
        this.isRunning = true;
        this.gameOver = false;
        this.isPaused = false;
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.combo = 0;
        this.dropInterval = 1000;
        this.particles = []; // Limpa partículas existentes
        
        this.updateScoreDisplay();
        
        // Atualiza o texto do botão de iniciar para "PAUSAR"
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.textContent = 'PAUSAR';
        }
        
        // Esconde o game over se estiver visível
        if (this.gameOverElement) {
            this.gameOverElement.classList.add('hidden');
        }
        
        // Gera a primeira peça e a próxima
        this.generateNewPiece();
        
        // Inicia o loop do jogo com proteção contra erros
        try {
            this.lastDropTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        } catch (e) {
            console.error('Erro ao iniciar o loop do jogo:', e);
            this.isRunning = false;
        }
    }
    
    /**
     * Reseta o jogo para iniciar novamente
     */
    resetGame() {
        this.gameOverElement.classList.add('hidden');
        // Garante que o botão mostrará "PAUSAR" quando o jogo for reiniciado
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.textContent = 'PAUSAR';
        }
        this.startGame();
    }
    
    /**
     * Alterna pausa do jogo
     */
    togglePause() {
        // Não faz nada se o jogo estiver em game over
        if (this.gameOver || !this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        // Atualiza o texto do botão baseado no estado do jogo
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.textContent = this.isPaused ? 'CONTINUAR' : 'PAUSAR';
        }
        
        // Mostra ou esconde indicador visual de pausa
        if (this.isPaused) {
            // Desenha overlay de pausa
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Texto de pausa
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = '#00ff88';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = '#00ff88';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;
            
            // Instrução para continuar
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText('Pressione P para continuar', this.canvas.width / 2, this.canvas.height / 2 + 30);
        } else {
            // Continua o jogo
            this.lastDropTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    /**
     * Loop principal do jogo
     */
    gameLoop(timestamp) {
        if (!this.isRunning || this.gameOver || this.isPaused) return;
        
        const deltaTime = timestamp - this.lastDropTime;
        
        // Atualiza as partículas
        this.updateParticles();
        
        // Verifica se é hora de descer a peça
        if (deltaTime > this.dropInterval) {
            this.lastDropTime = timestamp;
            this.movePiece(0, 1);
        }
        
        // Renderiza o estado atual
        this.render();
        
        // Continua o loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Gera uma nova peça
     */
    generateNewPiece() {
        // Se já temos uma próxima peça, ela se torna a atual
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            // Caso contrário, gera uma nova (primeira peça do jogo)
            const randomIndex = Math.floor(Math.random() * this.pieces.length);
            this.currentPiece = {
                shape: JSON.parse(JSON.stringify(this.pieces[randomIndex].shape)),
                color: this.pieces[randomIndex].color,
                x: Math.floor(this.boardWidth / 2) - 1,
                y: 0
            };
        }
        
        // Gera a próxima peça
        const randomIndex = Math.floor(Math.random() * this.pieces.length);
        this.nextPiece = {
            shape: JSON.parse(JSON.stringify(this.pieces[randomIndex].shape)),
            color: this.pieces[randomIndex].color,
            x: Math.floor(this.boardWidth / 2) - 1,
            y: 0
        };
        
        // Desenha a próxima peça
        this.drawNextPiece();
        
        // Verifica game over (se a nova peça não pode ser colocada)
        if (!this.isValidPosition(this.currentPiece)) {
            this.gameOver = true;
            this.isRunning = false;
            this.showGameOver();
        }
    }
    
    /**
     * Desenha a próxima peça no canvas de preview
     */
    drawNextPiece() {
        // Verifica se temos o canvas e o contexto para a próxima peça
        if (!this.nextPieceCtx || !this.nextPieceCanvas) return;
        
        // Limpa o canvas da próxima peça
        this.nextPieceCtx.clearRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);
        
        if (!this.nextPiece) return;
        
        const cellSize = 20;
        
        // Calcula as dimensões da peça
        const pieceWidth = this.nextPiece.shape[0].length * cellSize;
        const pieceHeight = this.nextPiece.shape.length * cellSize;
        
        // Centraliza a peça no canvas
        const offsetX = (this.nextPieceCanvas.width - pieceWidth) / 2;
        const offsetY = (this.nextPieceCanvas.height - pieceHeight) / 2;
        
        // Desenha a peça
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    // Calcula posição precisa
                    const cellX = offsetX + x * cellSize;
                    const cellY = offsetY + y * cellSize;
                    
                    // Fundo da célula
                    this.nextPieceCtx.fillStyle = this.nextPiece.color;
                    this.nextPieceCtx.fillRect(cellX, cellY, cellSize, cellSize);
                    
                    // Adiciona borda
                    this.nextPieceCtx.strokeStyle = '#FFFFFF';
                    this.nextPieceCtx.lineWidth = 1;
                    this.nextPieceCtx.strokeRect(cellX, cellY, cellSize, cellSize);
                    
                    // Efeito de brilho interno
                    this.nextPieceCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.nextPieceCtx.fillRect(
                        cellX + 2, 
                        cellY + 2, 
                        cellSize - 4, 
                        cellSize - 4
                    );
                    
                    // Adiciona efeito de glow neon
                    this.nextPieceCtx.shadowColor = this.nextPiece.color;
                    this.nextPieceCtx.shadowBlur = 5;
                    this.nextPieceCtx.strokeRect(cellX, cellY, cellSize, cellSize);
                    this.nextPieceCtx.shadowBlur = 0;
                }
            });
        });
    }
    
    /**
     * Move a peça atual
     */
    movePiece(dx, dy) {
        if (!this.isRunning || this.gameOver || this.isPaused) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        // Copia a peça atual
        const movedPiece = {
            ...this.currentPiece,
            x: newX,
            y: newY
        };
        
        // Verifica se a nova posição é válida
        if (this.isValidPosition(movedPiece)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        } else if (dy > 0) {
            // Se a peça não pode descer mais, fixa-a no tabuleiro
            this.lockPiece();
            // Verifica linhas completas
            this.checkLines();
            // Gera uma nova peça
            this.generateNewPiece();
            return false;
        }
        
        return false;
    }
    
    /**
     * Rotaciona a peça atual
     */
    rotatePiece() {
        if (!this.isRunning || this.gameOver || this.isPaused) return;
        
        // Tratamento especial para peça O (quadrado) - não rotaciona
        if (this.currentPiece.shape.length === 2 && this.currentPiece.shape[0].length === 2 &&
            this.currentPiece.shape[0][0] === 1 && this.currentPiece.shape[0][1] === 1 &&
            this.currentPiece.shape[1][0] === 1 && this.currentPiece.shape[1][1] === 1) {
            return; // Peça O não precisa rotacionar
        }
        
        // Cria uma cópia profunda da peça atual
        const rotatedPiece = {
            ...this.currentPiece,
            shape: JSON.parse(JSON.stringify(this.currentPiece.shape))
        };
        
        // Tratamento especial para peça I (4 blocos em linha)
        const isIPiece = rotatedPiece.shape.length === 1 && rotatedPiece.shape[0].length === 4 || 
                         rotatedPiece.shape.length === 4 && rotatedPiece.shape[0].length === 1;
        
        if (isIPiece) {
            // Alternativa entre horizontal e vertical
            if (rotatedPiece.shape.length === 1) {
                // Horizontal para vertical
                rotatedPiece.shape = [[1], [1], [1], [1]];
            } else {
                // Vertical para horizontal
                rotatedPiece.shape = [[1, 1, 1, 1]];
            }
        } else {
            // Para outras peças, usar rotação padrão
            // Transpõe a matriz
            const newShape = [];
            for (let x = 0; x < rotatedPiece.shape[0].length; x++) {
                const newRow = [];
                for (let y = rotatedPiece.shape.length - 1; y >= 0; y--) {
                    newRow.push(rotatedPiece.shape[y][x]);
                }
                newShape.push(newRow);
            }
            rotatedPiece.shape = newShape;
        }
        
        // Verifica se a posição rotacionada é válida
        if (this.isValidPosition(rotatedPiece)) {
            this.currentPiece.shape = rotatedPiece.shape;
        } else {
            // Tenta ajustar a peça (wall kick)
            const kicks = [-1, 1, -2, 2]; // Possíveis ajustes horizontais
            
            for (const kick of kicks) {
                rotatedPiece.x = this.currentPiece.x + kick;
                if (this.isValidPosition(rotatedPiece)) {
                    this.currentPiece.shape = rotatedPiece.shape;
                    this.currentPiece.x = rotatedPiece.x;
                    break;
                }
            }
            
            // Se ainda não conseguir rotacionar com wall kicks horizontais, tenta ajustes verticais
            if (this.currentPiece.shape !== rotatedPiece.shape) {
                for (const kick of [1, 2]) {
                    rotatedPiece.x = this.currentPiece.x; // Reseta posição X
                    rotatedPiece.y = this.currentPiece.y - kick; // Tenta mover para cima
                    if (this.isValidPosition(rotatedPiece)) {
                        this.currentPiece.shape = rotatedPiece.shape;
                        this.currentPiece.y = rotatedPiece.y;
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * Executa a queda rápida (hardDrop)
     */
    hardDrop() {
        if (!this.isRunning || this.gameOver || this.isPaused) return;
        
        // Evita loop infinito limitando o número máximo de iterações
        const maxIterations = this.boardHeight;
        let iterations = 0;
        let dropped = false;
        
        // Versão mais segura e eficiente do loop
        while (iterations < maxIterations) {
            iterations++;
            
            // Tenta mover para baixo
            const moved = this.movePiece(0, 1);
            
            if (moved) {
                dropped = true;
            } else {
                // Se não puder se mover mais, termina o loop
                break;
            }
        }
        
        return dropped;
    }
    
    /**
     * Verifica se a posição é válida para uma peça
     */
    isValidPosition(piece) {
        return piece.shape.every((row, dy) => {
            return row.every((value, dx) => {
                if (!value) return true; // Célula vazia, sempre válida
                
                const x = piece.x + dx;
                const y = piece.y + dy;
                
                // Verifica limites do tabuleiro
                const isWithinBounds = x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight;
                // Verifica colisão com outras peças
                const isEmpty = isWithinBounds && this.board[y][x] === 0;
                
                return isWithinBounds && isEmpty;
            });
        });
    }
    
    /**
     * Fixa a peça atual no tabuleiro
     */
    lockPiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const x = this.currentPiece.x + dx;
                    const y = this.currentPiece.y + dy;
                    
                    if (y >= 0 && y < this.boardHeight && x >= 0 && x < this.boardWidth) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            });
        });
    }
    
    /**
     * Verifica e remove linhas completas
     */
    checkLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            const isLineComplete = this.board[y].every(cell => cell !== 0);
            
            if (isLineComplete) {
                // Cria efeito de partículas para a linha ANTES de removê-la
                this.createLineParticles(y);
                
                // Remove a linha completa e adiciona uma nova no topo
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                
                linesCleared++;
                y++; // Processa a mesma posição novamente depois de remover a linha
            }
        }
        
        // Atualiza pontuação e nível
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        } else {
            // Reseta o combo se nenhuma linha foi removida
            this.combo = 0;
        }
    }
    
    /**
     * Atualiza a pontuação com base nas linhas removidas
     */
    updateScore(linesCleared) {
        // Pontuação base por linha
        const basePoints = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 linhas
        
        // Atualiza o número total de linhas
        this.lines += linesCleared;
        
        // Incrementa combo
        this.combo++;
        
        // Calcula multiplicador de combo (máximo 4x)
        const comboMultiplier = Math.min(this.combo, 4);
        
        // Calcula pontuação para este movimento
        let pointsEarned = basePoints[linesCleared] * this.level;
        
        // Aplica multiplicador de combo (a partir do segundo combo)
        if (this.combo > 1) {
            pointsEarned *= comboMultiplier;
        }
        
        // Adiciona à pontuação total
        this.score += pointsEarned;
        
        // Atualiza o nível (a cada 10 linhas)
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // Aumenta a velocidade (20% mais rápido por nível)
            this.dropInterval = 1000 * Math.pow(0.8, this.level - 1);
        }
        
        // Atualiza highscore se necessário
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('tetrisDosCriaHighscore', this.highscore);
        }
        
        // Atualiza o display
        this.updateScoreDisplay();
    }
    
    /**
     * Atualiza os elementos de display da pontuação
     */
    updateScoreDisplay() {
        // Atualiza os elementos do DOM se eles existirem
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.highscoreElement) this.highscoreElement.textContent = this.highscore;
        if (this.levelElement) this.levelElement.textContent = this.level;
        if (this.linesElement) this.linesElement.textContent = this.lines;
    }
    
    /**
     * Cria partículas para o efeito de linha completa
     */
    createLineParticles(lineY) {
        // Se não existir um contexto de partículas, não criamos partículas
        if (!this.particlesCtx) return;
        
        const particlesPerCell = 5;
        const particleLifespan = 30; // frames
        
        for (let x = 0; x < this.boardWidth; x++) {
            const color = this.board[lineY][x];
            if (color) {
                // Cria várias partículas por célula
                for (let i = 0; i < particlesPerCell; i++) {
                    this.particles.push({
                        x: (x + 0.5) * this.cellSize,
                        y: (lineY + 0.5) * this.cellSize,
                        speedX: (Math.random() - 0.5) * 10,
                        speedY: (Math.random() - 0.5) * 10,
                        radius: Math.random() * 3 + 1,
                        color: color,
                        alpha: 1,
                        life: particleLifespan
                    });
                }
            }
        }
    }
    
    /**
     * Atualiza o estado das partículas
     */
    updateParticles() {
        // Se não existir um contexto de partículas ou não houver partículas, retornamos
        if (!this.particlesCtx || this.particles.length === 0) return;
        
        // Limpa o canvas de partículas
        this.particlesCtx.clearRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Atualiza posição
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Diminui a vida da partícula
            p.life--;
            p.alpha = p.life / 30; // Fade out gradual
            
            // Desenha a partícula
            this.particlesCtx.beginPath();
            this.particlesCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            
            // Forma segura de criar uma cor com alfa
            const colorWithAlpha = this.hexToRgba(p.color, p.alpha);
            this.particlesCtx.fillStyle = colorWithAlpha;
            this.particlesCtx.fill();
            
            // Remove partículas mortas
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }
    
    /**
     * Converte cor hex para rgba
     */
    hexToRgba(hex, alpha) {
        try {
            // Se não for uma string, retorna cor padrão
            if (typeof hex !== 'string') {
                return `rgba(255, 255, 255, ${alpha})`;
            }
            
            // Remove o # se estiver presente
            hex = hex.replace('#', '');
            
            // Se for um formato curto (por exemplo #ABC), converte para formato longo
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            
            // Verifica se é um formato hex válido
            if (!/^[0-9A-F]{6}$/i.test(hex)) {
                // Se não for um formato válido, retorna uma cor padrão
                return `rgba(255, 255, 255, ${alpha})`;
            }
            
            // Converte para RGB
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            
            // Garante que alpha seja um número válido entre 0 e 1
            const validAlpha = Math.max(0, Math.min(1, parseFloat(alpha) || 1));
            
            // Retorna formato rgba
            return `rgba(${r}, ${g}, ${b}, ${validAlpha})`;
        } catch (e) {
            // Em caso de erro, retorna uma cor padrão
            return `rgba(255, 255, 255, ${alpha})`;
        }
    }
    
    /**
     * Renderiza o estado atual do jogo
     */
    render() {
        // Limpa o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reseta configurações do contexto para evitar problemas
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
        
        // Desenha o grid de fundo
        this.drawGrid();
        
        // Desenha o tabuleiro
        this.drawBoard();
        
        // Desenha a peça atual
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
            
            // Desenha a posição fantasma (onde a peça vai cair)
            this.drawGhostPiece();
        }
        
        // Se o jogo estiver pausado, redesenha a tela de pausa
        if (this.isPaused) {
            // Desenha overlay de pausa
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Texto de pausa
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = '#00ff88';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = '#00ff88';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2);
            
            // Instrução para continuar
            this.ctx.shadowBlur = 0;
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText('Pressione P para continuar', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
    
    /**
     * Desenha o grid de fundo do tabuleiro
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // Linhas horizontais
        for (let y = 0; y <= this.boardHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
        
        // Linhas verticais
        for (let x = 0; x <= this.boardWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    /**
     * Desenha o tabuleiro com as peças fixas
     */
    drawBoard() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    this.drawCell(x, y, this.board[y][x]);
                }
            }
        }
    }
    
    /**
     * Desenha uma peça no tabuleiro
     */
    drawPiece(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawCell(piece.x + x, piece.y + y, piece.color);
                }
            });
        });
    }
    
    /**
     * Desenha uma peça fantasma (indicador de onde a peça cairá)
     */
    drawGhostPiece() {
        // Cria uma cópia da peça atual
        const ghost = {
            ...this.currentPiece,
            shape: JSON.parse(JSON.stringify(this.currentPiece.shape))
        };
        
        // Move a peça para baixo até não poder mais (com limite de segurança)
        let ghostY = ghost.y;
        let maxIterations = this.boardHeight; // Limite de segurança
        let iterations = 0;
        
        while (iterations < maxIterations) {
            iterations++;
            
            // Testamos a próxima posição para baixo
            ghost.y = ghostY + 1;
            
            // Se a posição não for válida, voltamos para a anterior e paramos
            if (!this.isValidPosition(ghost)) {
                ghost.y = ghostY;
                break;
            }
            
            // Se for válida, atualizamos ghostY e continuamos
            ghostY++;
        }
        
        // Desenha a peça fantasma apenas se estiver em uma posição diferente da atual
        if (ghost.y > this.currentPiece.y) {
            ghost.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const ghostX = ghost.x + x;
                        const ghostY = ghost.y + y;
                        
                        // Verificação de segurança adicional
                        if (ghostY >= this.boardHeight) return;
                        
                        // Desenha a célula fantasma
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        this.ctx.fillRect(
                            ghostX * this.cellSize, 
                            ghostY * this.cellSize, 
                            this.cellSize, 
                            this.cellSize
                        );
                        
                        // Desenha a borda da célula fantasma
                        this.ctx.strokeStyle = this.currentPiece.color;
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(
                            ghostX * this.cellSize, 
                            ghostY * this.cellSize, 
                            this.cellSize, 
                            this.cellSize
                        );
                    }
                });
            });
        }
    }
    
    /**
     * Desenha uma célula individual
     */
    drawCell(x, y, color) {
        if (x < 0 || y < 0 || x >= this.boardWidth || y >= this.boardHeight) return;
        
        const xPos = x * this.cellSize;
        const yPos = y * this.cellSize;
        
        // Adiciona efeito de sombra neon
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 5;
        
        // Fundo da célula
        this.ctx.fillStyle = color;
        this.ctx.fillRect(xPos, yPos, this.cellSize, this.cellSize);
        
        // Borda da célula
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(xPos, yPos, this.cellSize, this.cellSize);
        
        // Desativa sombra para o brilho interno
        this.ctx.shadowBlur = 0;
        
        // Efeito de brilho interno
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            xPos + 2, 
            yPos + 2, 
            this.cellSize - 4, 
            this.cellSize - 4
        );
    }
    
    /**
     * Mostra tela de game over
     */
    showGameOver() {
        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = this.score;
        }
        
        // Redefine o botão para "INICIAR"
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.textContent = 'INICIAR';
        }
        
        if (this.gameOverElement) {
            this.gameOverElement.classList.remove('hidden');
        } else {
            // Fallback se o elemento game-over não existir
            console.log("Game Over! Pontuação final:", this.score);
        }
    }
    
    /**
     * Mostra instruções do jogo em um popup
     */
    showInstructions() {
        // Criação do overlay compatível com todos os navegadores
        const instructionsOverlay = document.createElement('div');
        instructionsOverlay.id = 'tetris-instructions-overlay';
        
        // Estilo para o overlay principal
        Object.assign(instructionsOverlay.style, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
            fontFamily: 'Arial, sans-serif'
        });
        
        // Conteúdo do popup com instruções
        const content = document.createElement('div');
        
        // Estilo compatível com todos os navegadores
        Object.assign(content.style, {
            backgroundColor: '#121212',
            color: '#ffffff',
            width: '90%',
            maxWidth: '500px',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
            border: '1px solid #00ff88',
            maxHeight: '90vh',
            overflowY: 'auto'
        });
        
        // Título com efeito neon
        const title = document.createElement('h2');
        title.textContent = 'COMO JOGAR TETRIS';
        Object.assign(title.style, {
            color: '#00ff88',
            marginBottom: '20px',
            textShadow: '0 0 10px rgba(0, 255, 136, 0.7)',
            fontSize: '24px'
        });
        
        // Instruções
        const instructions = document.createElement('div');
        Object.assign(instructions.style, {
            marginBottom: '25px',
            textAlign: 'left',
            lineHeight: '1.5',
            fontSize: '16px'
        });
        
        // HTML das instruções
        instructions.innerHTML = `
            <p style="margin-bottom: 10px; text-align: center; font-weight: bold;">OBJETIVO</p>
            <p style="margin-bottom: 15px;">Encaixe os blocos para formar linhas horizontais completas que serão eliminadas, marcando pontos.</p>
            
            <p style="margin-bottom: 10px; text-align: center; font-weight: bold;">CONTROLES</p>
            <div style="display: flex; margin-bottom: 5px;">
                <div style="width: 50%; text-align: right; padding-right: 15px;">← →</div>
                <div style="width: 50%; text-align: left;">Mover peça</div>
            </div>
            <div style="display: flex; margin-bottom: 5px;">
                <div style="width: 50%; text-align: right; padding-right: 15px;">↓</div>
                <div style="width: 50%; text-align: left;">Descer mais rápido</div>
            </div>
            <div style="display: flex; margin-bottom: 5px;">
                <div style="width: 50%; text-align: right; padding-right: 15px;">↑</div>
                <div style="width: 50%; text-align: left;">Rotacionar peça</div>
            </div>
            <div style="display: flex; margin-bottom: 15px;">
                <div style="width: 50%; text-align: right; padding-right: 15px;">Espaço</div>
                <div style="width: 50%; text-align: left;">Queda instantânea</div>
            </div>
            <div style="display: flex; margin-bottom: 15px;">
                <div style="width: 50%; text-align: right; padding-right: 15px;">P</div>
                <div style="width: 50%; text-align: left;">Pausar jogo</div>
            </div>
            
            <p style="margin-bottom: 10px; text-align: center; font-weight: bold;">PONTUAÇÃO</p>
            <p style="margin-bottom: 5px;">• 1 linha: 100 pontos × nível</p>
            <p style="margin-bottom: 5px;">• 2 linhas: 300 pontos × nível</p>
            <p style="margin-bottom: 5px;">• 3 linhas: 500 pontos × nível</p>
            <p style="margin-bottom: 5px;">• 4 linhas: 800 pontos × nível</p>
            <p style="margin-bottom: 15px;">• Bônus por combos consecutivos!</p>
        `;
        
        // Contador regressivo
        const counterContainer = document.createElement('div');
        const counterText = document.createElement('span');
        counterText.id = 'tetris-instructions-counter';
        counterText.textContent = '30';
        
        Object.assign(counterContainer.style, {
            margin: '15px 0',
            fontSize: '14px',
            color: '#aaaaaa',
            textAlign: 'center'
        });
        
        counterContainer.textContent = 'O jogo iniciará automaticamente em ';
        counterContainer.appendChild(counterText);
        counterContainer.appendChild(document.createTextNode(' segundos'));
        
        // Botão de iniciar jogo
        const startButton = document.createElement('button');
        startButton.textContent = 'INICIAR JOGO AGORA';
        Object.assign(startButton.style, {
            backgroundColor: 'transparent',
            color: '#00ff88',
            border: '1px solid #00ff88',
            padding: '10px 25px',
            fontSize: '18px',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
            marginTop: '10px',
            fontWeight: 'bold'
        });
        
        // Efeitos hover via JavaScript para compatibilidade
        startButton.addEventListener('mouseover', () => {
            Object.assign(startButton.style, {
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)'
            });
        });
        
        startButton.addEventListener('mouseout', () => {
            Object.assign(startButton.style, {
                backgroundColor: 'transparent',
                boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)'
            });
        });
        
        // Referência para o temporizador e para o this do TetrisGame
        let instructionsTimer = null;
        const self = this;
        
        // Função para limpar temporizador e remover overlay
        const cleanupAndStart = () => {
            // Limpa o temporizador
            if (instructionsTimer) {
                clearInterval(instructionsTimer);
                instructionsTimer = null;
            }
            
            // Remove o evento de tecla
            document.removeEventListener('keydown', handleKeyDown);
            
            // Remove o popup com segurança
            const overlay = document.getElementById('tetris-instructions-overlay');
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            // Inicia o jogo
            self.startGame();
        };
        
        // Evento de clique para iniciar o jogo
        startButton.addEventListener('click', cleanupAndStart);
        
        // Montagem do popup
        content.appendChild(title);
        content.appendChild(instructions);
        
        // Texto para suporte a dispositivos móveis
        if ('ontouchstart' in window) {
            const mobileText = document.createElement('p');
            mobileText.textContent = 'Use os botões na tela para controlar o jogo em dispositivos móveis';
            Object.assign(mobileText.style, {
                margin: '15px 0',
                fontSize: '14px',
                color: '#cccccc',
                textAlign: 'center'
            });
            content.appendChild(mobileText);
        }
        
        content.appendChild(counterContainer);
        content.appendChild(startButton);
        instructionsOverlay.appendChild(content);
        
        // Evento para impedir propagação de cliques para o canvas do jogo
        instructionsOverlay.addEventListener('click', (e) => {
            if (e.target === instructionsOverlay) {
                e.stopPropagation();
            }
        });
        
        // Evento para tecla Enter iniciar o jogo
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.removeEventListener('keydown', handleKeyDown);
                cleanupAndStart();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // Adiciona ao corpo do documento
        document.body.appendChild(instructionsOverlay);
        
        // Inicia o temporizador para começar automaticamente após 30 segundos
        let counter = 30;
        instructionsTimer = setInterval(() => {
            counter--;
            
            // Verifica se o overlay ainda existe
            const overlay = document.getElementById('tetris-instructions-overlay');
            if (!overlay) {
                clearInterval(instructionsTimer);
                return;
            }
            
            // Atualiza o contador
            const counterElement = document.getElementById('tetris-instructions-counter');
            if (counterElement) {
                counterElement.textContent = counter.toString();
            }
            
            // Quando chegar a zero, inicia o jogo
            if (counter <= 0) {
                document.removeEventListener('keydown', handleKeyDown);
                cleanupAndStart();
            }
        }, 1000);
        
        // Garante limpeza em caso de navegação ou recarga da página
        window.addEventListener('beforeunload', function cleanupBeforeUnload() {
            if (instructionsTimer) {
                clearInterval(instructionsTimer);
            }
            window.removeEventListener('beforeunload', cleanupBeforeUnload);
        });
    }
}

// Inicializa o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new TetrisGame();
        
        // Inicia o jogo diretamente - sem mostrar popup de instruções
        // O painel lateral já mostra as instruções
        
        // Adiciona comunicação com o mundo real através de mensagens
        window.addEventListener('message', (event) => {
            // Verifica a origem da mensagem por segurança
            if (event.origin !== window.location.origin) return;
            
            // Processa comandos
            if (event.data && event.data.action && game) {
                switch(event.data.action) {
                    case 'start':
                        game.startGame();
                        break;
                    case 'pause':
                        if (game.isRunning && !game.isPaused) game.togglePause();
                        break;
                    case 'resume':
                        if (game.isRunning && game.isPaused) game.togglePause();
                        break;
                    case 'reset':
                        game.resetGame();
                        break;
                    case 'canvasResized':
                        // Recalcula o tamanho da célula baseado no novo tamanho do canvas
                        if (game.canvas) {
                            game.cellSize = game.canvas.width / game.boardWidth;
                            // Re-renderiza o jogo com o novo tamanho
                            if (game.isRunning && !game.isPaused) {
                                game.render();
                            }
                        }
                        break;
                }
            }
        });
        
    } catch (error) {
        console.error('Erro ao inicializar o jogo:', error);
        // Tenta mostrar mensagem de erro para o usuário
        const errorMessage = document.createElement('div');
        errorMessage.style.color = '#FF0000';
        errorMessage.style.background = 'rgba(0,0,0,0.8)';
        errorMessage.style.padding = '20px';
        errorMessage.style.margin = '20px auto';
        errorMessage.style.maxWidth = '80%';
        errorMessage.style.textAlign = 'center';
        errorMessage.style.borderRadius = '8px';
        errorMessage.style.boxShadow = '0 0 10px rgba(255,0,0,0.5)';
        errorMessage.innerHTML = `<h2>Erro ao carregar o jogo</h2><p>${error.message || 'Erro desconhecido'}</p>`;
        document.body.appendChild(errorMessage);
    }
});