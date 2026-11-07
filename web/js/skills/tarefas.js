// Skill: tarefas locais ("tarefa X", "concluir tarefa X", "pendências").
export default{nome:'tarefas',
casa:t=>/^(?:(?:nova |adicionar )?tarefa|concluir tarefa|finalizar tarefa)\s+.+/i.test(t)||/pend[eê]n/i.test(t),
rodar(t,c){const l=c.estado.tarefas=c.estado.tarefas||[];let m;
if(m=t.match(/^(?:concluir|finalizar) tarefa\s+(.+)/i)){const x=l.find(y=>!y.feita&&y.titulo.toLowerCase().includes(m[1].toLowerCase()));if(!x)return 'Não achei essa tarefa.';x.feita=true;c.salvar();return 'Concluída: '+x.titulo}
if(m=t.match(/^(?:nova |adicionar )?tarefa\s+(.+)/i)){l.push({titulo:m[1],feita:false});c.salvar();return 'Tarefa adicionada: '+m[1]}
const p=l.filter(x=>!x.feita);return p.length?p.length+(p.length>1?' pendências: ':' pendência: ')+p.slice(0,5).map(x=>x.titulo).join('; '):'Nenhuma pendência.'}}
