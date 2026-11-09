// Janela da Harmonia: abas por momento, faixas com Spotify/YouTube/Deezer e o versículo da semana. Só exibe; comandos voltam por aoComando.
import {EDICAO,SERVICOS,NOME_SERVICO,links} from '../lib/harmonia.js';
const $=id=>document.getElementById(id);
const el=(tag,cls,...filhos)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.append(...filhos);return e};
let ctx,secaoAtual;
const preferido=()=>ctx.estado.harmonia?.servico||'spotify';
function mostrarSecao(id){const s=EDICAO.secoes.find(x=>x.id===id)||EDICAO.secoes[0],pref=preferido(),ordem=[pref,...SERVICOS.filter(x=>x!==pref)];secaoAtual=s.id;
document.querySelectorAll('#hm-abas button').forEach(b=>b.classList.toggle('on',b.dataset.id===s.id));
document.querySelectorAll('#hm-servico button').forEach(b=>b.classList.toggle('on',b.dataset.s===pref));
$('hm-momento').textContent=s.momento;$('hm-nota').textContent=s.nota||'';
$('hm-faixas').replaceChildren(...s.faixas.map(f=>{const l=links(f);
const botoes=ordem.map(sv=>{const a=el('a',sv===pref?'pref':'',NOME_SERVICO[sv]+(f[sv]?' ↗':' ⌕'));a.href=l[sv];a.target='_blank';a.rel='noopener noreferrer';
a.title=f[sv]?`Abrir a faixa no ${NOME_SERVICO[sv]}`:`Buscar no ${NOME_SERVICO[sv]}`;return a});
return el('li','',el('span','',el('b','',f.musica),el('small','',f.artista||'—')),el('div','hm-links',...botoes))}))}
let montado=false;
export function abrirHarmonia(id,c,aoComando){ctx=c;if(!montado){montado=true;
$('hm-edicao').textContent=`Edição ${String(EDICAO.numero).padStart(2,'0')} · ${new Date(EDICAO.data+'T12:00').toLocaleDateString('pt-BR')}`;
$('hm-abas').replaceChildren(...EDICAO.secoes.map(s=>{const b=el('button','',s.titulo.split(' — ')[0]);b.type='button';b.dataset.id=s.id;b.onclick=()=>mostrarSecao(s.id);return b}));
$('hm-servico').replaceChildren(el('span','','Ouvir em'),...SERVICOS.map(sv=>{const b=el('button','',NOME_SERVICO[sv]);b.type='button';b.dataset.s=sv;
b.onclick=()=>{ctx.estado.harmonia={...ctx.estado.harmonia,servico:sv};ctx.salvar();mostrarSecao(secaoAtual)};return b}));
$('hm-vers').textContent=EDICAO.versiculo.nome;
$('hm-ler').onclick=()=>{$('harmonia').close();aoComando('leia '+EDICAO.versiculo.ref)};
$('hm-fechar').onclick=()=>$('harmonia').close()}
mostrarSecao(id);if(!$('harmonia').open)$('harmonia').showModal()}
