import React from "react";
import { Trophy, Clock, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { MOVE_ICONS } from "../utils/gameLogic";

export function RoundHistory({ history, onClearHistory }) {
  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case "WIN":
        return (
          <span className="outcome-tag win">
            <CheckCircle2 size={12} /> WIN +10
          </span>
        );
      case "DRAW":
        return (
          <span className="outcome-tag draw">
            <MinusCircle size={12} /> DRAW +3
          </span>
        );
      case "LOSS":
        return (
          <span className="outcome-tag loss">
            <XCircle size={12} /> LOSS +0
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="history-panel" aria-label="Recent round history">
      <div className="panel-title-row">
        <h3>
          <Trophy size={16} /> RECENT ROUNDS
        </h3>
        {history.length > 0 && (
          <span className="round-counter-badge">{history.length} ROUNDS</span>
        )}
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-history">
            <Clock size={28} className="empty-icon" />
            <p className="muted">Your recent rounds will be recorded here.</p>
            <small>Show a hand gesture or trigger a duel to start.</small>
          </div>
        ) : (
          history.slice(0, 6).map((item, index) => (
            <div className="history-row" key={`history-${item.round}-${index}`}>
              <div className="round-number">#{item.round}</div>
              <div className="round-moves">
                <span className="move-pill player">
                  {MOVE_ICONS[item.player] || "✋"} {item.player}
                </span>
                <span className="vs-tiny">vs</span>
                <span className="move-pill ai">
                  {MOVE_ICONS[item.ai] || "🤖"} {item.ai}
                </span>
              </div>
              <div className="round-outcome">{getOutcomeBadge(item.outcome)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
