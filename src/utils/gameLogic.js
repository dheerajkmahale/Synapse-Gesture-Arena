/**
 * Core Game Mechanics and Rules for Synapse Gesture Arena
 *
 * Mappings:
 * - Open Palm -> Paper
 * - Fist -> Rock
 * - Pointing / Scissors -> Scissors
 *
 * Scoring Rules:
 * - Win:  +10 points
 * - Draw: +3 points
 * - Loss: +0 points
 */

export const MOVES = {
  ROCK: "Rock",
  PAPER: "Paper",
  SCISSORS: "Scissors"
};

export const GESTURE_TO_MOVE = {
  "Open Palm": MOVES.PAPER,
  "Fist": MOVES.ROCK,
  "Point": MOVES.SCISSORS,
  "Scissors": MOVES.SCISSORS
};

export const MOVE_DESCRIPTIONS = {
  [MOVES.ROCK]: "Fist (Rock) crushes Scissors",
  [MOVES.PAPER]: "Open Palm (Paper) covers Rock",
  [MOVES.SCISSORS]: "Pointing (Scissors) cuts Paper"
};

export const MOVE_ICONS = {
  [MOVES.ROCK]: "✊",
  [MOVES.PAPER]: "✋",
  [MOVES.SCISSORS]: "✌️"
};

/**
 * Returns a random move for the AI opponent.
 */
export function getAiMove() {
  const choices = [MOVES.ROCK, MOVES.PAPER, MOVES.SCISSORS];
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

/**
 * Resolves a Rock-Paper-Scissors round.
 *
 * @param {string} playerMove - "Rock" | "Paper" | "Scissors"
 * @param {string} aiMove - "Rock" | "Paper" | "Scissors"
 * @returns {object} { outcome: "WIN" | "DRAW" | "LOSS", playerPoints: number, aiPoints: number, headline: string, detail: string }
 */
export function resolveRound(playerMove, aiMove) {
  if (!playerMove || !aiMove) {
    throw new Error("Both player and AI moves are required to resolve a round");
  }

  // Draw condition
  if (playerMove === aiMove) {
    return {
      outcome: "DRAW",
      playerPoints: 3,
      aiPoints: 3,
      headline: "SYNCHRONIZED DUEL! DRAW",
      detail: `Both selected ${playerMove}. Neutral clash (+3 pts each).`,
      winner: null
    };
  }

  // Player Win conditions
  const isPlayerWin =
    (playerMove === MOVES.ROCK && aiMove === MOVES.SCISSORS) ||
    (playerMove === MOVES.PAPER && aiMove === MOVES.ROCK) ||
    (playerMove === MOVES.SCISSORS && aiMove === MOVES.PAPER);

  if (isPlayerWin) {
    let detail = "";
    if (playerMove === MOVES.ROCK) detail = "Your Fist (Rock) smashed AI's Scissors!";
    else if (playerMove === MOVES.PAPER) detail = "Your Open Palm (Paper) covered AI's Rock!";
    else detail = "Your Point/Scissors cut AI's Paper!";

    return {
      outcome: "WIN",
      playerPoints: 10,
      aiPoints: 0,
      headline: "VICTORY! YOU BEAT THE AI",
      detail: `${detail} (+10 pts)`,
      winner: "player"
    };
  }

  // AI Win conditions
  let aiDetail = "";
  if (aiMove === MOVES.ROCK) aiDetail = "AI's Fist (Rock) smashed your Scissors!";
  else if (aiMove === MOVES.PAPER) aiDetail = "AI's Open Palm (Paper) covered your Rock!";
  else aiDetail = "AI's Point/Scissors cut your Paper!";

  return {
    outcome: "LOSS",
    playerPoints: 0,
    aiPoints: 10,
    headline: "AI COUNTERED! ROUND LOST",
    detail: `${aiDetail} (+10 pts to AI)`,
    winner: "ai"
  };
}

/**
 * Validates player name and provides fallback.
 */
export function sanitizePlayerName(rawName) {
  if (!rawName || typeof rawName !== "string") return "Player";
  const cleaned = rawName.trim().slice(0, 24);
  return cleaned.length > 0 ? cleaned : "Player";
}

/**
 * Calculates match statistics from history.
 */
export function computeStats(history) {
  let playerWins = 0;
  let aiWins = 0;
  let draws = 0;
  let currentStreak = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i];
    if (item.outcome === "WIN") {
      playerWins++;
      currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
    } else if (item.outcome === "LOSS") {
      aiWins++;
      currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
    } else if (item.outcome === "DRAW") {
      draws++;
    }
  }

  const totalRounds = history.length;
  const winRate = totalRounds > 0 ? Math.round((playerWins / totalRounds) * 100) : 0;

  return {
    playerWins,
    aiWins,
    draws,
    totalRounds,
    winRate,
    currentStreak
  };
}
