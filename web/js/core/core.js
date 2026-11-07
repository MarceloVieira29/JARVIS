// Núcleo: carrega só as skills listadas no config e despacha o comando para a primeira que "casar".
import cfg from '../config.js';
const skills=[];
export async function carregarSkills(){for(const n of cfg.skills){try{skills.push((await import(`../skills/${n}.js`)).default)}catch(e){console.warn('Skill não carregada:',n,e)}}}
export function iniciarSkills(ctx){skills.forEach(s=>{try{s.iniciar&&s.iniciar(ctx)}catch(e){console.error(s.nome,e)}})}
export function rotear(texto,ctx){for(const s of skills){let m;try{m=s.casa(texto,ctx)}catch{continue}if(m)return {skill:s,m}}return null}
export async function executar(texto,ctx){const r=rotear(texto,ctx);if(!r)return 'Não entendi esse comando.';
try{return await r.skill.rodar(texto,ctx,r.m)}catch(e){console.error(r.skill.nome,e);return 'Houve uma falha nessa habilidade.'}}
