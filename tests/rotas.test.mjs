import {test, before} from 'node:test';
import assert from 'node:assert/strict';
import {carregarSkills, rotear} from '../web/js/core/core.js';

before(() => carregarSkills());

const casos = [
  ['bom dia', 'saudacao'],
  ['oi', 'saudacao'],
  ['me lembre em 10 minutos de tomar água', 'lembretes'],
  ['lembrete às 15:30 reunião', 'lembretes'],
  ['cancelar lembretes', 'lembretes'],
  ['avise quando o bitcoin passar de 400 mil', 'alertas'],
  ['alerta quando eth cair abaixo de 15000 dólares', 'alertas'],
  ['alertas', 'alertas'],
  ['tarefa comprar pão', 'tarefas'],
  ['concluir tarefa comprar', 'tarefas'],
  ['pendências', 'tarefas'],
  ['cotação do ethereum', 'cotacao'],
  ['quanto está o solana', 'cotacao'],
  ['bitcoin', 'cotacao'],
  ['cotação do usdt', 'cotacao'],
  ['avise quando o usdt passar de 6', 'alertas'],
  ['previsão do tempo', 'clima'],
  ['vai chover amanhã em Curitiba', 'clima'],
  ['temperatura agora', 'clima'],
  ['como está o tempo no Rio de Janeiro', 'clima'],
  ['minha cidade é Campinas', 'clima'],
  ['leia salmo 23', 'biblia'],
  ['João 3:16', 'biblia'],
  ['primeira Coríntios 13 4 a 7', 'biblia'],
  ['versículo do dia', 'biblia'],
  ['reflexão do dia', 'biblia'],
  ['estudo de Romanos 8', 'biblia'],
  ['estudo bíblico sobre perdão', 'biblia'],
  ['explique Mateus 5 3', 'biblia'],
  ['o que você acha do bitcoin hoje em dia', 'ia'],
  ['qual a capital da frança', 'ia'],
  ['mercado financeiro', 'ia'],
  ['ligar para o Lucas 3 vezes', 'ia'],
];

for (const [frase, esperado] of casos) {
  test(`"${frase}" vai para ${esperado}`, () => {
    assert.equal(rotear(frase, {})?.skill.nome, esperado);
  });
}
