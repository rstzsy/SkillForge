export function calculateFluencyFromAudio(features) {
  const speechRate = features?.speechrate || 0;
  const pauseRatio = features?.pauseratio || 0;

  let score = 7;

  if (speechRate < 90) score -= 1;
  if (speechRate > 180) score -= 1;
  if (pauseRatio > 0.35) score -= 1;

  return Math.max(4, Math.min(9, score));
}
