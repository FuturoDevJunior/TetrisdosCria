# Guia de Desenvolvimento do Tetris dos Cria

Este documento fornece informações técnicas e diretrizes para desenvolvedores que desejam entender ou contribuir com o código do jogo Tetris dos Cria.

## Estrutura do Projeto

```
tetris-dos-cria/
├── public/
│   ├── assets/
│   │   ├── css/          # Estilos CSS
│   │   ├── js/           # Scripts JavaScript
│   │   ├── images/       # Imagens e ícones
│   │   └── docs/         # Documentação técnica
│   │
│   ├── index.html        # Página principal do jogo
│   └── sw.js             # Service Worker para funcionalidade offline
│
└── outros arquivos de configuração...
```

## Arquitetura do Código

O jogo foi construído usando uma abordagem orientada a objetos em JavaScript puro, sem dependências externas. A classe principal `TetrisGame` gerencia toda a lógica do jogo.

### Principais Componentes

1. **Canvas e Renderização**
   - Três canvas são utilizados:
     - `game-board`: Renderiza o tabuleiro e peças
     - `next-piece`: Mostra a próxima peça
     - `particles-canvas`: Gerencia efeitos visuais de partículas

2. **Manipulação de Peças**
   - As peças são definidas como matrizes bidimensionais
   - A rotação é implementada através de transformação de matrizes
   - O sistema de "wall kick" permite rotação próxima às bordas

3. **Sistema de Pontuação**
   - Pontuação baseada no número de linhas eliminadas
   - Multiplicador crescente baseado em combos consecutivos
   - Aumento de nível a cada 10 linhas eliminadas

4. **Detecção de Colisão**
   - O método `isValidPosition()` verifica colisões com outras peças e bordas
   - Sistema de previsão de queda (peça fantasma) usa o mesmo algoritmo

5. **Otimizações para Mobile**
   - Detecção de swipe com parâmetros de sensibilidade ajustados
   - Controles na tela dimensionados para facilitar o toque
   - Detecção de nível de bateria para reduzir efeitos visuais

## Fluxo do Jogo

1. **Inicialização**
   - Carregamento de recursos e configuração do ambiente
   - Exibição de instruções
   - Configuração dos manipuladores de eventos

2. **Loop Principal**
   - Implementado com `requestAnimationFrame`
   - Gerencia timing para queda das peças
   - Atualiza estado do jogo e renderiza frames

3. **Game Over**
   - Detectado quando uma nova peça não pode ser posicionada
   - Exibe overlay com pontuação final e opção de reinício

## Armazenamento de Dados

- **localStorage** é usado para:
  - Salvar a pontuação mais alta (highscore)
  - Armazenar progresso temporário entre sessões
  - Preferências do usuário

## APIs Web Utilizadas

- **Canvas API**: Para renderização de elementos gráficos
- **requestAnimationFrame**: Para loop do jogo suave
- **localStorage API**: Para armazenamento de dados
- **Battery API**: Para detecção de nível de bateria
- **Service Worker API**: Para funcionalidade offline

## Convenções de Código

- Nomes de funções em camelCase
- Comentários em português
- Indentação com 4 espaços
- Classes com primeira letra maiúscula
- Constantes em UPPER_SNAKE_CASE

## Considerações para Contribuições

1. **Performance**
   - Minimizar operações de renderização
   - Otimizar algoritmos de colisão
   - Usar estruturas de dados eficientes

2. **Compatibilidade**
   - Testar em vários navegadores (Chrome, Firefox, Safari)
   - Verificar em diferentes dispositivos móveis
   - Adaptar para diferentes tamanhos de tela

3. **Acessibilidade**
   - Considerar modos de alto contraste
   - Implementar controles alternativos
   - Adicionar feedback sonoro opcional

4. **Recursos Futuros Planejados**
   - Modo multijogador
   - Leaderboard online
   - Temas visuais alternativos
   - Modo de treino para iniciantes

---

## Depuração

Para facilitar a depuração, você pode ativar o modo de depuração definindo:

```javascript
localStorage.setItem('tetrisDebugMode', 'true');
```

Isso irá expor o objeto do jogo no console como `window.tetrisGame` e exibir informações adicionais durante a jogabilidade.

## Contato

Para questões técnicas ou discussões sobre o código, entre em contato com o desenvolvedor principal:
- Email: guilherme.ferreira@devgamer.com.br
- GitHub: @FuturoDevJunior