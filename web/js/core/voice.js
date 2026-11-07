// Voz: fala (speechSynthesis) e escuta (SpeechRecognition). Não conhece skills nem backend.
import cfg from '../config.js';
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const ERROS={'not-allowed':'Microfone bloqueado. Clique no cadeado ao lado do endereço e permita o microfone.','service-not-allowed':'Reconhecimento de voz bloqueado pelo navegador.','audio-capture':'Nenhum microfone encontrado.','network':'Reconhecimento de voz precisa de internet.'};
let rec,ativo=false,falando=false,fim=0,ultima='',ui=()=>{},escolhida='';
export const suportaVoz=!!SR,estaAtivo=()=>ativo,onEstado=f=>ui=f,setVoz=n=>escolhida=n;
export const listarVozes=()=>('speechSynthesis' in window?speechSynthesis.getVoices():[]).filter(v=>/^pt/i.test(v.lang));
export async function autorizarMicrofone(){if(!navigator.mediaDevices?.getUserMedia)return true;
try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());return true}catch(e){ui(e.name==='NotFoundError'?ERROS['audio-capture']:ERROS['not-allowed']);return false}}
function escolher(){const vs=listarVozes(),p=cfg.voz.preferidas,pref=v=>p.some(x=>v.name.toLowerCase().includes(x));
return vs.find(v=>v.name===escolhida)||vs.find(v=>pref(v)&&/natural|online/i.test(v.name))||vs.find(pref)||vs.find(v=>/pt-BR/i.test(v.lang))||vs[0]}
export function falar(t){if(!('speechSynthesis' in window))return;speechSynthesis.cancel();ultima=norm(t);const u=new SpeechSynthesisUtterance(t);u.lang=cfg.idioma;const v=escolher();if(v)u.voice=v;u.pitch=cfg.voz.tom;u.rate=cfg.voz.velocidade;
u.onstart=()=>{falando=true;ui('Falando…')};u.onend=u.onerror=()=>{falando=false;fim=Date.now();ui(ativo?'Ouvindo…':'Pronto')};speechSynthesis.speak(u)}
export function ouvir(aoTexto,aoParcial=()=>{}){ativo=true;rec=new SR();rec.lang=cfg.idioma;rec.continuous=true;rec.interimResults=true;
rec.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i],t=r[0].transcript.trim(),n=norm(t);
if(falando){if(/\b(pare|chega|silencio|cala)\b/.test(n)&&!ultima.includes(n))speechSynthesis.cancel();continue}
if(Date.now()-fim<900||(n&&ultima.includes(n)))continue; // ignora eco da própria fala
r.isFinal?aoTexto(t):aoParcial(t)}};
rec.onend=()=>{if(ativo)try{rec.start()}catch{}};
rec.onerror=e=>{if(ERROS[e.error]){if(e.error!=='network')ativo=false;ui(ERROS[e.error])}};rec.start();ui('Ouvindo…')}
export function parar(){ativo=false;rec&&rec.stop();if('speechSynthesis' in window)speechSynthesis.cancel();ui('Desativado')}
