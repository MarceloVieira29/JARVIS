// Skill: Bíblia — leitura, versículo do dia, reflexão e estudo.
// Ex.: "leia salmo 23", "João 3 16", "versículo do dia", "reflexão do dia", "reflexão sobre Filipenses 4 6",
//      "estudo de Romanos 8 1 a 11", "estudo bíblico sobre perdão". Reflexão e estudo usam o backend de IA; sem ele, há um roteiro guiado.
import {referencia,passagem,doDia} from '../lib/biblia.js';
import {perguntarIA,ErroIA} from '../lib/ia.js';
const MAX_LER=15,MAX_IA=3500;
const PALAVRAS=/b[ií]blia|b[ií]blico|vers[ií]culo|devocional|reflex[aã]o|\bsalmos?\b/i;
const VERBO=/^(?:(?:leia|ler|leitura|abra|abrir|mostre|estud\w*|expliq\w*|explic\w*|reflexao|medit\w*)\b.*)?$/;
const modo=t=>/reflex|devocional|medit/i.test(t)?'reflexao':/estud|expli|contexto|significa/i.test(t)?'estudo':'leitura';
const PERGUNTAS=['O que este texto revela sobre Deus?','Que atitude este texto me convida a mudar hoje?','Que promessa ou consolo posso guardar daqui?','Como viver isso em uma situação concreta desta semana?'];
const corpo=p=>p.versos.map(v=>v.texto).join(' ');
export default{nome:'biblia',
casa:t=>{if(PALAVRAS.test(t))return true;const r=referencia(t);return !!r&&VERBO.test(r.antes)},
async rodar(t,c){const m=modo(t);let r=referencia(t);
if(!r&&m==='estudo'){const tema=t.replace(/.*?\b(sobre|de|do|da)\b/i,'').trim();
try{return await perguntarIA(c,{modo:'estudo',mensagem:`Estudo bíblico temático sobre: ${tema}. Indique as principais passagens pela referência.`})}catch(e){if(e instanceof ErroIA)return e.message+' Sem a IA, posso ler e estudar uma passagem: diga, por exemplo, estudo de Mateus 18 21 a 35.';throw e}}
r=r||doDia();
const p=await passagem(r);if(!p)return 'Não encontrei essa passagem. Diga, por exemplo: leia João 3 16.';
const texto=corpo(p);
if(m==='leitura'){if(p.versos.length<=MAX_LER)return `${p.referencia}. ${texto}`;
const parte=p.versos.slice(0,MAX_LER),ult=parte.at(-1).n;return `${p.referencia}, versículos ${parte[0].n} a ${ult}. ${parte.map(v=>v.texto).join(' ')} Para continuar, diga: ${p.referencia.replace(/:.*/,'')}, ${ult+1} a ${p.versos.at(-1).n}.`}
const pedido=m==='estudo'?`Estudo de ${p.referencia}`:`Reflexão sobre ${p.referencia}`;
try{const ia=await perguntarIA(c,{modo:m,mensagem:`${pedido}. Texto (Almeida): ${texto.slice(0,MAX_IA)}`});return `${p.referencia}. ${p.versos.length<=MAX_LER?texto+' ':''}${ia}`}
catch(e){if(!(e instanceof ErroIA))throw e;
const guia=m==='estudo'?'Para estudar: observe quem fala, para quem e em que situação; resuma a ideia central em uma frase; e anote uma aplicação para hoje.':'Para refletir: '+PERGUNTAS[new Date().getDate()%PERGUNTAS.length];
return `${p.referencia}. ${p.versos.length<=MAX_LER?texto+' ':''}${guia} ${e.message}`}}}
