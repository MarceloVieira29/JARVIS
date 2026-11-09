# JARVIS

Assistente de voz em português que roda no navegador. Cada habilidade é um arquivo; o que está ligado fica em `web/js/config.js`. Respostas livres passam por um Cloudflare Worker, o único lugar onde a chave da IA existe.

Publicado em https://marcelovieira29.github.io/JARVIS/

## Estrutura

```
web/                       site estático (é o que vai para o GitHub Pages)
  index.html, css/         tela HUD: núcleo central, painéis e terminal
  js/main.js               liga a interface ao núcleo, à voz e aos painéis
  js/ui/painel.js          painéis com dados reais (clima, mercado, agenda, módulos, versículo); só lê
  js/ui/harmonia.js        janela da playlist da semana (abas por momento, links para ouvir)
  js/config.js             ÚNICO lugar para ligar/desligar skills, nome, palavras-chave, voz
  js/core/core.js          carrega as skills e roteia o comando para a primeira que "casa"
  js/core/voice.js         fala e escuta (não conhece skills nem backend)
  js/core/store.js         localStorage; código de acesso só em sessionStorage
  js/lib/moedas.js         Binance pública, somente leitura
  js/lib/clima.js          Open-Meteo: busca de cidade e previsão (skill clima e painel)
  js/lib/biblia.js         livros, referências faladas e leitura (bible-api.com, Almeida)
  js/lib/ia.js             cliente do Worker com mensagens de erro faladas
  js/skills/*.js           uma habilidade por arquivo
worker/                    backend opcional de IA (Cloudflare Worker)
  src/index.mjs            CORS por origem, código de acesso, proxy para a Anthropic
  wrangler.toml            nome, origem permitida em produção
  .dev.vars.example        modelo dos segredos para rodar local
scripts/
  serve.mjs                servidor local sem dependências (porta 8000)
  local.ps1                "pode rodar jarvis local"
  main.ps1                 "pode rodar jarvis main"
tests/                     node --test: roteamento, skills, Worker
.github/workflows/ci.yml   testes em todo push; publica web/ no Pages a partir da main
```

Fluxo de um comando: toque no orb → reconhecimento de voz (ou texto) → filtro da palavra-chave → `rotear` percorre as skills na ordem do config → `rodar` devolve a frase → `voice.js` fala.

## Rodar local

Requisitos: Node 20+ e Chrome ou Edge (reconhecimento de voz).

```powershell
powershell -ExecutionPolicy Bypass -File scripts/local.ps1
```

Roda os testes, abre http://localhost:8000 e serve `web/`. Para ter a IA livre localmente, copie `worker/.dev.vars.example` para `worker/.dev.vars`, preencha a chave e o código; o script sobe o Worker em http://localhost:8787 em outra janela e a página já aponta para ele.

Sem o script: `npm test`, `npm run dev`, `npm run worker`.

## Publicar na main

```powershell
powershell -ExecutionPolicy Bypass -File scripts/main.ps1 -Mensagem "o que mudou"
```

Testa, commita tudo e faz push em `main`. O GitHub Actions roda os testes de novo e publica `web/` no Pages.

Uma vez só, no GitHub: Settings → Pages → Source: **GitHub Actions**.

## Worker em produção

```powershell
npx wrangler secret put ANTHROPIC_API_KEY --config worker/wrangler.toml
npx wrangler secret put ACCESS_CODE --config worker/wrangler.toml
npm run worker:deploy
```

`ALLOWED_ORIGIN` em `worker/wrangler.toml` é só o domínio (`https://marcelovieira29.github.io`, sem `/JARVIS`). Depois informe a URL do Worker e o código em ⚙ Configurações na página.

## Skills

| Skill | Exemplos |
|---|---|
| `saudacao` | "bom dia", "oi" |
| `lembretes` | "me lembre em 10 minutos de tomar água", "lembrete às 15:30 reunião", "cancelar lembretes" |
| `alertas` | "avise quando o bitcoin passar de 400 mil", "alertas" (até 5, verifica a cada 1 min) |
| `tarefas` | "tarefa comprar pão", "concluir tarefa pão", "pendências" |
| `cotacao` | "cotação do ethereum", "quanto está o solana", "bitcoin" |
| `clima` | "previsão do tempo", "vai chover amanhã em Curitiba", "clima nos próximos dias", "minha cidade é Campinas" |
| `biblia` | "leia salmo 23", "João 3 16", "versículo do dia", "reflexão do dia", "reflexão sobre Filipenses 4 13", "estudo de Romanos 8", "estudo bíblico sobre perdão" |
| `harmonia` | "playlist da semana", "música para dormir", "música para análise de bitcoin", "música de adoração", "música 432 hz" |
| `ia` | todo o resto (precisa do Worker); fica sempre por último |

Lembretes e alertas só disparam com a aba aberta.

`clima` usa o Open-Meteo (sem chave). A cidade vem da frase; a primeira cidade pedida vira a padrão; sem cidade, usa a localização do navegador e, por fim, `cidadePadrao` do config.

`biblia` lê a tradução Almeida pelo bible-api.com (sem chave); capítulos longos são lidos de 15 em 15 versículos. Reflexão e estudo mandam o texto ao Worker nos modos `reflexao` e `estudo`; sem Worker, o JARVIS lê a passagem e propõe um roteiro de meditação ou de estudo.

`harmonia` é a playlist da semana em cinco momentos (fé, estudos, mercado, relaxamento, noite). A skill fala as faixas e abre a janela Harmonia (também no atalho do núcleo), com links para ouvir no Spotify ou YouTube e o versículo da semana. Edição nova: troque `EDICAO` em `web/js/lib/harmonia.js` — só títulos, artistas e links, nunca letras.

## Comando de voz

Ao tocar em Ativar, o navegador pede o microfone (permita uma vez). Com "exigir a palavra-chave" ligado, comece com "Jarvis" — também valem "Jarbas" e outras variações em `palavrasChave`. O status mostra o que está sendo ouvido; se a frase vier sem a palavra-chave, ele avisa em vez de ignorar calado.

Nova skill: crie `web/js/skills/minha.js` exportando `{nome, casa(texto,ctx), rodar(texto,ctx)}` (opcional `iniciar(ctx)`), adicione `'minha'` em `skills` no config antes de `'ia'` e um caso em `tests/rotas.test.mjs`.

## Segurança

O repositório é público: nenhuma chave, senha ou token em arquivo. `worker/.dev.vars` está no `.gitignore`. O código de acesso é digitado na tela e fica só na sessão do navegador.
