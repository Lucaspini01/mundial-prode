export function calculatePoints(
  homeScore: number,
  awayScore: number,
  predHome: number,
  predAway: number
): number {
  const realWinner = homeScore > awayScore ? "H" : awayScore > homeScore ? "A" : "D";
  const predWinner = predHome > predAway ? "H" : predAway > predHome ? "A" : "D";

  if (realWinner !== predWinner) return 0;

  if (predHome === homeScore && predAway === awayScore) return 10;
  if (homeScore - awayScore === predHome - predAway) return 7;
  return 5;
}
