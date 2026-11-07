// Cliente do backend de IA (Worker). Usado pela skill 'ia' e por skills que pedem texto gerado (ex.: biblia).
export class ErroIA extends Error{}
const local=u=>/\/\/(localhost|127\.0\.0\.1)\b/.test(u);
export async function perguntarIA(c,{mensagem,modo='conversa',historico=[]}){
const url=c.backend();if(!url)throw new ErroIA('Para respostas da IA, informe a URL do backend nas configurações.');
let r;try{r=await fetch(url.replace(/\/$/,'')+'/api/ia/chat',{method:'POST',headers:{'Content-Type':'application/json','X-Access-Code':c.codigo()},body:JSON.stringify({message:mensagem,modo,history:historico,context:{nome:c.estado.nome||''}})})}
catch{throw new ErroIA(local(url)?'O servidor de IA local está desligado. Crie o arquivo worker/.dev.vars e rode o JARVIS local de novo.':'O servidor de IA não respondeu. Confira a URL nas configurações.')}
if(r.status===401)throw new ErroIA('Código de acesso inválido. Digite o código nas configurações.');
if(r.status===403)throw new ErroIA('Este endereço não está autorizado no servidor de IA.');
if(!r.ok)throw new ErroIA('O servidor de IA falhou, código '+r.status+'.');
return (await r.json()).reply}
