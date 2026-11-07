// Skill: cotação de cripto em BRL e USDT ("cotação do ethereum", "quanto está o solana", "bitcoin").
import {achar,NOMES,ticker,fmt} from '../lib/moedas.js';
const pct=p=>`${p>=0?'subiu':'caiu'} ${Math.abs(p).toFixed(1).replace('.',',')} por cento`;
export default{nome:'cotacao',
casa:t=>{const m=achar(t),c=/cota[cç][aã]o/i.test(t);return (m&&(c||/quanto (est[aá]|vale|custa)|pre[cç]o d/i.test(t)))||c||(m&&t.trim().split(/\s+/).length<=3)},
async rodar(t){const m=achar(t)||'BTC',[b,u]=await Promise.allSettled([ticker(m+'BRL'),ticker(m+'USDT')]),p=[];
if(b.status==='fulfilled')p.push(`${fmt(+b.value.lastPrice,'BRL')}, ${pct(+b.value.priceChangePercent)} em 24 horas`);
if(u.status==='fulfilled')p.push(`${fmt(+u.value.lastPrice,'USDT')}, ${pct(+u.value.priceChangePercent)}`);
return p.length?`${NOMES[m]}: ${p.join('. Em dólar digital, ')}. Não é recomendação.`:'Cotação indisponível agora.'}}
