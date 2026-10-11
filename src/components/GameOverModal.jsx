import React from "react";
import { RotateCcw, Home, Trophy, Award, Bot, Sparkles } from "lucide-react";
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

  React.useEffect(() => {
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
    <div className="game-over-overlay" role="dialog" aria-modal="true" aria-label="Game Over">
      <div className="game-over-card animate-pop-in">
        <div className="game-over-header">
          <span className="game-over-eyebrow">MISSION COMPLETE</span>
          <h2 className="game-over-score">{score}</h2>
          <div className="rank-badge">{rankTitle}</div>

          {isHighScore && (
            <div className="new-high-score-banner animate-pulse">
              <Trophy size={18} /> NEW HIGH SCORE!
            </div>
          )}

          <p className="ai-comparison-text">
            {beatAi ? (
              <span className="text-neon">You beat the AI ({AI_BENCHMARK_SCORE}) 🤖</span>
            ) : (
              <span className="text-muted">AI scored {AI_BENCHMARK_SCORE}. Can you beat it?</span>
            )}
          </p>
        </div>

        {/* Top 5 Leaderboard */}
        <div className="leaderboard-box">
          <div className="leaderboard-title">
            <Award size={15} /> TOP 5 LEADERBOARD
          </div>
          <ul className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <li className="empty-leaderboard">No records logged yet.</li>
            ) : (
              leaderboard.map((item, idx) => (
                <li
                  key={`lb-${idx}-${item.score}`}
                  className={`leaderboard-item ${idx === 0 ? "top-rank" : ""}`}
                >
                  <span className="player-rank">
                    {idx === 0 ? "👑" : `#${idx + 1}`} {item.name}
                  </span>
                  <span className="player-score">{item.score}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="game-over-actions">
          <button className="primary-button play-again-btn" onClick={onPlayAgain}>
            <RotateCcw size={18} /> PLAY AGAIN
          </button>
          <button className="secondary-button exit-home-btn" onClick={onExit}>
            <Home size={16} /> RETURN HOME
          </button>
        </div>
      </div>
    </div>
  );
}
