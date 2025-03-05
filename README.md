# Tetris dos Cria

Um jogo de Tetris moderno desenvolvido em JavaScript puro com visual neon e jogabilidade suave. Esta versão do clássico jogo de quebra-cabeça apresenta efeitos visuais modernos, sistema de pontuação com combos, e é completamente responsivo para jogar em qualquer dispositivo.

![Tetris dos Cria](https://github.com/FuturoDevJunior/TetrisdosCria/raw/main/public/assets/images/screenshots/screenshot.png)

## 🎮 Jogue Agora

Você pode jogar online aqui: [Tetris dos Cria](https://tetris-dos-cria.vercel.app)

## 📋 Conteúdo

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Como Jogar](#-como-jogar)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [Recursos Técnicos](#-recursos-técnicos)
- [Otimização Mobile](#-otimização-para-dispositivos-móveis)
- [Licença](#-licença)

## 📝 Visão Geral

Tetris dos Cria é uma implementação moderna do clássico jogo Tetris, com foco em uma estética neon vibrante e experiência de jogo fluida tanto em desktops quanto em dispositivos móveis. O jogo foi desenvolvido utilizando apenas HTML5, CSS3 e JavaScript puro, sem dependência de frameworks ou bibliotecas externas.

## ✨ Funcionalidades

- Visual neon moderno com efeitos de brilho
- Sistema de pontuação com combos
- Suporte a dispositivos móveis e desktop
- Highscore salvo localmente
- Indicador de "peça fantasma" mostrando onde a peça vai cair
- Efeitos de partículas para linhas completadas
- Suporte a toque/swipe para controles em dispositivos móveis
- Responsivo para todas as telas
- Funciona offline como Progressive Web App (PWA)

## 🎯 Como Jogar

### Objetivo
Encaixe os blocos para formar linhas horizontais completas que serão eliminadas, marcando pontos.

### Controles

**Desktop:**
- ← → : Mover peça
- ↓ : Descer mais rápido
- ↑ : Rotacionar peça
- Espaço : Queda instantânea
- P : Pausar jogo

**Mobile:**
- Botões na tela
- Swipe para movimento
- Tap para rotacionar

### Pontuação
- 1 linha: 100 pontos × nível
- 2 linhas: 300 pontos × nível
- 3 linhas: 500 pontos × nível
- 4 linhas: 800 pontos × nível
- Bônus por combos consecutivos!

## 🚀 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas API
- Service Workers (para PWA)
- Local Storage API

## 📁 Estrutura do Projeto

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

## 🔧 Instalação e Execução

1. Clone o repositório:
   ```bash
   git clone https://github.com/FuturoDevJunior/TetrisdosCria.git
   cd TetrisdosCria
   ```

2. Abra o arquivo `public/index.html` em seu navegador ou use um servidor local:
   ```bash
   # Usando Python (exemplo)
   cd public
   python -m http.server 8000
   ```

3. Para deploy, você pode usar qualquer servidor web estático, como GitHub Pages, Vercel, Netlify, etc.

## 🧠 Recursos Técnicos Implementados

- Uso eficiente da API Canvas para renderização
- Sistema de detecção de colisão preciso
- Algoritmo de "wall kick" para rotação de peças
- Detecção de bateria baixa para reduzir efeitos visuais
- Sistema de partículas para feedback visual
- Salvamento automático de progresso
- Função de pausa automática quando a aba do navegador perde o foco

## 📱 Otimização para Dispositivos Móveis

- Interface adaptativa
- Controles otimizados para toque
- Economia de bateria
- Detecção de swipe com aceleração
- Botões grandes e responsivos para facilitar o controle em telas pequenas

## 📄 Licença

MIT © [DevFerreiraG](https://linkedin.com/in/DevFerreiraG)

---

<p align="center">
  Desenvolvido com 💚 por <a href="https://linkedin.com/in/DevFerreiraG">DevFerreiraG</a>
</p>
# TetrisdosCria
