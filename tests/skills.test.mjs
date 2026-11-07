import {test} from 'node:test';
import assert from 'node:assert/strict';
import {achar, valor, velas} from '../web/js/lib/moedas.js';
import tarefas from '../web/js/skills/tarefas.js';
import alertas from '../web/js/skills/alertas.js';

test('valor entende números falados', () => {
  assert.equal(valor('400 mil'), 400000);
  assert.equal(valor('15.000'), 15000);
  assert.equal(valor('1.234,5'), 1234.5);
  assert.equal(valor('15000'), 15000);
  assert.equal(valor('abc'), null);
});

test('achar reconhece nome e sigla da moeda', () => {
  assert.equal(achar('cotação do Ethereum'), 'ETH');
  assert.equal(achar('quanto está o doge'), 'DOGE');
  assert.equal(achar('previsão do tempo'), null);
  assert.equal(achar('cotação do USDT'), 'USDT');
  assert.equal(achar('quanto está o tether'), 'USDT');
});

test('velas pede o intervalo certo e devolve abertura, máxima, mínima e fechamento', async () => {
  const fetchOriginal = globalThis.fetch;
  let url;
  globalThis.fetch = async u => { url = u; return new Response(JSON.stringify([[1700000000000, '10', '12', '9', '11', '0']])); };
  try {
    assert.deepEqual(await velas('ETHBRL', '4h', 42), [{t: 1700000000000, o: 10, h: 12, l: 9, c: 11}]);
    assert.match(url, /symbol=ETHBRL&interval=4h&limit=42$/);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test('alerta de USDT usa o par em reais, mesmo com "usdt" na frase', async () => {
  const urls = [];
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async url => { urls.push(url); return new Response(JSON.stringify({price: '5.58'})); };
  try {
    const ctx = {estado: {}, salvar() {}};
    const r = await alertas.rodar('avise quando o usdt passar de 6', ctx);
    assert.match(urls[0], /symbol=USDTBRL$/);
    assert.equal(ctx.estado.alertas[0].par, 'BRL');
    assert.match(r, /^Combinado\. Aviso quando o USDT ficar acima de R\$\s?6,00\./);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test('tarefas: adicionar, listar e concluir', () => {
  let salvou = 0;
  const ctx = {estado: {}, salvar: () => salvou++};
  assert.equal(tarefas.rodar('tarefa comprar pão', ctx), 'Tarefa adicionada: comprar pão');
  assert.equal(tarefas.rodar('tarefa ligar banco', ctx), 'Tarefa adicionada: ligar banco');
  assert.equal(tarefas.rodar('pendências', ctx), '2 pendências: comprar pão; ligar banco');
  assert.equal(tarefas.rodar('concluir tarefa pão', ctx), 'Concluída: comprar pão');
  assert.equal(tarefas.rodar('pendências', ctx), '1 pendência: ligar banco');
  assert.equal(tarefas.rodar('concluir tarefa xyz', ctx), 'Não achei essa tarefa.');
  assert.equal(salvou, 3);
});
