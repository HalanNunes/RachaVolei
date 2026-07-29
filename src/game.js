/** Embaralha sem alterar a lista original (Fisher–Yates). */
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

/** Distribui alternadamente para que a diferença entre os times seja no máximo 1. */
export function drawTeams(players, random = Math.random) {
  const mixed = shuffle(players, random);
  return {
    teamA: mixed.filter((_, index) => index % 2 === 0),
    teamB: mixed.filter((_, index) => index % 2 === 1),
  };
}

export function setTarget(setIndex, totalSets) {
  return totalSets > 1 && setIndex === totalSets - 1 ? 15 : 25;
}

/** Retorna o vencedor apenas com a meta atingida e dois pontos de vantagem. */
export function setWinner(scoreA, scoreB, target) {
  if (Math.max(scoreA, scoreB) < target || Math.abs(scoreA - scoreB) < 2) return null;
  return scoreA > scoreB ? 'A' : 'B';
}

export function setsToWin(totalSets) {
  return Math.floor(totalSets / 2) + 1;
}
