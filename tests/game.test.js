import test from 'node:test';
import assert from 'node:assert/strict';
import { drawTeams, setTarget, setWinner, setsToWin } from '../src/game.js';

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
