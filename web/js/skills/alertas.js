// Skill: alerta de preço por voz. Ex.: "avise quando o bitcoin passar de 400 mil", "alerta quando eth cair abaixo de 15000 dólares", "alertas", "cancelar alertas".
// Verifica a cada 1 min com a página aberta. Somente leitura (nenhuma ordem é enviada).
import {achar,NOMES,preco,fmt,valor} from '../lib/moedas.js';
const MAX=5;
async function verificar(c){const A=c.estado.alertas||[];if(!A.length)return;
for(const a of A.slice()){try{const p=await preco(a.moeda+a.par);if(a.dir==='acima'?p>=a.valor:p<=a.valor){
c.estado.alertas=c.estado.alertas.filter(x=>x.id!==a.id);c.salvar();
const t=`Alerta: ${NOMES[a.moeda]} ${a.dir==='acima'?'passou de':'caiu abaixo de'} ${fmt(a.valor,a.par)}. Agora está em ${fmt(p,a.par)}.`;c.dizer(t);
try{if(Notification.permission==='granted')new Notification('JARVIS',{body:t})}catch{}}}catch{}}}
export default{nome:'alertas',
casa:t=>/^(?:me\s+)?(?:avis[ae]|alerta)/i.test(t)||/^(?:meus )?alertas\s*$/i.test(t)||/^(?:cancelar|apagar) alertas/i.test(t),
iniciar(c){setInterval(()=>verificar(c),6e4);verificar(c)},
async rodar(t,c){const A=c.estado.alertas=c.estado.alertas||[];
if(/^(?:cancelar|apagar) alertas/i.test(t)){A.length=0;c.salvar();return 'Alertas cancelados.'}
if(/^(?:meus )?alertas\s*$/i.test(t))return A.length?A.length+' alerta(s): '+A.map(a=>`${NOMES[a.moeda]} ${a.dir} de ${fmt(a.valor,a.par)}`).join('; '):'Nenhum alerta ativo.';
const moeda=achar(t),n=t.match(/\d[\d.,]*(?:\s*mil)?/),v=n&&valor(n[0]);
if(!moeda||!v)return 'Diga, por exemplo: avise quando o bitcoin passar de 400 mil, ou alerta quando eth cair abaixo de 15000.';
if(A.length>=MAX)return `Limite de ${MAX} alertas. Cancele alguns primeiro.`;
const dir=/abaixo|cair|cai\b|menos|menor|baix/i.test(t)?'abaixo':'acima',par=moeda!=='USDT'&&/d[oó]lar|usdt|usd/i.test(t)?'USDT':'BRL'; // USDT só tem par em reais
try{const p=await preco(moeda+par);if(dir==='acima'?p>=v:p<=v)return `${NOMES[moeda]} já está ${dir} desse valor: ${fmt(p,par)}.`}catch{return 'Não consegui consultar o preço agora. Tente de novo.'}
A.push({id:Date.now(),moeda,dir,valor:v,par});c.salvar();
try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch{}
return `Combinado. Aviso quando o ${NOMES[moeda]} ficar ${dir} de ${fmt(v,par)}. Verifico a cada minuto, com a página aberta.`}}
