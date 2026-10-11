import React from "react";
import { Hand, Pause, Scissors, Sparkles, Play, ShieldAlert } from "lucide-react";
import { soundFX } from "../utils/audio";

export function GestureDisplay({
  currentGesture,
  currentMove,
  isStable,
  stabilityProgress,
  statusMessage,
  onTriggerDuel,
  roundInProgress,
  cameraActive
}) {
  const getGestureIcon = () => {
    switch (currentGesture) {
      case "Open Palm":
        return <Hand size={76} strokeWidth={1.2} className="gesture-svg neon-cyan" />;
      case "Fist":
        return <Pause size={76} strokeWidth={1.8} className="gesture-svg neon-purple" />;
      case "Point":
      case "Scissors":
        return <Scissors size={76} strokeWidth={1.3} className="gesture-svg neon-gold" />;
      default:
        return <Hand size={76} strokeWidth={1.0} className="gesture-svg muted-icon" />;
    }
  };

  const getGestureColorClass = () => {
    if (currentGesture === "Open Palm") return "cyan-accent";
    if (currentGesture === "Fist") return "purple-accent";
    if (currentGesture === "Point" || currentGesture === "Scissors") return "gold-accent";
    return "";
  };

  return (
    <div className="move-panel" aria-label="Gesture Recognition and Move Panel">
      {/* Panel Top */}
      <div className="panel-top">
        <span className="panel-title">
          <Sparkles size={14} /> YOUR GESTURE
        </span>
        <span className={`gesture-pill ${getGestureColorClass()}`}>
          {currentMove ? `${currentGesture} [${currentMove}]` : currentGesture}
        </span>
      </div>

      {/* Main Gesture Display */}
      <div className="gesture-display">
        <div className="gesture-icon-wrapper">
          {getGestureIcon()}
          {isStable && <div className="stable-lock-ring" />}
        </div>

        <strong className="gesture-title">
          {currentMove ? `${currentMove.toUpperCase()}` : currentGesture}
        </strong>

        <p className="gesture-hint">
          {!cameraActive
            ? "Enable camera to start gesture detection"
            : currentGesture === "No hand detected"
            ? "Raise your hand in front of the camera"
            : currentGesture === "Partial Hand"
            ? "Form a clear Fist, Open Palm, or Pointing gesture"
            : `Hold gesture stable to lock in move!`}
        </p>

        {/* Stability Meter */}
        {cameraActive && (
          <div className="stability-meter" aria-label="Gesture stability progress">
            <div className="meter-header">
              <span>DETECTION STABILITY</span>
              <span>{Math.round(stabilityProgress * 100)}%</span>
            </div>
            <div className="meter-track">
              <div
                className={`meter-bar ${isStable ? "stable" : ""}`}
                style={{ width: `${stabilityProgress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Status / Round Outcome Message */}
      <div className="status-message" role="alert">
        {statusMessage}
      </div>

      {/* Duel Trigger Action */}
      <button
        className="primary-button duel-button"
        onClick={() => {
          soundFX.playClick();
          onTriggerDuel();
        }}
        disabled={roundInProgress}
      >
        <Play size={16} />
        <span>{roundInProgress ? "DUEL IN PROGRESS..." : "START ROUND (3-2-1 DUEL)"}</span>
      </button>
    </div>
  );
}
