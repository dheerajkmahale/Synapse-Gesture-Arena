import React from "react";
import { Bot, User, Award, Flame } from "lucide-react";

export function ScoreBoard({
  playerName,
  playerScore,
  aiScore,
  stats,
  gameMode
}) {
  const isBestOf5 = gameMode === "bestOf5";

  return (
    <div className="scoreboard" aria-label="Game Scoreboard">
      {/* Player Score Card */}
      <div className="score-card player-card">
        <div className="card-header">
          <User size={14} className="card-icon" />
          <span className="card-title">YOU · {playerName}</span>
          {stats.currentStreak > 1 && (
            <span className="streak-badge" title={`${stats.currentStreak} Round Win Streak!`}>
              <Flame size={12} /> {stats.currentStreak}X
            </span>
          )}
        </div>
        <strong className="score-number player-glow">{playerScore}</strong>
        <div className="card-footer">
          <small>PLAYER SCORE</small>
          <div className="sub-stats">
            <span>W: {stats.playerWins}</span>
            <span className="stat-separator">•</span>
            <span>D: {stats.draws}</span>
          </div>
        </div>

        {/* Tournament node indicator */}
        {isBestOf5 && (
          <div className="tournament-nodes" title="First to 3 wins takes match">
            {[0, 1, 2].map((idx) => (
              <span
                key={`p-node-${idx}`}
                className={`match-node ${idx < stats.playerWins ? "filled player-filled" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Center VS Indicator */}
      <div className="versus-column">
        <div className="versus-pill">VS</div>
        <div className="versus-line" />
      </div>

      {/* AI Opponent Score Card */}
      <div className="score-card ai-card">
        <div className="card-header">
          <Bot size={14} className="card-icon" />
          <span className="card-title">SYNAPSE AI</span>
          {stats.currentStreak < -1 && (
            <span className="ai-streak-badge" title="AI on a streak!">
              <Award size={12} /> {Math.abs(stats.currentStreak)}X
            </span>
          )}
        </div>
        <strong className="score-number ai-glow">{aiScore}</strong>
        <div className="card-footer">
          <small>AI SCORE</small>
          <div className="sub-stats">
            <span>W: {stats.aiWins}</span>
            <span className="stat-separator">•</span>
            <span>D: {stats.draws}</span>
          </div>
        </div>

        {/* Tournament node indicator */}
        {isBestOf5 && (
          <div className="tournament-nodes" title="First to 3 wins takes match">
            {[0, 1, 2].map((idx) => (
              <span
                key={`ai-node-${idx}`}
                className={`match-node ${idx < stats.aiWins ? "filled ai-filled" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
