import { describe, it, expect } from "vitest";
import {
  MOVES,
  resolveRound,
  sanitizePlayerName,
  computeStats,
  GESTURE_TO_MOVE
} from "../gameLogic";

describe("Game Logic - Rock Paper Scissors & Scoring", () => {
  it("maps gestures to correct moves", () => {
    expect(GESTURE_TO_MOVE["Open Palm"]).toBe(MOVES.PAPER);
    expect(GESTURE_TO_MOVE["Fist"]).toBe(MOVES.ROCK);
    expect(GESTURE_TO_MOVE["Point"]).toBe(MOVES.SCISSORS);
    expect(GESTURE_TO_MOVE["Scissors"]).toBe(MOVES.SCISSORS);
  });

  it("handles Rock beats Scissors (Player Win)", () => {
    const result = resolveRound(MOVES.ROCK, MOVES.SCISSORS);
    expect(result.outcome).toBe("WIN");
    expect(result.playerPoints).toBe(10);
    expect(result.aiPoints).toBe(0);
    expect(result.winner).toBe("player");
  });

  it("handles Scissors beats Paper (Player Win)", () => {
    const result = resolveRound(MOVES.SCISSORS, MOVES.PAPER);
    expect(result.outcome).toBe("WIN");
    expect(result.playerPoints).toBe(10);
    expect(result.aiPoints).toBe(0);
    expect(result.winner).toBe("player");
  });

  it("handles Paper beats Rock (Player Win)", () => {
    const result = resolveRound(MOVES.PAPER, MOVES.ROCK);
    expect(result.outcome).toBe("WIN");
    expect(result.playerPoints).toBe(10);
    expect(result.aiPoints).toBe(0);
    expect(result.winner).toBe("player");
  });

  it("handles Rock loses to Paper (AI Win)", () => {
    const result = resolveRound(MOVES.ROCK, MOVES.PAPER);
    expect(result.outcome).toBe("LOSS");
    expect(result.playerPoints).toBe(0);
    expect(result.aiPoints).toBe(10);
    expect(result.winner).toBe("ai");
  });

  it("handles Paper loses to Scissors (AI Win)", () => {
    const result = resolveRound(MOVES.PAPER, MOVES.SCISSORS);
    expect(result.outcome).toBe("LOSS");
    expect(result.playerPoints).toBe(0);
    expect(result.aiPoints).toBe(10);
    expect(result.winner).toBe("ai");
  });

  it("handles Scissors loses to Rock (AI Win)", () => {
    const result = resolveRound(MOVES.SCISSORS, MOVES.ROCK);
    expect(result.outcome).toBe("LOSS");
    expect(result.playerPoints).toBe(0);
    expect(result.aiPoints).toBe(10);
    expect(result.winner).toBe("ai");
  });

  it("handles matching moves as Draw with +3 points each", () => {
    const r1 = resolveRound(MOVES.ROCK, MOVES.ROCK);
    expect(r1.outcome).toBe("DRAW");
    expect(r1.playerPoints).toBe(3);
    expect(r1.aiPoints).toBe(3);

    const r2 = resolveRound(MOVES.PAPER, MOVES.PAPER);
    expect(r2.outcome).toBe("DRAW");
    expect(r2.playerPoints).toBe(3);
    expect(r2.aiPoints).toBe(3);

    const r3 = resolveRound(MOVES.SCISSORS, MOVES.SCISSORS);
    expect(r3.outcome).toBe("DRAW");
    expect(r3.playerPoints).toBe(3);
    expect(r3.aiPoints).toBe(3);
  });

  it("sanitizes player names with fallback and trims whitespace", () => {
    expect(sanitizePlayerName("")).toBe("Player");
    expect(sanitizePlayerName("   ")).toBe("Player");
    expect(sanitizePlayerName(null)).toBe("Player");
    expect(sanitizePlayerName("  CyberNinja  ")).toBe("CyberNinja");
  });

  it("computes accurate game statistics", () => {
    const history = [
      { outcome: "WIN" },
      { outcome: "LOSS" },
      { outcome: "DRAW" },
      { outcome: "WIN" }
    ];
    const stats = computeStats(history);
    expect(stats.playerWins).toBe(2);
    expect(stats.aiWins).toBe(1);
    expect(stats.draws).toBe(1);
    expect(stats.totalRounds).toBe(4);
    expect(stats.winRate).toBe(50);
  });
});
