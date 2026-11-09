// Harmonia — playlist da semana (mente, corpo e espírito). Edição nova: substitua EDICAO; skill e tela leem só daqui.
// Faixa: musica, artista e, se houver, link direto por serviço (spotify, youtube, deezer). Sem link direto, vira busca no serviço
// usando `busca` (ou "musica artista").
export const SERVICOS=['spotify','youtube','deezer'];
export const NOME_SERVICO={spotify:'Spotify',youtube:'YouTube',deezer:'Deezer'};
export function links(f){const q=encodeURIComponent(f.busca||`${f.musica} ${f.artista||''}`.trim());
return {spotify:f.spotify||`https://open.spotify.com/search/${q}`,youtube:f.youtube||`https://www.youtube.com/results?search_query=${q}`,deezer:f.deezer||`https://www.deezer.com/search/${q}`}}
export const servicoDaFrase=t=>/deezer/i.test(t)?'deezer':/youtube|you tube/i.test(t)?'youtube':/spotify/i.test(t)?'spotify':null;
export const EDICAO={numero:2,data:'2026-11-09',titulo:'Harmonia — Mente, Corpo e Espírito',
versiculo:{ref:'Filipenses 4 8',nome:'Filipenses 4:8'},
secoes:[
{id:'fe',titulo:'Fé, oração e adoração',momento:'Momento: 20 a 30 minutos pela manhã, antes de começar suas atividades.',faixas:[
{musica:'A Casa É Sua',artista:'Casa Worship',youtube:'https://www.youtube.com/watch?v=5QHF5OQeFOs'},
{musica:'Me Atraiu',artista:'Gabriela Rocha'},
{musica:'Ousado Amor',artista:'Isaías Saad',youtube:'https://www.youtube.com/watch?v=wSKKEAnLTDw'},
{musica:'É Tudo Sobre Você / Ser Mudado',artista:'MORADA',busca:'MORADA É Tudo Sobre Você Ser Mudado'}]},
{id:'estudo',titulo:'Trabalho e estudos — concentração',momento:'Momento: durante os estudos, a leitura e o desenvolvimento dos seus projetos.',faixas:[
{musica:'Cello Suite No. 1 — Prélude',artista:'Bach / Yo-Yo Ma',busca:'Bach Cello Suite No. 1 Prelude Yo-Yo Ma',spotify:'https://open.spotify.com/track/1WbfAfJrkvIPOBDi9h7Yo7'},
{musica:'Gnossienne No. 1',artista:'Erik Satie',spotify:'https://open.spotify.com/track/0LZNQF8LymynItVKYhGIDR'},
{musica:'Metamorphosis One',artista:'Philip Glass',spotify:'https://open.spotify.com/track/4G3iDZriNHuEZuS8704XGh'},
{musica:'Music for Airports 1/1',artista:'Brian Eno',spotify:'https://open.spotify.com/track/6mxl8wFfNY5I3DOank196M'}]},
{id:'mercado',titulo:'Mercado financeiro — foco e disciplina',momento:'Momento: durante análises de BTC/BRL e BTC/USDT, estudo de indicadores e planejamento financeiro.',
nota:'Prefira música instrumental, volume moderado, e não deixe a trilha interferir na leitura dos gráficos ou nas decisões.',faixas:[
{musica:'First Step',artista:'Hans Zimmer',spotify:'https://open.spotify.com/track/3z4YO2reZClHRs5zUxdT7w'},
{musica:'S.T.A.Y.',artista:'Hans Zimmer',spotify:'https://open.spotify.com/track/4qn7D0RGh24ayuoYqF1gts'},
{musica:'Open Eye Signal',artista:'Jon Hopkins',spotify:'https://open.spotify.com/track/6MnQk7U2MDakPqKCVHkl8U'},
{musica:'A Walk',artista:'Tycho'}]},
{id:'relax',titulo:'Relaxamento — 432 Hz e 528 Hz',momento:'Momento: pausas ao longo do dia para desacelerar.',
nota:'432 Hz e 528 Hz são rótulos de afinação usados nessas gravações; não há evidência robusta de efeitos especiais de cura ou prosperidade.',faixas:[
{musica:'432 Hz — piano e ambiente',artista:'',busca:'432hz piano relaxante'},
{musica:'528 Hz — ambient instrumental',artista:'',busca:'528hz ambient instrumental'},
{musica:'Água corrente e floresta',artista:'Sons da natureza',busca:'sons de rio floresta relaxamento'}]},
{id:'noite',titulo:'Noite — desacelerar e dormir',momento:'Momento: 30 minutos antes de dormir, com volume baixo e luz reduzida.',faixas:[
{musica:'Dream 3 (in the midst of my life)',artista:'Max Richter',spotify:'https://open.spotify.com/track/0Ig408dKxAqFX84CdABkwk'},
{musica:'Ambre',artista:'Nils Frahm',spotify:'https://open.spotify.com/track/71BqXMUdoiYHohiDlMihIR'},
{musica:'An Ending (Ascent)',artista:'Brian Eno',spotify:'https://open.spotify.com/track/7a33FEffdtLLRQJ5gRW6nQ'},
{musica:'Chuva suave na floresta',artista:'Sons da natureza',busca:'chuva suave floresta sons para dormir'}]}]};
