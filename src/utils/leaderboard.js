/**
 * Leaderboard & Scoring Utilities for Synapse Gesture Arena
 * Manages local score persistence, rankings, and AI benchmark comparison.
 */

export const LEADERBOARD_STORAGE_KEY = "sga_leaderboard_v1";
export const AI_BENCHMARK_SCORE = 35;
export const DEFAULT_GAME_TIME = 40;
export const DEATH_MODE_THRESHOLD = 10;

export function getRankTitle(score) {
  if (score >= 50) return "AI SLAYER 😎";
  if (score >= 35) return "PRO PLAYER 🔥";
  if (score >= 20) return "ALMOST THERE 😏";
  return "TRY AGAIN 😂";
}

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScore(playerName, score) {
  const current = getLeaderboard();
  const entry = {
    name: (playerName && playerName.trim()) ? playerName.trim() : "Player",
    score: Math.max(0, Math.floor(score)),
    date: new Date().toISOString()
  };

  current.push(entry);
  current.sort((a, b) => b.score - a.score);
  const top5 = current.slice(0, 5);

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(top5));
  } catch {}

  const isHighScore = top5[0] && top5[0].name === entry.name && top5[0].score === entry.score && entry.score > 0;

  return {
    leaderboard: top5,
    isHighScore,
    beatAi: score > AI_BENCHMARK_SCORE,
    rankTitle: getRankTitle(score)
  };
}

export function clearLeaderboard() {
  try {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  } catch {}
}
