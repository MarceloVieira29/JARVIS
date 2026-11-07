// Skill: respostas livres via backend (Worker). Fica por último: "casa" com tudo.
import {perguntarIA,ErroIA} from '../lib/ia.js';
const hist=[];
export default{nome:'ia',casa:()=>true,
async rodar(t,c){try{const reply=await perguntarIA(c,{mensagem:t,historico:hist.slice(-7)});hist.push({role:'user',content:t},{role:'assistant',content:reply});return reply}
catch(e){if(e instanceof ErroIA)return e.message;throw e}}}
