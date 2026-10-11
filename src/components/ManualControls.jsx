import React, { useState } from "react";
import { Wrench, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { MOVES } from "../utils/gameLogic";
import { soundFX } from "../utils/audio";

export function ManualControls({ onManualScore, disabled }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleManual = (move) => {
    soundFX.playClick();
    onManualScore(move);
  };

  return (
    <div className="manual-test-drawer">
      <button
        className="drawer-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="drawer-title">
          <Wrench size={14} /> MANUAL TESTING CONTROLS (DEV MODE)
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="drawer-body">
          <p className="drawer-desc">
            Manually simulate moves to test all Rock-Paper-Scissors game outcomes without relying on webcam:
          </p>
          <div className="manual-btn-grid">
            <button
              className="manual-action-btn rock-btn"
              onClick={() => handleManual(MOVES.ROCK)}
              disabled={disabled}
            >
              <PlayCircle size={15} /> TEST ROCK (✊ Fist)
            </button>
            <button
              className="manual-action-btn paper-btn"
              onClick={() => handleManual(MOVES.PAPER)}
              disabled={disabled}
            >
              <PlayCircle size={15} /> TEST PAPER (✋ Palm)
            </button>
            <button
              className="manual-action-btn scissors-btn"
              onClick={() => handleManual(MOVES.SCISSORS)}
              disabled={disabled}
            >
              <PlayCircle size={15} /> TEST SCISSORS (✌️ Point)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
