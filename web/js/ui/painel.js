// Painéis do HUD com dados reais: clima, mercado, agenda, módulos e versículo do dia. Só lê; não fala nem executa comandos.
import {geocodificar,previsao,descrever} from '../lib/clima.js';
import {ticker,velas} from '../lib/moedas.js';
import {passagem,doDia} from '../lib/biblia.js';
import {suportaVoz} from '../core/voice.js';
const $=id=>document.getElementById(id);
const el=(tag,cls,...filhos)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.append(...filhos);return e};
const g=Math.round,brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:v<10?2:0,maximumFractionDigits:v<10?2:0});
const hora=ms=>new Date(ms).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const DIAS=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
let cidadeMostrada='';
const limitar=v=>Math.max(0,Math.min(100,v));
function medidor(id,pct,texto,cai=false){const e=$(id);e.querySelector('.valor').style.strokeDashoffset=100-limitar(pct);e.querySelector('b').textContent=texto;e.classList.toggle('cai',cai)}
function escala(id,n,r1,r2,cadaMaior){const NS='http://www.w3.org/2000/svg',gp=$(id);
for(let i=0;i<n;i++){const a=i*2*Math.PI/n,m=cadaMaior&&i%cadaMaior===0,ri=m?r1-3:r1,p=document.createElementNS(NS,'path');
p.setAttribute('d',`M${150+ri*Math.sin(a)} ${150-ri*Math.cos(a)}L${150+r2*Math.sin(a)} ${150-r2*Math.cos(a)}`);if(m)p.classList.add('maior');gp.append(p)}}

async function clima(c){try{const l=c.estado.cidade||await geocodificar(c.cfg.cidadePadrao),p=await previsao(l),d=p.daily;cidadeMostrada=l.nome;
$('cl-cidade').textContent=l.nome;$('cl-temp').textContent=g(p.current.temperature_2m);
$('cl-desc').textContent=`${descrever(p.current.weather_code)} · sensação ${g(p.current.apparent_temperature)}°`;
medidor('lt-temp',p.current.temperature_2m/40*100,g(p.current.temperature_2m)+'°');
medidor('lt-chuva',d.precipitation_probability_max[0]??0,(d.precipitation_probability_max[0]??0)+'%');
$('cl-dias').replaceChildren(...d.time.map((t,i)=>el('div','',el('small','',i?DIAS[new Date(t+'T12:00').getDay()]:'HOJE'),el('b','',`${g(d.temperature_2m_min[i])}° / ${g(d.temperature_2m_max[i])}°`),el('small','',`chuva ${d.precipitation_probability_max[i]??0}%`))))}
catch{$('cl-desc').textContent='Sem conexão com o serviço de clima.'}}

function variacao(id,p){const e=$(id);e.textContent=`${p>=0?'+':''}${p.toFixed(2).replace('.',',')}%`;e.className='var '+(p>=0?'sobe':'cai')}
// Mercado: lista de pares (variação 24h) + velas do par escolhido no período escolhido.
const PARES=['BTCBRL','BTCUSDT','ETHBRL','USDTBRL'];
const nomePar=p=>p.replace(/(BRL|USDT)$/,'/$1');
const cotar=(v,par)=>par.endsWith('BRL')?brl(v):v.toLocaleString('pt-BR',{maximumFractionDigits:v<10?4:0})+' USDT';
const parEscolhido=c=>{const m=c.estado.mercado||{};return PARES.includes(m.par)?m.par:m.moeda?m.moeda+'BRL':'BTCBRL'}; // 'moeda' = formato salvo antigo
const PERIODOS={'1H':['1m',60],'24H':['30m',48],'7D':['4h',42],'30D':['1d',30]};
const dataVela=(ms,p)=>new Date(ms).toLocaleString('pt-BR',p==='30D'?{day:'2-digit',month:'2-digit'}:p==='7D'?{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}:{hour:'2-digit',minute:'2-digit'});
function desenharVelas(v,p,par){const brl=x=>cotar(x,par);const NS='http://www.w3.org/2000/svg',svg=$('mk-velas'),n=v.length,W=300,H=100,passo=W/n,corpo=Math.max(1,passo*.62);
const lo=Math.min(...v.map(x=>x.l)),hi=Math.max(...v.map(x=>x.h)),y=x=>4+(H-8)*(hi-x)/((hi-lo)||1);
const no=(tag,a)=>{const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);return e};
const ult=v.at(-1).c,filhos=[no('line',{x1:0,x2:W,y1:y(ult),y2:y(ult),class:'ultimo'})];
v.forEach((x,i)=>{const cx=i*passo+passo/2,g2=no('g',{class:x.c>=x.o?'alta':'baixa'}),t=no('title',{});
t.textContent=`${dataVela(x.t,p)} · abertura ${brl(x.o)} · máxima ${brl(x.h)} · mínima ${brl(x.l)} · fechamento ${brl(x.c)}`;
g2.append(t,no('line',{x1:cx,x2:cx,y1:y(x.h),y2:y(x.l)}),no('rect',{x:cx-corpo/2,width:corpo,y:Math.min(y(x.o),y(x.c)),height:Math.max(.8,Math.abs(y(x.o)-y(x.c)))}));filhos.push(g2)});
svg.replaceChildren(...filhos);$('mk-min').textContent='mín '+brl(lo);$('mk-max').textContent='máx '+brl(hi)}
let pedidoVelas=0; // cliques rápidos: só a resposta do último pedido é desenhada
async function velasEscolhidas(c){const par=parEscolhido(c),p=c.estado.mercado?.periodo||'24H',[iv,n]=PERIODOS[p],meu=++pedidoVelas;
$('mk-titulo').textContent=`${nomePar(par)} · ${p}`;
document.querySelectorAll('#mk-ativos button').forEach(b=>b.classList.toggle('on',b.dataset.par===par));
document.querySelectorAll('#mk-periodos button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
try{const v=await velas(par,iv,n);if(meu!==pedidoVelas)return;desenharVelas(v,p,par);$('mk-preco').textContent=cotar(v.at(-1).c,par);variacao('mk-var',100*(v.at(-1).c-v[0].o)/v[0].o)}
catch{$('mk-preco').textContent='offline'}}
async function mercado(c){const t=await Promise.allSettled(PARES.map(ticker));
t.forEach((r,i)=>{if(r.status!=='fulfilled')return;$('mk-'+PARES[i]).textContent=cotar(+r.value.lastPrice,PARES[i]);variacao(`mk-${PARES[i]}-var`,+r.value.priceChangePercent)});
if(t[0].status==='fulfilled'){const vb=+t[0].value.priceChangePercent;medidor('lt-btc',50+vb*5,`${vb>=0?'+':''}${vb.toFixed(1).replace('.',',')}%`,vb<0)}
await velasEscolhidas(c)}
function escolherMercado(c,mudar){const {moeda,...resto}=c.estado.mercado||{};c.estado.mercado={par:parEscolhido(c),periodo:'24H',...resto,...mudar};c.salvar();velasEscolhidas(c)}

function agenda(c){const t=(c.estado.tarefas||[]).filter(x=>!x.feita),l=(c.estado.lembretes||[]).slice().sort((a,b)=>a.quando-b.quando),a=c.estado.alertas||[];
$('ag-resumo').textContent=`${t.length} tarefa${t.length===1?'':'s'} · ${l.length} lembrete${l.length===1?'':'s'}`;
const itens=[...l.slice(0,3).map(x=>[hora(x.quando),x.texto]),...t.slice(0,4).map(x=>['TAREFA',x.titulo]),...a.slice(0,2).map(x=>['ALERTA',`${x.moeda} ${x.dir} de ${x.valor.toLocaleString('pt-BR')} ${x.par}`])];
$('ag-lista').replaceChildren(...(itens.length?itens.map(([k,v])=>el('li','',el('small','',k),v)):[el('li','vazio','Nada agendado. Diga: tarefa comprar pão.')]))}

async function microfone(){try{const s=(await navigator.permissions.query({name:'microphone'})).state;return s==='granted'?['LIBERADO','']:s==='denied'?['BLOQUEADO','erro']:['PERGUNTAR','alerta']}catch{return ['—','alerta']}}
async function ia(c){const url=c.backend();if(!url)return ['NÃO CONFIGURADA','alerta'];if(!c.codigo())return ['SEM CÓDIGO','alerta'];
try{const r=await fetch(url.replace(/\/$/,'')+'/api/ia/ping',{method:'POST',headers:{'X-Access-Code':c.codigo()},signal:AbortSignal.timeout(4000)});
return r.ok?['ONLINE','']:r.status===401?['CÓDIGO INVÁLIDO','erro']:['ERRO '+r.status,'erro']}catch{return ['OFFLINE','erro']}}
async function modulos(c){const m=[['Voz',suportaVoz?['PRONTA','']:['SEM SUPORTE','erro']],['Microfone',await microfone()],['IA',await ia(c)],['Skills',[`${c.cfg.skills.length} ATIVAS`,'']]];
const ok=m.filter(([,[,s]])=>!s).length,p=g(100*ok/m.length);
$('sy-pct').textContent=p+'%';$('sy-barra').style.width=p+'%';$('sy-resumo').textContent=`${ok}/${m.length} online`;
$('sy-modulos').replaceChildren(...m.map(([n,[v,s]])=>el('div',s,n,el('b','',v))));
const sys=$('sys');sys.classList.toggle('alerta',ok<m.length);sys.querySelector('span').textContent=ok===m.length?'OPERACIONAL':'PARCIAL';
medidor('lt-mod',p,p+'%');return m}

async function versiculo(){try{const p=await passagem(doDia());$('vs-ref').textContent=p.referencia;$('vs-texto').textContent=p.versos.map(v=>v.texto).join(' ')}
catch{$('vs-texto').textContent='Sem conexão com o serviço da Bíblia.'}}

const usuario=c=>{$('usuario').textContent=(c.estado.nome||c.cfg.tratamento).toUpperCase()};
const relogio=()=>{$('hora').textContent=new Date().toLocaleTimeString('pt-BR')};

// Devolve a checagem inicial dos módulos: [[nome,[valor,classe]],...] (classe vazia = ok).
export function iniciarPainel(c){escala('escala',72,152,146,6);escala('escala-interna',24,58,53);
document.querySelectorAll('#mk-ativos button').forEach(b=>b.onclick=()=>escolherMercado(c,{par:b.dataset.par}));
document.querySelectorAll('#mk-periodos button').forEach(b=>b.onclick=()=>escolherMercado(c,{periodo:b.dataset.p}));
relogio();setInterval(relogio,1000);usuario(c);agenda(c);clima(c);mercado(c);versiculo();
setInterval(()=>mercado(c),6e4);setInterval(()=>clima(c),15*6e4);setInterval(()=>modulos(c),3e4);setInterval(()=>agenda(c),3e4);return modulos(c)}
export function atualizarPainel(c){usuario(c);agenda(c);modulos(c);if(c.estado.cidade&&c.estado.cidade.nome!==cidadeMostrada)clima(c)}
