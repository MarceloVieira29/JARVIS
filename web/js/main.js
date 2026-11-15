// Cola a interface com o núcleo, a voz e os painéis.
import cfg from './config.js';
import {state,save,code,setCode} from './core/store.js';
import {carregarSkills,iniciarSkills,executar} from './core/core.js';
import {falar,ouvir,parar,estaAtivo,suportaVoz,onEstado,listarVozes,setVoz,autorizarMicrofone} from './core/voice.js';
import {iniciarPainel,atualizarPainel} from './ui/painel.js';
import {abrirHarmonia} from './ui/harmonia.js';
import {casaHarmonia} from './skills/harmonia.js';
const $=id=>document.getElementById(id);
let gesto=false;const fila=[];                       // navegadores só deixam falar após um toque do usuário
const liberar=()=>{if(gesto)return;gesto=true;fila.splice(0).forEach(falar)};
const MODOS=[[/ouvindo/i,'ouvindo','OUVINDO'],[/falando/i,'falando','FALANDO'],[/pensando/i,'pensando','PROCESSANDO']];
function status(s){$('st').textContent=s;const m=MODOS.find(([r])=>r.test(s));document.body.dataset.modo=m?m[1]:'';$('core').textContent=m?m[2]:estaAtivo()?'NÚCLEO\nATIVO':'ATIVAR'}
const msg=(t,c)=>{const d=document.createElement('div');d.className='m '+c;d.textContent=t;$('log').append(d);$('log').scrollTop=1e9};
const dizer=t=>{msg(t,'ai');gesto?falar(t):fila.push(t)};
const mostrar=(tela,id)=>{if(tela==='harmonia')abrirHarmonia(id,ctx,pedir)};
const ctx={estado:state,salvar:save,cfg,backend:()=>state.backend||cfg.backendUrl,codigo:code,dizer,mostrar};
const pronto=carregarSkills().then(()=>iniciarSkills(ctx));
const re=new RegExp('\\b('+cfg.palavrasChave.join('|')+')\\b[,\\s]*(.*)','i');
async function pedir(t){msg(t,'u');status('Pensando…');await pronto;dizer(await executar(t,ctx));atualizarPainel(ctx)}
// Com palavra-chave ligada: aceita "Jarvis, …" OU um pedido claro (ex.: "harmonia trabalho e estudos").
const pedidoClaro=t=>casaHarmonia(t)||/^(bom dia|boa tarde|boa noite|previs|cota[cç]|vers[ií]culo|pend[eê]n|tarefa |lembrete)/i.test(t.trim());
function tratar(t){const m=t.match(re);let c;
if(m)c=(m[2]||'').trim();
else if($('wk').checked&&!pedidoClaro(t)){status(`Ouvi “${t}”. Diga “${cfg.nome}, harmonia trabalho e estudos”.`);return}
else c=t.trim();
if(c.length<2){if(m)dizer('Pois não?');return}pedir(c)}
onEstado(status);

// Liga o microfone e a escuta. saudacao=true fala o briefing (toque no núcleo).
async function ativarVoz({saudacao=false}={}){if(estaAtivo())return true;await pronto;
if(!suportaVoz){msg('Este navegador não reconhece voz. Use Chrome ou Edge, ou digite.','ai');return false}
if(!await autorizarMicrofone()){msg($('st').textContent,'ai');return false}
if(saudacao)dizer(cfg.skills.includes('saudacao')?await executar('bom dia',ctx):cfg.nome+' online.');
ouvir(tratar,t=>status('Ouvindo: '+t));atualizarPainel(ctx);return true}

// Ao abrir: se o microfone já estiver liberado, começa a ouvir sozinho (sem briefing).
async function aoAbrir(){if(!suportaVoz||!navigator.permissions?.query)return;
try{if((await navigator.permissions.query({name:'microphone'})).state==='granted')await ativarVoz()}catch{}}

// Primeiro toque ou tecla libera a fala e ativa a escuta. O núcleo (#orb) cuida sozinho no clique dele.
async function primeiroGesto(e){liberar();if(e.type==='pointerdown'&&e.target.closest('#orb'))return;if(!estaAtivo())await ativarVoz()}
document.addEventListener('pointerdown',primeiroGesto,{once:true});
document.addEventListener('keydown',primeiroGesto,{once:true});

function vozes(){const s=$('vz');s.textContent='';s.append(new Option('Voz automática (grave e formal)',''));listarVozes().forEach(v=>s.append(new Option(v.name,v.name)));s.value=state.voz||'';setVoz(state.voz||'')}
if('speechSynthesis' in window){speechSynthesis.onvoiceschanged=vozes;vozes()}
$('vz').onchange=()=>{state.voz=$('vz').value;setVoz(state.voz);save();$('vt').click()};
$('vt').onclick=()=>falar(`Às suas ordens, ${state.nome||cfg.tratamento}. Todos os sistemas operando normalmente.`);
$('nm').value=state.nome||'';$('bk').value=state.backend||cfg.backendUrl;$('ac').value=code();$('wk').checked=state.wk??cfg.exigirPalavraChave;
$('wk').onchange=()=>{state.wk=$('wk').checked;save()};
$('abrirCfg').onclick=()=>$('ajustes').showModal();
$('cfg').onclick=()=>{state.nome=$('nm').value.trim();state.backend=$('bk').value.trim();setCode($('ac').value);save();$('ajustes').close();dizer('Configurações salvas.');atualizarPainel(ctx)};
$('send').onclick=()=>{const v=$('t').value.trim();if(v){$('t').value='';pedir(v)}};
$('t').onkeydown=e=>{if(e.key==='Enter')$('send').click()};
$('orb').onclick=async()=>{if(estaAtivo())return parar();await ativarVoz({saudacao:true})};
document.querySelectorAll('.dock button').forEach(b=>b.onclick=()=>b.dataset.abrir?mostrar(b.dataset.abrir):pedir(b.dataset.cmd));
const agora=()=>new Date().toLocaleTimeString('pt-BR');
msg(`[${agora()}] Inicializando ${cfg.nome}…`,'sys');
iniciarPainel(ctx).then(async m=>{
m.forEach(([n,[v,s]])=>msg(`[${agora()}] ${n.padEnd(10,'.')} ${v}${s?' ⚠':''}`,'sys'));
await aoAbrir();
msg(`[${agora()}] Pronto. ${estaAtivo()?'Pode falar ou digitar um comando.':'Toque em qualquer lugar para ativar a voz, ou digite um comando.'}`,'sys')});
