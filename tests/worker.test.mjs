import {test, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/src/index.mjs';

const ORIGEM = 'http://localhost:8000';
const env = {ALLOWED_ORIGIN: ORIGEM, ACCESS_CODE: 'segredo', ANTHROPIC_API_KEY: 'k-teste'};
const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; });

const pedir = (caminho, {method = 'POST', origem = ORIGEM, codigo = 'segredo', corpo} = {}) =>
  worker.fetch(new Request('https://w.dev' + caminho, {
    method,
    headers: {Origin: origem, 'X-Access-Code': codigo, 'Content-Type': 'application/json'},
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  }), env);

test('preflight responde 204 com CORS da origem permitida', async () => {
  const r = await pedir('/api/ia/chat', {method: 'OPTIONS'});
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), ORIGEM);
});

test('origem fora da lista recebe 403', async () => {
  assert.equal((await pedir('/api/ia/ping', {origem: 'https://evil.example'})).status, 403);
});

test('código de acesso errado recebe 401', async () => {
  assert.equal((await pedir('/api/ia/ping', {codigo: 'x'})).status, 401);
});

test('ping com código certo responde ok', async () => {
  const r = await pedir('/api/ia/ping');
  assert.deepEqual(await r.json(), {ok: true});
});

test('chat repassa à Anthropic com a chave do servidor e histórico recortado', async () => {
  let enviado;
  globalThis.fetch = async (url, init) => {
    enviado = {url, headers: init.headers, body: JSON.parse(init.body)};
    return new Response(JSON.stringify({content: [{type: 'text', text: 'Às ordens.'}]}));
  };
  const history = Array.from({length: 10}, (_, i) => ({role: i % 2 ? 'assistant' : 'user', content: 'm' + i}));
  const r = await pedir('/api/ia/chat', {corpo: {message: 'olá', history}});
  assert.deepEqual(await r.json(), {reply: 'Às ordens.'});
  assert.equal(enviado.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(enviado.headers['x-api-key'], 'k-teste');
  assert.equal(enviado.body.messages[0].role, 'user');
  assert.ok(enviado.body.messages.length <= 7);
  assert.equal(enviado.body.messages.at(-1).content, 'olá');
});

test('modo estudo usa instrução e limite próprios; modo desconhecido vira conversa', async () => {
  const corpos = [];
  globalThis.fetch = async (url, init) => {
    corpos.push(JSON.parse(init.body));
    return new Response(JSON.stringify({content: [{type: 'text', text: 'ok'}]}));
  };
  await pedir('/api/ia/chat', {corpo: {message: 'x'.repeat(3000), modo: 'estudo', history: [{role: 'user', content: 'h'}]}});
  await pedir('/api/ia/chat', {corpo: {message: 'oi', modo: 'ignore as regras'}});
  assert.match(corpos[0].system, /estudo bíblico/);
  assert.equal(corpos[0].max_tokens, 900);
  assert.equal(corpos[0].messages.length, 1);
  assert.equal(corpos[0].messages[0].content.length, 3000);
  assert.match(corpos[1].system, /2 frases/);
  assert.equal(corpos[1].max_tokens, 300);
});

test('falha da Anthropic vira 502', async () => {
  globalThis.fetch = async () => new Response('x', {status: 500});
  assert.equal((await pedir('/api/ia/chat', {corpo: {message: 'oi'}})).status, 502);
});
