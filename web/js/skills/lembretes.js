// Skill: lembretes falados. Ex.: "me lembre em 10 minutos de tomar água", "lembrete às 15:30 reunião", "lembretes", "cancelar lembretes".
// Limite: só dispara com a página aberta (navegador pode pausar abas em segundo plano). Máximo de 24 h à frente.
const timers=new Map(),MAX=24*36e5,U={segundo:1e3,minuto:6e4,hora:36e5};
const quando=m=>new Date(m).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
function agendar(c,l){const ms=l.quando-Date.now();if(ms<=0)return disparar(c,l,true);timers.set(l.id,setTimeout(()=>disparar(c,l),ms))}
function disparar(c,l,atrasado){timers.delete(l.id);c.estado.lembretes=(c.estado.lembretes||[]).filter(x=>x.id!==l.id);c.salvar();
const t=(atrasado?'Lembrete atrasado: ':'Lembrete: ')+l.texto;c.dizer(t);try{if(Notification.permission==='granted')new Notification('JARVIS',{body:l.texto})}catch{}}
export default{nome:'lembretes',
casa:t=>/^(?:me\s+)?(?:lembre|lembrar|lembrete)/i.test(t)||/^(?:meus |quais )?lembretes|^(?:cancelar|apagar) lembretes/i.test(t),
iniciar(c){(c.estado.lembretes||[]).slice().forEach(l=>agendar(c,l))},
rodar(t,c){const L=c.estado.lembretes=c.estado.lembretes||[];let m;
if(/^(?:cancelar|apagar) lembretes/i.test(t)){L.forEach(l=>clearTimeout(timers.get(l.id)));L.length=0;c.salvar();return 'Lembretes cancelados.'}
if(/^(?:meus |quais )?lembretes\s*$/i.test(t))return L.length?L.length+' lembrete(s): '+L.map(l=>`${l.texto} às ${quando(l.quando)}`).join('; '):'Nenhum lembrete agendado.';
let alvo,texto;
if(m=t.match(/^(?:me\s+)?(?:lembre|lembrar|lembrete)(?:\s+de)?\s+(?:em|daqui a)\s+(\d+)\s*(segundo|minuto|hora)s?\s*(?:de|para|que)?\s*(.+)/i)){alvo=Date.now()+(+m[1])*U[m[2].toLowerCase()];texto=m[3]}
else if(m=t.match(/^(?:me\s+)?(?:lembre|lembrar|lembrete)(?:\s+de)?\s+(?:às|as)\s+(\d{1,2})(?:[:h\s](\d{2}))?\s*(?:horas?)?\s*(?:de|para|que)?\s*(.+)/i)){const d=new Date();d.setHours(+m[1],+(m[2]||0),0,0);if(d<=Date.now())d.setDate(d.getDate()+1);alvo=+d;texto=m[3]}
else return 'Diga, por exemplo: me lembre em 10 minutos de tomar água, ou lembrete às 15:30 reunião.';
if(alvo-Date.now()>MAX)return 'Posso agendar até 24 horas à frente.';
const l={id:Date.now(),texto:texto.trim(),quando:alvo};L.push(l);c.salvar();agendar(c,l);
try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch{}
return `Combinado. Lembro você às ${quando(alvo)}: ${l.texto}.`}}
