# Forca Local

## Recursos

- Dois jogadores no mesmo dispositivo, alternando os palpites.
- Pontuação individual por rodada vencida.
- Quem começa alterna a cada nova rodada.
- Dicionário local com 1000 palavras únicas em português.
- Letras acentuadas são reveladas ao acertar sua letra equivalente (por exemplo, `a` revela `á`).
- Funciona offline, sem salas, servidor, conta ou Node.js.

## Estrutura

- `public/index.html`: interface do jogo.
- `public/local-game.js`: regras, turnos e pontuação.
- `public/words.js`: dicionário do jogo.
- `public/styles.css`: estilos da interface.

## Como jogar

1. Abra `public/index.html` no navegador (ou use **Open with Live Server** no VS Code).
2. Digite o nome dos dois jogadores e clique em **Começar partida**.
3. Revezem os palpites no teclado ou nos botões na tela. A cada rodada, o jogador que começa muda.

O jogo roda localmente no navegador e não envia dados para a internet. Se quiser hospedá-lo no futuro, os arquivos da pasta `public/` também podem ser publicados como um site estático.
