// Skill: saudação e briefing do dia. Usa as tarefas se existirem.
const hi=()=>{const h=new Date().getHours();return h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'};
export default{nome:'saudacao',
casa:t=>/^(oi|olá|ola|bom dia|boa tarde|boa noite|sauda)/i.test(t),
rodar(t,c){const p=(c.estado.tarefas||[]).filter(x=>!x.feita);
return `${hi()}, ${c.estado.nome||c.cfg.tratamento}. ${c.cfg.nome} online. Hoje é ${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}. `+(p.length?`Você tem ${p.length} pendência${p.length>1?'s':''}. A próxima é: ${p[0].titulo}.`:'Você não tem pendências.')+' Às suas ordens.'}}
