// Skill: Harmonia, a playlist da semana. Ex.: "playlist da semana", "música para dormir", "música para análise de bitcoin", "música de adoração no deezer", "música 432 hz no youtube".
// Citar Spotify, YouTube ou Deezer na frase vira o serviço preferido (salvo).
// Fala as faixas do momento pedido e pede à tela para abrir a lista (ctx.mostrar), onde ficam os links para ouvir.
import {EDICAO,NOME_SERVICO,servicoDaFrase} from '../lib/harmonia.js';
const P='(?<![\\wÀ-ÿ])'; // \b não reconhece letras acentuadas
const TEMAS=[['noite',/dormir|(?<![\wÀ-ÿ])sono(?![\wÀ-ÿ])|noite|deitar/i],['relax',/relax|432|528|frequ[eê]ncia|medita|natureza|calma|ansiedade/i],
['mercado',/mercado|trade|trading|bitcoin|btc|cripto|an[aá]lise|gr[aá]fico|investi/i],['estudo',/estud|trabalh|concentra|foco|leitura|program/i],
['fe',new RegExp(P+'(f[eé](?![\\wÀ-ÿ])|ora[cç][aã]o|adora|louvor|gospel|worship|deus|igreja)','i')]];
export const temaDaFrase=t=>(TEMAS.find(([,r])=>r.test(t))||[])[0]||null;
const faixa=f=>f.artista?`${f.musica}, de ${f.artista}`:f.musica;
export default{nome:'harmonia',
casa:t=>/m[uú]sicas?|playlist|harmonia|trilha sonora|\btocar\b|\b(432|528)\s*hz/i.test(t),
rodar(t,c){const id=temaDaFrase(t),s=EDICAO.secoes.find(x=>x.id===id),abriu=!!c.mostrar,sv=servicoDaFrase(t);
if(sv){c.estado.harmonia={...c.estado.harmonia,servico:sv};c.salvar?.()}
c.mostrar?.('harmonia',id);
const fim=abriu?` Abri a lista para você ouvir${sv?' no '+NOME_SERVICO[sv]:''}.`:'';
if(!s)return `${EDICAO.titulo}, edição ${EDICAO.numero}. Momentos: ${EDICAO.secoes.map(x=>x.titulo.split(' — ')[0].toLowerCase()).join('; ')}. Diga, por exemplo: música para dormir.${fim}`;
return `${s.titulo}: ${s.faixas.map(faixa).join('; ')}. ${s.momento}${fim}`}}
