import test from 'node:test';
import assert from 'node:assert/strict';
import { drawTeams, removePlayerFromTeams, setTarget, setWinner, setsToWin, transferPlayer } from '../src/game.js';

test('distribui todos os jogadores em times equilibrados', () => {
  const players = Array.from({ length: 11 }, (_, id) => ({ id }));
  const result = drawTeams(players, () => 0.5);
  assert.equal(result.teamA.length + result.teamB.length, 11);
  assert.ok(Math.abs(result.teamA.length - result.teamB.length) <= 1);
  assert.equal(new Set([...result.teamA, ...result.teamB]).size, 11);
});

test('set normal vai a 25 e tie-break vai a 15', () => {
  assert.equal(setTarget(0, 5), 25);
  assert.equal(setTarget(4, 5), 15);
  assert.equal(setTarget(0, 1), 25);
});

test('exige dois pontos de vantagem', () => {
  assert.equal(setWinner(25, 24, 25), null);
  assert.equal(setWinner(26, 24, 25), 'A');
  assert.equal(setWinner(14, 16, 15), 'B');
});

test('calcula sets necessários para vencer cada formato', () => {
  assert.equal(setsToWin(1), 1);
  assert.equal(setsToWin(3), 2);
  assert.equal(setsToWin(5), 3);
});

test('remove jogador sem colocar outra pessoa no lugar', () => {
  const teams = { teamA: [{ id: '1' }, { id: '2' }], teamB: [{ id: '3' }, { id: '4' }] };
  const result = removePlayerFromTeams(teams, '2');
  assert.deepEqual(result.teamA, [{ id: '1' }]);
  assert.deepEqual(result.teamB, teams.teamB);
  assert.equal(result.teamA.length + result.teamB.length, 3);
});

test('transfere jogador entre times sem duplicar', () => {
  const teams = { teamA: [{ id: '1' }, { id: '2' }], teamB: [{ id: '3' }] };
  const result = transferPlayer(teams, '2', 'A');
  assert.deepEqual(result.teamA, [{ id: '1' }]);
  assert.deepEqual(result.teamB, [{ id: '3' }, { id: '2' }]);
});

test('ignora transferência com time de origem inválido', () => {
  const teams = { teamA: [{ id: '1' }], teamB: [{ id: '2' }] };
  assert.equal(transferPlayer(teams, '1', 'C'), teams);
});
