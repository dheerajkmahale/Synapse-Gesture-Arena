import React, { useState, useEffect, useRef, useCallback } from "react";
import { Hand, Volume2, VolumeX, X, RotateCcw, Award, HelpCircle } from "lucide-react";
import { ScoreBoard } from "./ScoreBoard";
import { CameraView } from "./CameraView";
import { GestureDisplay } from "./GestureDisplay";
import { RoundHistory } from "./RoundHistory";
import { ManualControls } from "./ManualControls";
import { GameResultModal } from "./GameResultModal";
import { useHandTracking } from "../hooks/useHandTracking";
import { resolveRound, getAiMove, computeStats, GESTURE_TO_MOVE, MOVES } from "../utils/gameLogic";
import { soundFX } from "../utils/audio";

export function GameDashboard({
  playerName,
  gameMode,
  muted,
  setMuted,
  onExitGame
}) {
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("Show an open palm, fist, or pointing gesture to duel");
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [tournamentWinner, setTournamentWinner] = useState(null);

  const countdownTimerRef = useRef(null);
  const roundLockRef = useRef(false);
  const lastScoreTimeRef = useRef(0);
  const consumedGestureRef = useRef(null);

  // Stats calculation
  const stats = computeStats(history);

  // Sound toggle
  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    soundFX.setMuted(next);
    if (!next) soundFX.playClick();
  };

  // Execute a round with given player move
  const executeRound = useCallback((playerMove) => {
    if (roundLockRef.current) return;
    roundLockRef.current = true;
    setRoundInProgress(true);

    const aiMove = getAiMove();
    const result = resolveRound(playerMove, aiMove);

    // Play corresponding sound
    if (result.outcome === "WIN") soundFX.playWin();
    else if (result.outcome === "LOSS") soundFX.playLoss();
    else soundFX.playDraw();

    // Update state
    setPlayerScore((s) => s + result.playerPoints);
    setAiScore((s) => s + result.aiPoints);

    const newRoundEntry = {
      round,
      player: playerMove,
      ai: aiMove,
      outcome: result.outcome,
      resultText: result.headline,
      timestamp: Date.now()
    };

    setHistory((prev) => [newRoundEntry, ...prev]);
    setMessage(`${result.headline}: ${result.detail}`);
    setRound((r) => r + 1);

    // Check Best of 5 completion
    if (gameMode === "bestOf5") {
      const nextPlayerWins = result.outcome === "WIN" ? stats.playerWins + 1 : stats.playerWins;
      const nextAiWins = result.outcome === "LOSS" ? stats.aiWins + 1 : stats.aiWins;

      if (nextPlayerWins >= 3) {
        setTournamentWinner("player");
        setTimeout(() => setShowResultModal(true), 800);
      } else if (nextAiWins >= 3) {
        setTournamentWinner("ai");
        setTimeout(() => setShowResultModal(true), 800);
      }
    }

    // Cooldown buffer of 2.2s to prevent rapid accidental scoring
    setTimeout(() => {
      roundLockRef.current = false;
      setRoundInProgress(false);
    }, 2200);
  }, [round, gameMode, stats.playerWins, stats.aiWins]);

  // Handle stable gesture recognized by camera
  const handleStableGesture = useCallback((classification) => {
    // If no hand or partial transition, reset consumed gesture
    if (!classification || classification.status === "NO_HAND" || classification.status === "PARTIAL") {
      consumedGestureRef.current = null;
      return;
    }

    // Fist can also act as pause hint when not dueling
    if (classification.gesture === "Fist" && !roundInProgress) {
      setMessage("Fist detected — Rock ready! Hold steady or click START ROUND to duel.");
    }

    // PREVENT ACCIDENTAL MULTI-ROUND TRIGGER:
    // If this exact held gesture already scored a round, ignore it until hand is lowered or changed!
    if (consumedGestureRef.current === classification.gesture) {
      return;
    }

    const now = performance.now();
    // Cooldown buffer check
    if (roundLockRef.current || now - lastScoreTimeRef.current < 2000) {
      return;
    }

    // If gesture maps to a valid move and user is ready
    if (classification.move) {
      consumedGestureRef.current = classification.gesture;
      lastScoreTimeRef.current = now;
      executeRound(classification.move);
    }
  }, [roundInProgress, executeRound]);

  // Hook for camera tracking
  const {
    videoRef,
    canvasRef,
    cameraActive,
    modelLoaded,
    statusMessage,
    error,
    currentGesture,
    currentMove,
    confidence,
    isStable,
    stabilityProgress,
    fps,
    startTracking,
    stopTracking
  } = useHandTracking({
    onStableGesture: handleStableGesture,
    overlayEnabled
  });

  // Start a deliberate 3-2-1 countdown duel
  const triggerDuel = () => {
    if (roundInProgress || roundLockRef.current) return;
    setRoundInProgress(true);
    let count = 3;
    setCountdown(count);
    soundFX.playCountdownTick(false);

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundFX.playCountdownTick(false);
      } else if (count === 0) {
        setCountdown(0);
        soundFX.playCountdownTick(true);
      } else {
        clearInterval(countdownTimerRef.current);
        setCountdown(null);
        // Capture current gesture or fallback to Paper if none
        const move = currentMove || (currentGesture === "Open Palm" ? MOVES.PAPER : currentGesture === "Fist" ? MOVES.ROCK : MOVES.SCISSORS);
        if (move) {
          executeRound(move);
        } else {
          setMessage("No gesture detected in time! Try again or use manual testing buttons.");
          setRoundInProgress(false);
          roundLockRef.current = false;
        }
      }
    }, 900);
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Rematch in tournament mode
  const handleRematch = () => {
    setPlayerScore(0);
    setAiScore(0);
    setRound(1);
    setHistory([]);
    setTournamentWinner(null);
    setShowResultModal(false);
    setMessage("New match started! Form your gesture.");
  };

  // Reset entire game
  const handleResetGame = () => {
    stopTracking();
    setPlayerScore(0);
    setAiScore(0);
    setRound(1);
    setHistory([]);
    setTournamentWinner(null);
    setShowResultModal(false);
    onExitGame();
  };

  return (
    <section className="game-layout" aria-label="Synapse Gesture Arena Gameplay">
      {/* Game Header */}
      <header className="game-header">
        <div className="brand-mini">
          <Hand size={24} className="neon-cyan" />
          <span>
            SYNAPSE <b>ARENA</b>
          </span>
          <span className="mode-badge">
            {gameMode === "bestOf5" ? "BEST OF 5" : "ARENA"}
          </span>
        </div>

        <div className="header-actions">
          <button
            className="icon-button"
            onClick={toggleSound}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
            title={muted ? "Unmute sound" : "Mute sound"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            className="secondary-button"
            onClick={() => setShowResultModal(true)}
            title="View Match Summary"
          >
            <Award size={15} /> Summary
          </button>

          <button className="secondary-button exit-btn" onClick={handleResetGame}>
            <X size={15} /> Exit
          </button>
        </div>
      </header>

      {/* Round & Arena Headline */}
      <div className="game-title">
        <span className="round-pill">ROUND {round}</span>
        <h1>
          GESTURE <b>ARENA</b>
        </h1>
        <p>Make your move with your hand. No touch required.</p>
      </div>

      {/* Scoreboard */}
      <ScoreBoard
        playerName={playerName}
        playerScore={playerScore}
        aiScore={aiScore}
        stats={stats}
        gameMode={gameMode}
      />

      {/* Main Play Area */}
      <div className="play-area">
        {/* Left Column: Live Camera & Hand Tracker */}
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          cameraActive={cameraActive}
          modelLoaded={modelLoaded}
          statusMessage={statusMessage}
          error={error}
          currentGesture={currentGesture}
          confidence={confidence}
          fps={fps}
          countdown={countdown}
          onStartCamera={startTracking}
          onStopCamera={stopTracking}
          overlayEnabled={overlayEnabled}
          setOverlayEnabled={setOverlayEnabled}
        />

        {/* Right Column: Gesture Detection & Duel Action */}
        <GestureDisplay
          currentGesture={currentGesture}
          currentMove={currentMove}
          isStable={isStable}
          stabilityProgress={stabilityProgress}
          statusMessage={message}
          onTriggerDuel={triggerDuel}
          roundInProgress={roundInProgress}
          cameraActive={cameraActive}
        />
      </div>

      {/* Manual Testing Controls Drawer */}
      <ManualControls onManualScore={executeRound} disabled={roundInProgress} />

      {/* Bottom Information Grid */}
      <div className="bottom-grid">
        <RoundHistory history={history} onClearHistory={() => setHistory([])} />

        <div className="how-panel" aria-label="Game Rules and Move Guide">
          <h3>
            <HelpCircle size={16} /> HOW TO PLAY
          </h3>
          <div className="rule-list">
            <p>
              <b>✋ Open palm (Paper)</b> — covers Rock (+10 pts)
            </p>
            <p>
              <b>✊ Fist (Rock)</b> — crushes Scissors (+10 pts)
            </p>
            <p>
              <b>✌️ Pointing / Scissors</b> — cuts Paper (+10 pts)
            </p>
            <p className="draw-note">
              <b>🤝 Same Move (Draw)</b> — +3 points each
            </p>
          </div>
          <p className="privacy-muted">
            Camera processing runs 100% locally in your browser with MediaPipe AI.
          </p>
        </div>
      </div>

      {/* Match Result / Summary Modal */}
      {showResultModal && (
        <GameResultModal
          winner={
            tournamentWinner ||
            (playerScore > aiScore ? "player" : playerScore < aiScore ? "ai" : "draw")
          }
          playerName={playerName}
          playerScore={playerScore}
          aiScore={aiScore}
          stats={stats}
          gameMode={gameMode}
          onRematch={handleRematch}
          onExit={handleResetGame}
        />
      )}
    </section>
  );
}
