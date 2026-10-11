import React, { useEffect } from "react";
import { RotateCcw, Home, Trophy, Award, Bot, Sparkles, ShieldCheck } from "lucide-react";
import { AI_BENCHMARK_SCORE } from "../utils/leaderboard";

export function GameOverModal({
  score,
  playerName,
  leaderboard,
  isHighScore,
  rankTitle,
  onPlayAgain,
  onExit
}) {
  const beatAi = score > AI_BENCHMARK_SCORE;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onPlayAgain();
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPlayAgain, onExit]);

  return (
    <div className="game-over-overlay" role="dialog" aria-modal="true" aria-label="Game Over Terminal">
      <div className="game-over-card animate-pop-in">
        {/* Cyber Corner HUD Brackets */}
        <div className="deck-corner-bracket top-left" aria-hidden="true" />
        <div className="deck-corner-bracket top-right" aria-hidden="true" />
        <div className="deck-corner-bracket bottom-left" aria-hidden="true" />
        <div className="deck-corner-bracket bottom-right" aria-hidden="true" />

        {/* Header Section */}
        <div className="game-over-header">
          <div className="mission-status-pill">
            <span className="live-status-dot" />
            <span>MISSION DEBRIEF · OPERATOR: {playerName.toUpperCase()}</span>
          </div>

          <h2 className="game-over-score" data-testid="final-score-display">
            {score}
          </h2>
          <div className="score-unit-label">FINAL ENERGY SCORE</div>

          <div className="rank-badge-pill">
            <Sparkles size={14} className="text-neon-cyan" />
            <span>{rankTitle}</span>
            <Sparkles size={14} className="text-neon-cyan" />
          </div>

          {isHighScore && (
            <div className="new-high-score-banner animate-pulse">
              <Trophy size={18} className="trophy-bounce" />
              <span>NEW PERSONAL BEST LOGGED!</span>
            </div>
          )}

          <div className="ai-comparison-banner">
            {beatAi ? (
              <div className="victory-chip">
                <ShieldCheck size={16} />
                <span>AI BENCHMARK DEFEATED ({AI_BENCHMARK_SCORE} PTS) 🤖</span>
              </div>
            ) : (
              <div className="defeat-chip">
                <Bot size={16} />
                <span>AI BENCHMARK WAS {AI_BENCHMARK_SCORE} PTS. RETRY TO CONQUER!</span>
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Leaderboard Breakdown */}
        <div className="leaderboard-box">
          <div className="leaderboard-box-header">
            <Award size={16} className="text-gold-accent" />
            <span>TOP 5 OPERATORS LEADERBOARD</span>
          </div>
          <ul className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <li className="empty-leaderboard">No operator scores recorded.</li>
            ) : (
              leaderboard.map((item, idx) => {
                const isChampion = idx === 0;
                return (
                  <li
                    key={`lb-${idx}-${item.score}`}
                    className={`leaderboard-item ${isChampion ? "top-rank" : ""}`}
                  >
                    <span className="player-rank">
                      {idx === 0 ? "👑 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`} {item.name}
                    </span>
                    <span className="player-score">{item.score} <small>PTS</small></span>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Actions Deck */}
        <div className="game-over-actions">
          <button
            className="arcade-deploy-btn play-again-btn"
            onClick={onPlayAgain}
            title="Press Enter to play again"
          >
            <span className="btn-content">
              <RotateCcw size={18} />
              <span>PLAY AGAIN</span>
              <kbd className="key-hint">ENTER</kbd>
            </span>
          </button>
          <button
            className="secondary-cyber-btn exit-home-btn"
            onClick={onExit}
            title="Press Escape to return home"
          >
            <Home size={16} />
            <span>RETURN HOME</span>
            <kbd className="key-hint">ESC</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
