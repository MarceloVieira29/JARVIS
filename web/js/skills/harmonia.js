// Skill: Harmonia, a playlist da semana.
// Ex.: "trabalho e estudos", "música para dormir", "harmonia mercado", "fé e adoração", "playlist da semana".
// Abre a aba do momento; sem citar Spotify/YouTube/Deezer, a pessoa escolhe na tela onde ouvir.
import {EDICAO,NOME_SERVICO,servicoDaFrase} from '../lib/harmonia.js';
const P='(?<![\\wÀ-ÿ])'; // \b não reconhece letras acentuadas
const TEMAS=[
  ['noite',/dormir|(?<![\wÀ-ÿ])sono(?![\wÀ-ÿ])|(?<![\wÀ-ÿ])noite(?![\wÀ-ÿ])|deitar/i],
  ['relax',/relax|432|528|frequ[eê]ncia|medita|natureza|calma|ansiedade/i],
  ['mercado',/mercado financeiro|trade|trading|(?<![\wÀ-ÿ])bitcoin(?![\wÀ-ÿ])|(?<![\wÀ-ÿ])btc(?![\wÀ-ÿ])|cripto|an[aá]lise|gr[aá]fico|investi/i],
  ['estudo',/trabalho e estud|estud|trabalh|concentra|foco|leitura|program/i],
  ['fe',new RegExp(P+'(f[eé](?![\\wÀ-ÿ])|ora[cç][aã]o|adora|louvor|gospel|worship|deus|igreja)','i')],
];
export const temaDaFrase=t=>(TEMAS.find(([,r])=>r.test(t))||[])[0]||null;
// Casa com "música/playlist/harmonia" OU com o nome do momento (ex.: "trabalho e estudos").
const PEDIDO=/m[uú]sicas?|playlist|harmonia|trilha sonora|\btocar\b|\b(432|528)\s*hz|trabalho e estud|mercado financeiro|(?<![\wÀ-ÿ])relaxamento(?![\wÀ-ÿ])|f[eé].{0,24}adora|abrir (a )?(noite|f[eé]|harmonia)/i;
export const casaHarmonia=t=>PEDIDO.test(t)||(/^(m[uú]sica|playlist|harmonia)\b/i.test(t)&&!!temaDaFrase(t));
// "harmonia trabalho", "harmonia trabalho e estudo(s)" → aba Trabalho e estudos
const faixa=f=>f.artista?`${f.musica}, de ${f.artista}`:f.musica;
export default{nome:'harmonia',
casa:casaHarmonia,
rodar(t,c){const id=temaDaFrase(t),s=EDICAO.secoes.find(x=>x.id===id),abriu=!!c.mostrar,sv=servicoDaFrase(t);
if(sv){c.estado.harmonia={...c.estado.harmonia,servico:sv};c.salvar?.()}
c.mostrar?.('harmonia',id);
const fim=!abriu?'':sv?` Abri a lista para você ouvir no ${NOME_SERVICO[sv]}.`:' Abri a playlist. Escolha Spotify, YouTube ou Deezer para ouvir.';
if(!s)return `${EDICAO.titulo}, edição ${EDICAO.numero}. Momentos: ${EDICAO.secoes.map(x=>x.titulo.split(' — ')[0].toLowerCase()).join('; ')}. Diga, por exemplo: trabalho e estudos.${fim}`;
return `${s.titulo}: ${s.faixas.map(faixa).join('; ')}. ${s.momento}${fim}`}}
