import {test, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {cidadeDaFrase, diasPedidos} from '../web/js/skills/clima.js';
import {descrever} from '../web/js/lib/clima.js';
import {referencia, textoRef, doDia} from '../web/js/lib/biblia.js';
import biblia from '../web/js/skills/biblia.js';

const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; });

test('clima: cidade vem da frase, sem confundir com o dia', () => {
  assert.equal(cidadeDaFrase('vai chover amanhã em Curitiba?'), 'Curitiba');
  assert.equal(cidadeDaFrase('como está o tempo no Rio de Janeiro'), 'Rio de Janeiro');
  assert.equal(cidadeDaFrase('minha cidade é São José dos Campos'), 'São José dos Campos');
  assert.equal(cidadeDaFrase('previsão do tempo para amanhã'), null);
  assert.equal(cidadeDaFrase('previsão do tempo'), null);
});

test('clima: dias pedidos e descrição do código WMO', () => {
  assert.deepEqual(diasPedidos('previsão do tempo'), [0]);
  assert.deepEqual(diasPedidos('vai chover amanhã'), [1]);
  assert.deepEqual(diasPedidos('tempo depois de amanhã'), [2]);
  assert.deepEqual(diasPedidos('clima nos próximos dias'), [0, 1, 2]);
  assert.equal(descrever(95), 'trovoadas');
  assert.equal(descrever(1234), 'tempo indefinido');
});

test('bíblia: referências faladas viram código da API', () => {
  const casos = [
    ['João 3:16', 'JHN 3:16'],
    ['joão capítulo 3 versículo 16', 'JHN 3:16'],
    ['leia salmo 23', 'PSA 23'],
    ['primeira Coríntios 13 4 a 7', '1CO 13:4-7'],
    ['1 João 1 9', '1JN 1:9'],
    ['Cântico dos Cânticos 2', 'SNG 2'],
    ['Apocalipse 21 1 até 4', 'REV 21:1-4'],
  ];
  for (const [frase, esperado] of casos) assert.equal(textoRef(referencia(frase)), esperado, frase);
  assert.equal(referencia('qual a capital da frança'), null);
});

test('bíblia: versículo do dia é estável no mesmo dia', () => {
  const d = new Date(2026, 10, 6);
  assert.deepEqual(doDia(d), doDia(new Date(2026, 10, 6, 23)));
});

const respostaAPI = (ref, versos) => async url => {
  assert.match(url, /bible-api\.com\/.+translation=almeida/);
  return new Response(JSON.stringify({reference: ref, verses: versos.map((t, i) => ({verse: i + 1, text: t + '  '}))}));
};
const ctxSemIA = {estado: {}, salvar() {}, backend: () => '', codigo: () => ''};

test('bíblia: leitura curta lê o texto inteiro', async () => {
  globalThis.fetch = respostaAPI('Salmos 23', ['O Senhor é o meu pastor;', 'nada me faltará.']);
  assert.equal(await biblia.rodar('leia salmo 23', ctxSemIA), 'Salmos 23. O Senhor é o meu pastor; nada me faltará.');
});

test('bíblia: capítulo longo é lido em partes', async () => {
  globalThis.fetch = respostaAPI('Gênesis 1', Array.from({length: 31}, (_, i) => `v${i + 1}.`));
  const r = await biblia.rodar('Gênesis 1', ctxSemIA);
  assert.match(r, /^Gênesis 1, versículos 1 a 15\. v1\./);
  assert.match(r, /Para continuar, diga: Gênesis 1, 16 a 31\.$/);
});

test('bíblia: reflexão sem servidor de IA cai no roteiro guiado', async () => {
  globalThis.fetch = respostaAPI('Filipenses 4:13', ['Posso todas as coisas naquele que me fortalece.']);
  const r = await biblia.rodar('reflexão sobre Filipenses 4 13', ctxSemIA);
  assert.match(r, /^Filipenses 4:13\. Posso todas as coisas/);
  assert.match(r, /Para refletir: /);
});

test('bíblia: estudo envia o texto ao Worker no modo estudo', async () => {
  let pedido;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('bible-api')) return respostaAPI('Romanos 8:28', ['Sabemos que todas as coisas cooperam para o bem.'])(url);
    pedido = JSON.parse(init.body);
    return new Response(JSON.stringify({reply: 'Paulo escreve aos romanos.'}));
  };
  const ctx = {...ctxSemIA, backend: () => 'http://localhost:8787'};
  const r = await biblia.rodar('estudo de Romanos 8 28', ctx);
  assert.equal(pedido.modo, 'estudo');
  assert.match(pedido.message, /cooperam para o bem/);
  assert.match(r, /Paulo escreve aos romanos\.$/);
});
