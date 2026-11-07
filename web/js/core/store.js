const K='jarvis';
export const state=(()=>{try{return JSON.parse(localStorage.getItem(K))||{}}catch{return {}}})();
export const save=()=>{try{localStorage.setItem(K,JSON.stringify(state))}catch{}};
export const code=()=>sessionStorage.getItem('jarvis_code')||'';
export const setCode=v=>sessionStorage.setItem('jarvis_code',v);
