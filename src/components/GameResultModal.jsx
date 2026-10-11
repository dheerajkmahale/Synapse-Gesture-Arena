import React from "react";
import { Trophy, Bot, RotateCcw, Home, Award, Sparkles, Frown } from "lucide-react";
import { soundFX } from "../utils/audio";

export function GameResultModal({
  winner,
  playerName,
  playerScore,
  aiScore,
  stats,
  gameMode,
  onRematch,
  onExit
}) {
  const isPlayerWinner = winner === "player";
  const isDraw = winner === "draw";

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        {/* Animated Celebration Glow */}
        <div className={`modal-glow ${isPlayerWinner ? "player-glow" : "ai-glow"}`} />

        <div className="modal-icon-wrap">
          {isPlayerWinner ? (
            <Trophy size={64} className="trophy-gold" />
          ) : isDraw ? (
            <Award size={64} className="award-neutral" />
          ) : (
            <Bot size={64} className="bot-modal-icon" />
          )}
        </div>

        <h2 className="modal-headline">
          {isPlayerWinner
            ? "ARENA CHAMPION!"
            : isDraw
            ? "HONORABLE DRAW!"
            : "SYNAPSE AI PREVAILS!"}
        </h2>

        <p className="modal-sub">
          {isPlayerWinner
            ? `Outstanding performance, ${playerName}! You dominated the neural network.`
            : isDraw
            ? "Evenly matched battle of minds and reflexes."
            : "The AI adapted to your moves. Regroup and challenge again!"}
        </p>

        {/* Final Scoreboard Stats Grid */}
        <div className="modal-stats-grid">
          <div className="modal-stat-box">
            <span className="stat-label">YOUR SCORE</span>
            <strong className="stat-value cyan">{playerScore}</strong>
            <small>{stats.playerWins} Wins</small>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">AI SCORE</span>
            <strong className="stat-value purple">{aiScore}</strong>
            <small>{stats.aiWins} Wins</small>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">TOTAL ROUNDS</span>
            <strong className="stat-value">{stats.totalRounds}</strong>
            <small>{stats.draws} Draws</small>
          </div>

          <div className="modal-stat-box">
            <span className="stat-label">WIN ACCURACY</span>
            <strong className="stat-value gold">{stats.winRate}%</strong>
            <small>Success rate</small>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-actions">
          <button
            className="primary-button modal-btn"
            onClick={() => {
              soundFX.playClick();
              onRematch();
            }}
          >
            <RotateCcw size={16} /> PLAY AGAIN
          </button>
          <button
            className="secondary-button modal-btn"
            onClick={() => {
              soundFX.playClick();
              onExit();
            }}
          >
            <Home size={16} /> RETURN HOME
          </button>
        </div>
      </div>
    </div>
  );
}
