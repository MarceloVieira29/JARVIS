// ÚNICO arquivo que você edita para mudar o que o JARVIS faz. Nada aqui é segredo.
export default{
  nome:'JARVIS', idioma:'pt-BR', tratamento:'senhor',        // tratamento é usado quando não há nome salvo
  palavrasChave:['jarvis','jarvi','jarves','jarvez','jarbas','jarvas','jervis'], // variações que o reconhecimento de voz costuma gerar
  exigirPalavraChave:true,
  backendUrl:/^(localhost|127\.0\.0\.1)$/.test(globalThis.location?.hostname||'')?'http://localhost:8787':'', // local: Worker do wrangler dev; publicado: defina na tela
  voz:{preferidas:['antonio','daniel','felipe','ricardo'],tom:0.8,velocidade:0.92}, // estilo calmo, grave e formal; escolha a voz final em ⚙ Configurações
  cidadePadrao:'São Paulo',                                   // previsão do tempo quando não há cidade salva nem localização
  skills:['saudacao','lembretes','alertas','tarefas','cotacao','clima','biblia','ia'] // ordem = prioridade; 'ia' (responde tudo) por último
};
