// JARVIS Voz — backend de referência (Cloudflare Worker). A chave da IA fica SÓ aqui.
// wrangler secret put ANTHROPIC_API_KEY ; wrangler secret put ACCESS_CODE
// Variáveis: ALLOWED_ORIGIN (ex.: https://seusite.com — várias separadas por vírgula), MODEL (opcional)
const BASE='Você é o JARVIS, assistente pessoal por voz. Responda em português do Brasil, sem markdown, listas ou emojis, pois a resposta será falada. Nunca peça nem repita chaves, senhas ou tokens. Você não executa ordens financeiras.';
// O cliente só escolhe o nome do modo; instruções e limites ficam aqui.
const MODOS={
conversa:{tokens:300,limite:1000,historico:true,sistema:' Use no máximo 2 frases curtas.'},
reflexao:{tokens:500,limite:4000,historico:false,sistema:' Faça uma reflexão cristã devocional sobre o texto bíblico recebido, em até 5 frases, ligando-o à vida diária e terminando com uma pergunta para o ouvinte meditar. Use só o texto fornecido; não invente versículos.'},
estudo:{tokens:900,limite:4000,historico:false,sistema:' Conduza um estudo bíblico falado, em até 8 frases corridas: contexto do livro e do trecho, ideia central, detalhes ou palavras importantes, ligação com outras passagens citando a referência, e uma aplicação prática. Seja fiel ao texto; quando houver leituras diferentes entre tradições cristãs, diga isso brevemente. Não invente versículos.'}};
export default{async fetch(req,env){
const origin=req.headers.get('Origin')||'',ok=(env.ALLOWED_ORIGIN||'').split(',').map(s=>s.trim()).includes(origin);
const cors={'Access-Control-Allow-Origin':ok?origin:'null','Access-Control-Allow-Headers':'Content-Type,X-Access-Code','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'};
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...cors,'Content-Type':'application/json'}});
if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
if(!ok)return J({error:'origem não permitida'},403);
if(req.method!=='POST')return J({error:'método'},405);
if(+req.headers.get('content-length')>20000)return J({error:'grande'},413);
if(!env.ACCESS_CODE||req.headers.get('X-Access-Code')!==env.ACCESS_CODE)return J({error:'acesso negado'},401);
const path=new URL(req.url).pathname;
if(path==='/api/ia/ping')return J({ok:true});
if(path!=='/api/ia/chat')return J({error:'rota'},404);
let b;try{b=await req.json()}catch{return J({error:'json'},400)}
const modo=Object.hasOwn(MODOS,b.modo)?MODOS[b.modo]:MODOS.conversa;
const msg=String(b.message||'').slice(0,modo.limite);if(!msg)return J({error:'vazio'},400);
let hist=modo.historico?(Array.isArray(b.history)?b.history:[]).slice(-6).filter(m=>(m.role==='user'||m.role==='assistant')&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,1000)})):[];
while(hist.length&&hist[0].role!=='user')hist.shift();
const ctx=b.context?' Contexto do usuário: '+JSON.stringify(b.context).slice(0,300):'';
const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model:env.MODEL||'claude-sonnet-5-5',max_tokens:modo.tokens,system:BASE+modo.sistema+ctx,messages:[...hist,{role:'user',content:msg}]})});
if(!r.ok)return J({error:'ia indisponível'},502);
const d=await r.json();
return J({reply:(d.content||[]).filter(c=>c.type==='text').map(c=>c.text).join(' ').trim()||'Sem resposta.'})}}
