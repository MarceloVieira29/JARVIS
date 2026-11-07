// Skill: previsão do tempo (Open-Meteo, grátis e sem chave). Ex.: "previsão do tempo", "vai chover amanhã em Curitiba", "clima em Recife", "minha cidade é Campinas".
// Local: cidade dita na frase > cidade salva > localização do navegador > cfg.cidadePadrao.
import {descrever,geocodificar,aqui,previsao} from '../lib/clima.js';
const TEMPOS=/(?<![\wÀ-ÿ])(hoje|agora|depois de amanh[aã]|amanh[aã]|ess[ae] semana|nesta semana|pr[oó]ximos dias)(?![\wÀ-ÿ])/gi; // \b não reconhece letras acentuadas
export function cidadeDaFrase(t){const s=t.replace(/[?.!]/g,'').replace(TEMPOS,' ').replace(/\s+/g,' ').trim();
const m=s.match(/minha cidade [eé]\s+(.+)$/i)||s.match(/\b(?:em|para|no|na)\s+([A-Za-zÀ-ÿ'\- ]{2,}?)\s*$/i);return m?m[1].trim():null}
export function diasPedidos(t){return /depois de amanh/i.test(t)?[2]:/amanh/i.test(t)?[1]:/semana|pr[oó]ximos dias/i.test(t)?[0,1,2]:[0]}
const NOMES_DIA=['Hoje','Amanhã','Depois de amanhã'],g=v=>Math.round(v);
export default{nome:'clima',
casa:t=>/previs[aã]o do tempo|\bclima\b|vai chover|\bchuva\b|\btemperatura\b|como (est[aá]|vai estar|fica) o tempo|^tempo\b|minha cidade [eé]/i.test(t),
async rodar(t,c){const pedida=cidadeDaFrase(t);let lugar;
if(pedida){lugar=await geocodificar(pedida);if(!lugar)return `Não encontrei a cidade ${pedida}.`;
if(/minha cidade/i.test(t)||!c.estado.cidade){c.estado.cidade=lugar;c.salvar()}if(/minha cidade/i.test(t))return `Combinado. Sua cidade agora é ${lugar.nome}.`}
lugar=lugar||c.estado.cidade||await aqui()||await geocodificar(c.cfg.cidadePadrao);if(!lugar)return 'Não consegui descobrir sua cidade. Diga, por exemplo: minha cidade é Curitiba.';
const p=await previsao(lugar),dias=diasPedidos(t),d=p.daily,partes=[];
if(dias[0]===0&&dias.length===1)partes.push(`Agora em ${lugar.nome}: ${g(p.current.temperature_2m)} graus, ${descrever(p.current.weather_code)}, sensação de ${g(p.current.apparent_temperature)}.`);
for(const i of dias)partes.push(`${NOMES_DIA[i]}${dias.length===1&&i>0?' em '+lugar.nome:''}: ${descrever(d.weather_code[i])}, mínima de ${g(d.temperature_2m_min[i])} e máxima de ${g(d.temperature_2m_max[i])}, ${d.precipitation_probability_max[i]??0} por cento de chance de chuva.`);
if(dias.length>1)partes.unshift(`Previsão para ${lugar.nome}.`);
return partes.join(' ')}}
