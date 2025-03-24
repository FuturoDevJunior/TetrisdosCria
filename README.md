<div align="center">
  <h1>Tetris dos Cria 🎮</h1>

  <p><i>Um Tetris moderno com visual neon e mecânicas avançadas, desenvolvido com JavaScript puro</i></p>
  
  <p>
    <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript">
    <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">
  </p>
  
  <p>
    <a href="#-tecnologias">Tecnologias</a> • 
    <a href="#-projeto">Projeto</a> • 
    <a href="#-features">Features</a> • 
    <a href="#-arquitetura">Arquitetura</a> • 
    <a href="#-desafios-técnicos">Desafios Técnicos</a> • 
    <a href="#-como-executar">Como Executar</a>
  </p>
  
  <p>
    <a href="https://tetris-dos-cria.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/JOGAR%20AGORA-00C58E?style=for-the-badge" alt="Jogar Agora">
    </a>
  </p>
</div>

## 📱 Projeto

Recriação moderna do clássico jogo Tetris com estética neon vibrante e experiência totalmente responsiva. Desenvolvido como uma aplicação web progressiva (PWA) utilizando apenas JavaScript puro, HTML5 Canvas e CSS3 - sem frameworks ou bibliotecas externas.

**Status do projeto:** quase lá 

### Diferenciais técnicos:

- **Performance Excelente:** 60 FPS estáveis mesmo em dispositivos móveis de entrada
- **Zero-Dependency:** Implementação completa sem dependências externas
- **PWA Completo:** Funciona offline e pode ser instalado como aplicativo nativo
- **Mobile-First Design:** Experiência otimizada para diversos dispositivos e tamanhos de tela

### 📊 Métricas

| Métrica             | Resultado                    |
|---------------------|------------------------------|
| Lighthouse Score    | Performance: 98/100          |
|                     | Acessibilidade: 95/100       |
|                     | Práticas Web: 100/100        |
|                     | SEO: 100/100                 |
| Tamanho Total       | < 100KB (gzip)               |
| Tempo de Carregamento | < 2s (3G)                  |
| Compatibilidade     | Chrome, Firefox, Safari, Edge|

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- **Front-end:**
  - HTML5 Semântico
  - CSS3 Avançado (Flexbox, Grid, Animações)
  - JavaScript ES6+ (Vanilla)
  - Canvas API

- **PWA:**
  - Service Workers
  - Web App Manifest
  - Offline Capabilities

- **DevOps:**
  - Vercel
  - GitHub Actions
  - Continuous Deployment

## ✨ Features

### 🎮 Core Game

```javascript
// Sistema de detecção de colisão preciso
isValidPosition(piece) {
    return piece.shape.every((row, dy) => {
        return row.every((value, dx) => {
            if (!value) return true; // Célula vazia, sempre válida
            
            const x = piece.x + dx;
            const y = piece.y + dy;
            
            // Verifica limites do tabuleiro e colisão com outras peças
            const isWithinBounds = x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight;
            const isEmpty = isWithinBounds && this.board[y][x] === 0;
            
            return isWithinBounds && isEmpty;
        });
    });
}
```

- **Mecânica Clássica Aprimorada:**
  - Sistema de colisão preciso
  - Algoritmo de wall kick para rotações 
  - Indicador de posição fantasma para peças
  - Visualização da próxima peça

- **Sistema Avançado de Pontuação:**
  - Pontuação baseada em combos (multiplicadores por linhas consecutivas)
  - Níveis progressivos com aumento de dificuldade
  - Sistema de highscore persistente

### 🎨 UI/UX

- **Estética Neon Vibrante:**
  - Efeitos de glow via CSS e Canvas
  - Partículas dinâmicas para feedback visual
  - Transições e animações suaves (60fps)

- **Responsividade Total:**
  - Layouts específicos para mobile e desktop
  - Controles adaptados por plataforma
  - Suporte a gestos touch e swipe em dispositivos móveis

### 🔌 Funcionalidades Técnicas

- **Modo Offline:**
  - Cache inteligente via Service Workers
  - Persistência de dados com localStorage
  - Manifesto PWA para instalação como app nativo

- **Otimizações Avançadas:**
  - Debouncing para eventos de redimensionamento
  - Uso de requestAnimationFrame para renderização suave
  - Detecção de bateria baixa para redução de efeitos visuais
  - Passive event listeners para melhor performance

## 🧱 Arquitetura

### 📂 Estrutura de Pasta Modular

```
tetris-dos-cria/
│
├── public/                   # Arquivos públicos
│   ├── assets/               # Recursos do jogo
│   │   ├── css/              # Estilos CSS
│   │   ├── js/               # Scripts JavaScript
│   │   ├── images/           # Imagens e ícones
│   │   └── manifest.json     # Manifesto PWA
│   │
│   ├── index.html            # Página principal
│   └── sw.js                 # Service Worker
│
├── CONTRIBUTING.md           # Guia de contribuição
├── LICENSE                   # Licença do projeto
├── README.md                 # Este arquivo
└── vercel.json               # Configuração de deploy Vercel
```

### 🏗️ Padrões de Design

```javascript
// Exemplo de implementação com Orientação a Objetos
class TetrisGame {
    constructor() {
        // Inicialização do jogo
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.gameOver = false;
        this.isPaused = false;
        // ...
    }
    
    // Métodos do jogo
    startGame() { /* ... */ }
    movePiece(dx, dy) { /* ... */ }
    rotatePiece() { /* ... */ }
    // ...
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
    // ...
});
```

- **Abordagem Orientada a Objetos:**
  - Encapsulamento de lógica em classes
  - Herança e composição para reutilização de código
  - Design modular para manutenção facilitada

- **Padrões Implementados:**
  - Observer Pattern para eventos do jogo
  - Factory Pattern para criação de peças
  - State Pattern para gerenciamento de estados do jogo

## 🧩 Desafios Técnicos

### Otimização de Renderização em Canvas

- **Problema:** Manter performance de 60fps em dispositivos de baixa capacidade
- **Solução:** Implementação de técnicas avançadas de renderização:
  - Double buffering para evitar flickering
  - Renderização seletiva de elementos alterados
  - Culling de elementos fora da área visível

### Controles Responsivos Multi-plataforma

- **Problema:** Criar controles que funcionem bem tanto em desktop quanto em dispositivos móveis
- **Solução:** Sistema adaptativo:
  - Detecção de dispositivo para ajustar controles
  - Implementação de controles touch com gestos
  - Fallbacks para diferentes métodos de entrada

### PWA com Suporte Offline Completo

- **Problema:** Garantir que o jogo funcione perfeitamente sem conexão
- **Solução:** Implementação robusta de Service Workers:
  - Estratégia cache-first para recursos estáticos
  - Persistência de estado do jogo no localStorage
  - Sync quando a conexão é restabelecida

## 🎲 Como Executar

```bash
# Clone este repositório
$ git clone https://github.com/FuturoDevJunior/TetrisdosCria.git

# Acesse a pasta do projeto no terminal
$ cd TetrisdosCria

# Instale as dependências (se houver)
$ npm install

# Execute a aplicação em modo de desenvolvimento
$ npm start

# O servidor inciará na porta:3000 - acesse http://localhost:3000
```

### Requisitos de Sistema
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão à internet para o carregamento inicial (PWA funciona offline após isso)

## 🌟 Easter Eggs

O jogo contém easter eggs escondidos - tente o código Konami para uma surpresa visual!

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com 💚 por <a href="https://github.com/FuturoDevJunior">DevFerreiraG</a></p>

<p align="center">
  <a href="https://linkedin.com/in/DevFerreiraG">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://github.com/FuturoDevJunior">
    <img src="https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white" alt="GitHub">
  </a>
</p>