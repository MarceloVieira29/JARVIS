// Bíblia em português (Almeida) via bible-api.com, somente leitura. Entende referências faladas: "João 3 16", "salmo 23", "primeira Coríntios 13 4 a 7".
const LIVROS={GEN:['genesis'],EXO:['exodo'],LEV:['levitico'],NUM:['numeros'],DEU:['deuteronomio'],JOS:['josue'],JDG:['juizes'],RUT:['rute'],
'1SA':['1 samuel'],'2SA':['2 samuel'],'1KI':['1 reis'],'2KI':['2 reis'],'1CH':['1 cronicas'],'2CH':['2 cronicas'],EZR:['esdras'],NEH:['neemias'],EST:['ester'],JOB:['jo'],
PSA:['salmos','salmo'],PRO:['proverbios'],ECC:['eclesiastes'],SNG:['cantico dos canticos','canticos','cantares'],ISA:['isaias'],JER:['jeremias'],LAM:['lamentacoes'],EZK:['ezequiel'],DAN:['daniel'],
HOS:['oseias'],JOL:['joel'],AMO:['amos'],OBA:['obadias'],JON:['jonas'],MIC:['miqueias'],NAM:['naum'],HAB:['habacuque'],ZEP:['sofonias'],HAG:['ageu'],ZEC:['zacarias'],MAL:['malaquias'],
MAT:['mateus'],MRK:['marcos'],LUK:['lucas'],JHN:['joao'],ACT:['atos'],ROM:['romanos'],'1CO':['1 corintios'],'2CO':['2 corintios'],GAL:['galatas'],EPH:['efesios'],PHP:['filipenses'],COL:['colossenses'],
'1TH':['1 tessalonicenses'],'2TH':['2 tessalonicenses'],'1TI':['1 timoteo'],'2TI':['2 timoteo'],TIT:['tito'],PHM:['filemom','filemon'],HEB:['hebreus'],JAS:['tiago'],
'1PE':['1 pedro'],'2PE':['2 pedro'],'1JN':['1 joao'],'2JN':['2 joao'],'3JN':['3 joao'],JUD:['judas'],REV:['apocalipse']};
const ALIAS=Object.entries(LIVROS).flatMap(([id,ns])=>ns.map(n=>[n,id])).sort((a,b)=>b[0].length-a[0].length);
const POR_ALIAS=Object.fromEntries(ALIAS);
const RE=new RegExp('(?:^|\\s)('+ALIAS.map(a=>a[0]).join('|')+')\\s+(\\d{1,3})(?:\\s*[:.,]?\\s*(\\d{1,3})(?:\\s*(?:-|a|ao|ate)\\s*(\\d{1,3}))?)?(?!\\d)');
export const normalizar=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
.replace(/\b(primeir[oa]|i)\s+(?=[a-z])/g,'1 ').replace(/\b(segund[oa]|ii)\s+(?=[a-z])/g,'2 ').replace(/\b(terceir[oa]|iii)\s+(?=[a-z])/g,'3 ')
.replace(/\b(capitulo|cap|versiculos?|vers)\b/g,' ').replace(/[^a-z0-9:\- ]/g,' ').replace(/\s+/g,' ').trim();
export function referencia(texto){const n=normalizar(texto),m=n.match(RE);if(!m)return null;
const [,alias,cap,v1,v2]=m;return {id:POR_ALIAS[alias],cap:+cap,v1:v1?+v1:null,v2:v2?+v2:null,antes:n.slice(0,m.index).trim()}}
export const textoRef=r=>`${r.id} ${r.cap}${r.v1?':'+r.v1+(r.v2?'-'+r.v2:''):''}`;
export async function passagem(r){const res=await fetch('https://bible-api.com/'+encodeURIComponent(textoRef(r))+'?translation=almeida');
if(res.status===404)return null;if(!res.ok)throw new Error('HTTP '+res.status);const j=await res.json();
return {referencia:j.reference,versos:j.verses.map(v=>({n:v.verse,texto:v.text.replace(/\s+/g,' ').trim()}))}}
// Versículo do dia: lista fixa, um por dia do ano.
const DO_DIA=['PSA 23:1-3','JHN 3:16','PHP 4:13','ROM 8:28','JER 29:11','ISA 41:10','PRO 3:5-6','MAT 11:28-30','PSA 46:1','JOS 1:9','2TI 1:7','1CO 13:4-7','PSA 121:1-2','MAT 6:33','ROM 12:2',
'GAL 5:22-23','HEB 11:1','PSA 37:5','LAM 3:22-23','ISA 40:31','JHN 14:27','1PE 5:7','MIC 6:8','PSA 119:105','EPH 2:8-9','COL 3:23','JAS 1:5','PRO 16:3','PSA 91:1-2','MAT 5:14-16','JHN 15:5',
'ROM 5:8','PSA 27:1','ISA 26:3','1JN 4:18','PHP 4:6-7','PSA 139:13-14','MAT 7:7','2CO 5:17','ECC 3:1'];
export function doDia(d=new Date()){const dia=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5),[id,cv]=DO_DIA[dia%DO_DIA.length].split(' '),[cap,vs]=cv.split(':'),[v1,v2]=vs.split('-');
return {id,cap:+cap,v1:+v1,v2:v2?+v2:null}}
