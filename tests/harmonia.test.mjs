import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EDICAO, SERVICOS, links, servicoDaFrase} from '../web/js/lib/harmonia.js';
import harmonia, {temaDaFrase, casaHarmonia} from '../web/js/skills/harmonia.js';

test('harmonia: frase escolhe o momento certo', () => {
  assert.equal(temaDaFrase('música para dormir'), 'noite');
  assert.equal(temaDaFrase('música 528 hz para relaxar'), 'relax');
  assert.equal(temaDaFrase('música para análise de bitcoin'), 'mercado');
  assert.equal(temaDaFrase('trabalho e estudos'), 'estudo');
  assert.equal(temaDaFrase('trabalho e estudo'), 'estudo');
  assert.equal(temaDaFrase('trilha sonora para foco nos estudos'), 'estudo');
  assert.equal(temaDaFrase('música de fé'), 'fe');
  assert.equal(temaDaFrase('músicas de adoração'), 'fe');
  assert.equal(temaDaFrase('música feliz'), null);
  assert.equal(temaDaFrase('playlist da semana'), null);
});

test('harmonia: casa com o nome do momento, sem dizer música', () => {
  assert.equal(casaHarmonia('trabalho e estudos'), true);
  assert.equal(casaHarmonia('trabalho e estudo'), true);
  assert.equal(casaHarmonia('harmonia trabalho'), true);
  assert.equal(casaHarmonia('harmonia trabalho e estudo'), true);
  assert.equal(casaHarmonia('harmonia trabalho e estudos'), true);
  assert.equal(casaHarmonia('mercado financeiro'), true);
  assert.equal(casaHarmonia('fé, oração e adoração'), true);
  assert.equal(casaHarmonia('relaxamento'), true);
  assert.equal(casaHarmonia('como está o bitcoin'), false);
  assert.equal(temaDaFrase('harmonia trabalho'), 'estudo');
  assert.equal(temaDaFrase('harmonia trabalho e estudo'), 'estudo');
});

test('harmonia: edição tem ids únicos e toda faixa abre nos três serviços', () => {
  const ids = EDICAO.secoes.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const s of EDICAO.secoes) {
    assert.ok(s.faixas.length > 0, s.id);
    for (const f of s.faixas) {
      const l = links(f);
      assert.deepEqual(Object.keys(l), SERVICOS, f.musica);
      assert.match(l.spotify, /^https:\/\/open\.spotify\.com\/(track|search)\//, f.musica);
      assert.match(l.youtube, /^https:\/\/www\.youtube\.com\/(watch\?v=|results\?search_query=)/, f.musica);
      assert.match(l.deezer, /^https:\/\/www\.deezer\.com\/(track|search)\//, f.musica);
    }
  }
});

test('harmonia: link direto quando existe, senão busca pelo nome', () => {
  const l = links({musica: 'Ambre', artista: 'Nils Frahm', spotify: 'https://open.spotify.com/track/71BqXMUdoiYHohiDlMihIR'});
  assert.equal(l.spotify, 'https://open.spotify.com/track/71BqXMUdoiYHohiDlMihIR');
  assert.equal(l.deezer, 'https://www.deezer.com/search/Ambre%20Nils%20Frahm');
  assert.equal(l.youtube, 'https://www.youtube.com/results?search_query=Ambre%20Nils%20Frahm');
  assert.equal(links({musica: '432 Hz', artista: '', busca: '432hz piano'}).deezer, 'https://www.deezer.com/search/432hz%20piano');
});

test('harmonia: serviço citado na frase vira o preferido', () => {
  assert.equal(servicoDaFrase('música para dormir no deezer'), 'deezer');
  assert.equal(servicoDaFrase('playlist no YouTube'), 'youtube');
  assert.equal(servicoDaFrase('música para dormir'), null);
  let salvou = 0;
  const ctx = {estado: {}, salvar: () => salvou++, mostrar() {}};
  const r = harmonia.rodar('música de adoração no deezer', ctx);
  assert.deepEqual(ctx.estado.harmonia, {servico: 'deezer'});
  assert.equal(salvou, 1);
  assert.match(r, /Abri a lista para você ouvir no Deezer\.$/);
});

test('harmonia: fala as faixas do momento e pede para escolher o serviço na tela', () => {
  const abertos = [];
  const r = harmonia.rodar('trabalho e estudos', {mostrar: (tela, id) => abertos.push([tela, id])});
  assert.deepEqual(abertos, [['harmonia', 'estudo']]);
  assert.match(r, /^Trabalho e estudos — concentração: Efeito Mozart para Foco Profundo/);
  assert.match(r, /Abri a playlist\. Escolha Spotify, YouTube ou Deezer para ouvir\.$/);
});

test('harmonia: sem tema, apresenta os momentos; sem tela, não promete abrir', () => {
  const r = harmonia.rodar('playlist da semana', {});
  assert.match(r, /edição 2\. Momentos: fé, oração e adoração; trabalho e estudos; mercado financeiro; relaxamento; noite\./);
  assert.doesNotMatch(r, /Abri a playlist/);
});
