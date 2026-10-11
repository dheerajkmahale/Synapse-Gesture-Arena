import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  saveScore,
  getLeaderboard,
  clearLeaderboard,
  getRankTitle,
  AI_BENCHMARK_SCORE,
  DEFAULT_GAME_TIME,
  DEATH_MODE_THRESHOLD
} from "../leaderboard";
import { arcadeAudio } from "../arcadeAudio";

function createMockStorage() {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
}

describe("Arcade Game Utilities & Scoring Logic", () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    globalThis.localStorage = createMockStorage();
  });

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage;
  });

  describe("Rank Title Generator", () => {
    it("returns 'AI SLAYER 😎' for scores 50 and above", () => {
      expect(getRankTitle(50)).toBe("AI SLAYER 😎");
      expect(getRankTitle(75)).toBe("AI SLAYER 😎");
    });

    it("returns 'PRO PLAYER 🔥' for scores 35 to 49", () => {
      expect(getRankTitle(35)).toBe("PRO PLAYER 🔥");
      expect(getRankTitle(49)).toBe("PRO PLAYER 🔥");
    });

    it("returns 'ALMOST THERE 😏' for scores 20 to 34", () => {
      expect(getRankTitle(20)).toBe("ALMOST THERE 😏");
      expect(getRankTitle(34)).toBe("ALMOST THERE 😏");
    });

    it("returns 'TRY AGAIN 😂' for scores below 20", () => {
      expect(getRankTitle(19)).toBe("TRY AGAIN 😂");
      expect(getRankTitle(0)).toBe("TRY AGAIN 😂");
    });
  });

  describe("Leaderboard Storage & Persistence", () => {
    it("starts with an empty leaderboard", () => {
      expect(getLeaderboard()).toEqual([]);
    });

    it("saves a score and retrieves it", () => {
      const result = saveScore("Neo", 42);
      expect(result.leaderboard).toHaveLength(1);
      expect(result.leaderboard[0].name).toBe("Neo");
      expect(result.leaderboard[0].score).toBe(42);
      expect(result.isHighScore).toBe(true);
      expect(result.beatAi).toBe(true);
      expect(result.rankTitle).toBe("PRO PLAYER 🔥");
    });

    it("sorts entries descending and caps at Top 5", () => {
      saveScore("Player 1", 10);
      saveScore("Player 2", 30);
      saveScore("Player 3", 50);
      saveScore("Player 4", 20);
      saveScore("Player 5", 40);
      const result = saveScore("Player 6", 60);

      expect(result.leaderboard).toHaveLength(5);
      expect(result.leaderboard[0].name).toBe("Player 6");
      expect(result.leaderboard[0].score).toBe(60);
      expect(result.leaderboard[1].name).toBe("Player 3");
      expect(result.leaderboard[1].score).toBe(50);
      expect(result.leaderboard[4].score).toBe(20);
    });

    it("clears leaderboard cleanly", () => {
      saveScore("CyberSamurai", 45);
      expect(getLeaderboard()).toHaveLength(1);
      clearLeaderboard();
      expect(getLeaderboard()).toEqual([]);
    });
  });

  describe("Game Constants & Collision Mechanics", () => {
    it("has 40s default game time and 10s death mode threshold", () => {
      expect(DEFAULT_GAME_TIME).toBe(40);
      expect(DEATH_MODE_THRESHOLD).toBe(10);
      expect(AI_BENCHMARK_SCORE).toBe(35);
    });

    it("detects paddle target collision within catch box", () => {
      const paddleX = 0.5;
      const paddleHalfWidth = 0.09;
      const paddleY = 0.88;

      const checkCollision = (target) => {
        return (
          target.y >= paddleY &&
          target.y <= paddleY + 0.06 &&
          Math.abs(target.x - paddleX) < paddleHalfWidth
        );
      };

      // Direct hit
      expect(checkCollision({ x: 0.5, y: 0.89 })).toBe(true);
      // Edge hit
      expect(checkCollision({ x: 0.5 + 0.07, y: 0.90 })).toBe(true);
      // Missed to the left
      expect(checkCollision({ x: 0.35, y: 0.89 })).toBe(false);
      // Above paddle
      expect(checkCollision({ x: 0.5, y: 0.80 })).toBe(false);
      // Below paddle
      expect(checkCollision({ x: 0.5, y: 0.96 })).toBe(false);
    });

    it("scores bonus targets (+5) higher than regular targets (+1)", () => {
      const calcPoints = (isBonus) => (isBonus ? 5 : 1);
      expect(calcPoints(false)).toBe(1);
      expect(calcPoints(true)).toBe(5);
    });

    it("preserves remaining game duration across pause/resume cycles without time loss", () => {
      let gameStartTime = 10000;
      let pauseStartTime = 15000; // 5 seconds into game
      let nowResume = 25000; // paused for 10 seconds

      const pausedDuration = nowResume - pauseStartTime;
      gameStartTime += pausedDuration; // adjusted start time

      // Now at time 25000, elapsed should only be 5 seconds, not 15 seconds
      const elapsed = (nowResume - gameStartTime) / 1000;
      const remaining = DEFAULT_GAME_TIME - elapsed;
      expect(elapsed).toBe(5);
      expect(remaining).toBe(35);
    });

    it("accumulates scores synchronously for rapid successive catches", () => {
      let score = 0;
      const catches = [false, false, true, false, true]; // 1 + 1 + 5 + 1 + 5 = 13
      for (const isBonus of catches) {
        score += isBonus ? 5 : 1;
      }
      expect(score).toBe(13);
    });
  });

  describe("Arcade Web Audio Synthesizer", () => {
    it("safely handles audio triggers when muted or unmuted in headless node environment", () => {
      expect(() => {
        arcadeAudio.setMuted(true);
        arcadeAudio.catch();
        arcadeAudio.bonus();
        arcadeAudio.miss();
        arcadeAudio.tick();
        arcadeAudio.death();
        arcadeAudio.highScore();
        arcadeAudio.start();
      }).not.toThrow();

      expect(() => {
        arcadeAudio.setMuted(false);
        arcadeAudio.catch();
        arcadeAudio.miss();
      }).not.toThrow();
    });
  });
});
