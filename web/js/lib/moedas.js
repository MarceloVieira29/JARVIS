// Utilitários compartilhados pelas skills de cripto (Binance pública, somente leitura).
export const MOEDAS={bitcoin:'BTC',btc:'BTC',ethereum:'ETH',eth:'ETH',solana:'SOL',xrp:'XRP',ripple:'XRP',bnb:'BNB',cardano:'ADA',dogecoin:'DOGE',doge:'DOGE',litecoin:'LTC',ltc:'LTC',usdt:'USDT',tether:'USDT'};
export const NOMES={BTC:'Bitcoin',ETH:'Ethereum',SOL:'Solana',XRP:'XRP',BNB:'BNB',ADA:'Cardano',DOGE:'Dogecoin',LTC:'Litecoin',USDT:'USDT'};
export const achar=t=>{const m=t.toLowerCase().match(new RegExp('\\b('+Object.keys(MOEDAS).join('|')+')\\b'));return m?MOEDAS[m[1]]:null};
const get=u=>fetch(u).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()});
export const ticker=s=>get('https://api.binance.com/api/v3/ticker/24hr?symbol='+s);
export const velas=(s,intervalo='1h',n=24)=>get(`https://api.binance.com/api/v3/klines?symbol=${s}&interval=${intervalo}&limit=${n}`)
.then(a=>a.map(k=>({t:k[0],o:+k[1],h:+k[2],l:+k[3],c:+k[4]})));
export const preco=async s=>+(await get('https://api.binance.com/api/v3/ticker/price?symbol='+s)).price;
export const fmt=(v,par)=>v.toLocaleString('pt-BR',par==='BRL'?{style:'currency',currency:'BRL',maximumFractionDigits:v<10?2:0}:{maximumFractionDigits:v<10?4:0})+(par==='USDT'?' USDT':'');
export function valor(s){s=s.toLowerCase();const mil=/\bmil\b/.test(s);let n=s.replace(/[^\d.,]/g,'');n=/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(n)?n.replace(/\./g,'').replace(',','.'):n.replace(',','.');const v=parseFloat(n);return isNaN(v)?null:mil?v*1e3:v}
