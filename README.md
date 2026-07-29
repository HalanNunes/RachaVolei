# Racha Vôlei

Aplicativo Expo para iPhone, Android e web que organiza os participantes do racha, sorteia equipes equilibradas e controla o placar pelas regras do vôlei.

## Executar

```bash
npm install
npm start
```

Use `npm run ios`, `npm run android` ou `npm run web` para abrir uma plataforma diretamente.

## Ver sem instalar dependências

Uma demonstração web interativa e sem dependências está disponível em `preview/index.html`.
Na raiz deste repositório, execute:

```bash
python3 serve_preview.py
```

Depois acesse [http://localhost:8080/preview/](http://localhost:8080/preview/). O cadastro,
o sorteio, o placar e o novo sorteio ao encerrar a partida funcionam nessa demonstração.

> Se aparecer `404 - File not found`, provavelmente outro servidor foi iniciado fora da
> pasta do projeto. Encerre-o com `Ctrl+C` e use o comando acima. O script sempre resolve
> a pasta correta, mesmo quando chamado por caminho absoluto a partir de outro diretório.

## Regras implementadas

- Partidas de 1, 3 ou 5 sets (vitórias por 1, 2 ou 3 sets, respectivamente).
- Sets regulares até 25 pontos; tie-break decisivo até 15.
- Sempre são necessários dois pontos de vantagem.
- Ao confirmar o encerramento, somente quem estava em quadra participa do novo sorteio.
- Durante a partida, jogadores podem ser arrastados entre os times ou removidos sem substituição automática.
