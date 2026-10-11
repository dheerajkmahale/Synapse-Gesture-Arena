import React, { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Pause, Play, LogOut, Sparkles } from "lucide-react";
import { useArcadeHandTracking } from "../hooks/useArcadeHandTracking";
import { arcadeAudio } from "../utils/arcadeAudio";
import { saveScore, getLeaderboard, AI_BENCHMARK_SCORE, DEFAULT_GAME_TIME, DEATH_MODE_THRESHOLD, getRankTitle } from "../utils/leaderboard";
import { GameOverModal } from "./GameOverModal";

const POPUP_PHRASES = ["Nice!", "Perfect!", "Great!", "+1", "Boom!"];

export function ArcadeGame({ playerName = "Player", onExit, initialMuted = false }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Vision Hook
  const { ready, error, handRef, present, currentGesture } = useArcadeHandTracking(videoRef);

  // Game States
  const [gameState, setGameState] = useState("countdown"); // "countdown" | "playing" | "ended"
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_GAME_TIME);
  const [isPaused, setIsPaused] = useState(false);
  const [muted, setMuted] = useState(initialMuted);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isHighScore, setIsHighScore] = useState(false);

  // Mutable Game Loop References
  const targetsRef = useRef([]);
  const particlesRef = useRef([]);
  const popupsRef = useRef([]);
  const paddleXRef = useRef(0.5);
  const pointerXRef = useRef(0.5);
  const lastSpawnTimeRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const nextTargetIdRef = useRef(1);
  const gameStateRef = useRef(gameState);
  const isPausedRef = useRef(isPaused);
  const fistHoldTimerRef = useRef(0);
  const pauseStartTimeRef = useRef(0);
  const lastTickedSecondRef = useRef(-1);
  const deathModeTriggeredRef = useRef(false);
  const scoreRef = useRef(0);
  const timeLeftDisplayRef = useRef(DEFAULT_GAME_TIME);

  // Synchronize state to refs
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) {
      pauseStartTimeRef.current = performance.now();
    } else if (pauseStartTimeRef.current > 0) {
      const pausedDuration = performance.now() - pauseStartTimeRef.current;
      gameStartTimeRef.current += pausedDuration;
      lastSpawnTimeRef.current += pausedDuration;
      pauseStartTimeRef.current = 0;
    }
  }, [isPaused]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    arcadeAudio.setMuted(muted);
  }, [muted]);

  // Initial Leaderboard Load
  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  // Helper to spawn a falling target
  const spawnTarget = useCallback((id, yOffset = -0.05, speedMult = 1) => {
    const isBonus = Math.random() < 0.08;
    return {
      id,
      x: 0.08 + Math.random() * 0.84,
      y: yOffset,
      vy: (0.45 + Math.random() * 0.15) * speedMult,
      bonus: isBonus,
      r: isBonus ? 0.035 : 0.028
    };
  }, []);

  // Spawn particle burst on catch
  const spawnParticles = (x, y, color) => {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.5;
      particlesRef.current.push({
        id: nextTargetIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        life: 0.7,
        color
      });
    }
  };

  // Spawn floating score popup text
  const spawnPopup = (x, y, text, color) => {
    const id = nextTargetIdRef.current++;
    popupsRef.current.push({ id, x, y, text, color, created: performance.now() });
    setTimeout(() => {
      popupsRef.current = popupsRef.current.filter((p) => p.id !== id);
    }, 850);
  };

  // End Game Handler
  const finishGame = useCallback(() => {
    if (gameStateRef.current === "ended") return;
    setGameState("ended");

    const finalScore = scoreRef.current;
    const saveResult = saveScore(playerName, finalScore);
    setLeaderboard(saveResult.leaderboard);
    setIsHighScore(saveResult.isHighScore);

    if (saveResult.isHighScore) {
      arcadeAudio.highScore();
    }
  }, [playerName]);

  // Start / Reset Round
  const restartGame = useCallback(() => {
    targetsRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];
    paddleXRef.current = 0.5;
    lastSpawnTimeRef.current = 0;
    gameStartTimeRef.current = 0;
    fistHoldTimerRef.current = 0;
    pauseStartTimeRef.current = 0;
    lastTickedSecondRef.current = -1;
    deathModeTriggeredRef.current = false;
    timeLeftDisplayRef.current = DEFAULT_GAME_TIME;
    scoreRef.current = 0;

    setScore(0);
    setTimeLeft(DEFAULT_GAME_TIME);
    setIsPaused(false);
    setIsHighScore(false);
    setCountdown(3);
    setGameState("countdown");
  }, []);

  // Countdown Loop
  useEffect(() => {
    if (gameState !== "countdown") return;

    if (countdown <= 0) {
      arcadeAudio.start();
      gameStartTimeRef.current = performance.now();
      lastSpawnTimeRef.current = performance.now();
      targetsRef.current = [];

      // Initial targets burst
      for (let i = 0; i < 3; i++) {
        targetsRef.current.push(spawnTarget(nextTargetIdRef.current++, -0.1 - i * 0.15, 1));
      }

      setGameState("playing");
      return;
    }

    arcadeAudio.tick();
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 700);

    return () => clearTimeout(timer);
  }, [countdown, gameState, spawnTarget]);

  // Canvas Drawing Routine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Glowing Cyberpunk Paddle
    const paddleWidth = 0.18 * width;
    const paddleHeight = 0.05 * height;
    const paddleX = paddleXRef.current * width;
    const paddleY = 0.88 * height;
    const paddleLeft = paddleX - paddleWidth / 2;

    const paddleGrad = ctx.createLinearGradient(paddleLeft, paddleY, paddleLeft + paddleWidth, paddleY + paddleHeight);
    paddleGrad.addColorStop(0, "hsl(195, 100%, 55%)");
    paddleGrad.addColorStop(1, "hsl(270, 95%, 65%)");

    ctx.save();
    ctx.shadowColor = "hsl(195, 100%, 55%)";
    ctx.shadowBlur = 25;
    ctx.fillStyle = paddleGrad;

    // Rounded rectangle paddle
    ctx.beginPath();
    const r = 12;
    ctx.moveTo(paddleLeft + r, paddleY);
    ctx.arcTo(paddleLeft + paddleWidth, paddleY, paddleLeft + paddleWidth, paddleY + paddleHeight, r);
    ctx.arcTo(paddleLeft + paddleWidth, paddleY + paddleHeight, paddleLeft, paddleY + paddleHeight, r);
    ctx.arcTo(paddleLeft, paddleY + paddleHeight, paddleLeft, paddleY, r);
    ctx.arcTo(paddleLeft, paddleY, paddleLeft + paddleWidth, paddleY, r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Draw Falling Targets
    for (const t of targetsRef.current) {
      const cx = t.x * width;
      const cy = t.y * height;
      const cr = t.r * height;

      ctx.save();
      const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, cr);
      if (t.bonus) {
        grad.addColorStop(0, "hsl(285, 100%, 80%)");
        grad.addColorStop(1, "hsl(270, 95%, 50%)");
        ctx.shadowColor = "hsl(285, 100%, 65%)";
        ctx.shadowBlur = 30;
      } else {
        grad.addColorStop(0, "hsl(195, 100%, 80%)");
        grad.addColorStop(1, "hsl(195, 100%, 45%)");
        ctx.shadowColor = "hsl(195, 100%, 55%)";
        ctx.shadowBlur = 18;
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw Exploding Particles
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.fillStyle = `hsl(${p.color} / ${Math.max(0, p.life)})`;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Hand Skeleton & Index Halo
    const landmarks = handRef.current.landmarks;
    if (landmarks && landmarks.length >= 21) {
      ctx.save();
      ctx.strokeStyle = "rgba(32, 213, 255, 0.65)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "hsl(285, 100%, 70%)";

      // Landmarks dots
      for (const pt of landmarks) {
        ctx.beginPath();
        ctx.arc(pt.x * width, pt.y * height, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Index tip glow ring (landmark 8)
      const indexTip = landmarks[8];
      if (indexTip) {
        ctx.shadowColor = "hsl(195, 100%, 60%)";
        ctx.shadowBlur = 22;
        ctx.strokeStyle = "hsl(195, 100%, 75%)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(indexTip.x * width, indexTip.y * height, 11, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Draw Floating Hit Popup Texts
    ctx.save();
    ctx.font = "700 28px 'Orbitron', sans-serif";
    ctx.textAlign = "center";
    for (const pop of popupsRef.current) {
      const alpha = Math.max(0, 1 - (performance.now() - pop.created) / 850);
      ctx.fillStyle = `hsl(${pop.color} / ${alpha})`;
      ctx.shadowColor = `hsl(${pop.color})`;
      ctx.shadowBlur = 14;
      ctx.fillText(pop.text, pop.x * width, pop.y * height);
    }
    ctx.restore();
  }, [handRef]);

  // Main Delta-Time Physics & Animation Loop
  useEffect(() => {
    let animId = null;
    let lastTime = performance.now();

    const loop = (now) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Smooth paddle position towards target hand position (or mouse fallback)
      const targetPos = present ? handRef.current.x : pointerXRef.current;
      const smoothFactor = 1 - Math.exp(-18 * dt);
      paddleXRef.current += (targetPos - paddleXRef.current) * smoothFactor;

      // Gesture Recognition for Pause / Resume
      if (gameStateRef.current === "playing") {
        if (handRef.current.fist) {
          fistHoldTimerRef.current += dt;
          if (fistHoldTimerRef.current > 0.35 && !isPausedRef.current) {
            setIsPaused(true);
          }
        } else {
          fistHoldTimerRef.current = 0;
          if (handRef.current.open && isPausedRef.current) {
            setIsPaused(false);
          }
        }
      }

      // Physics & Spawning when playing & not paused
      if (gameStateRef.current === "playing" && !isPausedRef.current) {
        const elapsed = (now - gameStartTimeRef.current) / 1000;
        const remaining = Math.max(0, DEFAULT_GAME_TIME - elapsed);
        const remainingCeil = Math.ceil(remaining);

        if (remainingCeil !== timeLeftDisplayRef.current) {
          timeLeftDisplayRef.current = remainingCeil;
          setTimeLeft(remainingCeil);
        }

        const isDeath = remaining <= DEATH_MODE_THRESHOLD;

        // Death Mode Alarm trigger
        if (isDeath && !deathModeTriggeredRef.current) {
          deathModeTriggeredRef.current = true;
          arcadeAudio.death();
        }

        // Death Mode countdown tick per second
        if (isDeath && remainingCeil !== lastTickedSecondRef.current && remainingCeil > 0 && remainingCeil <= 10) {
          lastTickedSecondRef.current = remainingCeil;
          arcadeAudio.tick();
        }

        // Dynamic speed scaling & spawn pacing
        const progress = Math.min(1, elapsed / 30);
        const baseSpeed = 1.15 + progress * 0.45;
        const speedMult = Math.min(isDeath ? 1.95 : 1.7, baseSpeed + (isDeath ? 0.18 : 0));
        const baseInterval = 0.75 - progress * 0.2;
        const spawnInterval = Math.max(isDeath ? 0.42 : 0.55, baseInterval - (isDeath ? 0.1 : 0));

        if (now - lastSpawnTimeRef.current > spawnInterval * 1000) {
          lastSpawnTimeRef.current = now;
          targetsRef.current.push(spawnTarget(nextTargetIdRef.current++, -0.06, speedMult));
          if (isDeath && Math.random() < 0.25) {
            targetsRef.current.push(spawnTarget(nextTargetIdRef.current++, -0.14, speedMult));
          }
        }

        // Update target positions & collision detection
        const paddleCurrentX = paddleXRef.current;
        const paddleY = 0.88;
        const paddleHalfWidth = 0.09;
        const nextTargets = [];

        for (const t of targetsRef.current) {
          t.y += t.vy * speedMult * dt;

          // Catch collision condition
          if (t.y >= paddleY && t.y <= paddleY + 0.06 && Math.abs(t.x - paddleCurrentX) < paddleHalfWidth) {
            const addPoints = t.bonus ? 5 : 1;
            setScore((prev) => prev + addPoints);
            scoreRef.current += addPoints;

            const particleColor = t.bonus ? "270 95% 65%" : "195 100% 55%";
            const popupColor = t.bonus ? "270 95% 65%" : "195 100% 55%";
            const popupText = t.bonus ? "+5 BONUS!" : POPUP_PHRASES[Math.floor(Math.random() * POPUP_PHRASES.length)];

            spawnParticles(t.x, paddleY, particleColor);
            spawnPopup(t.x, paddleY - 0.05, popupText, popupColor);

            if (t.bonus) {
              arcadeAudio.bonus();
            } else {
              arcadeAudio.catch();
            }
            continue;
          }

          // Miss condition
          if (t.y > 1.05) {
            arcadeAudio.miss();
            continue;
          }

          nextTargets.push(t);
        }
        targetsRef.current = nextTargets;

        // Particle physics
        for (const p of particlesRef.current) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 0.6 * dt; // gravity
          p.life -= dt;
        }
        if (particlesRef.current.length > 120) {
          particlesRef.current.splice(0, particlesRef.current.length - 120);
        }
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

        // Check for round end
        if (remaining <= 0) {
          finishGame();
        }
      }

      renderCanvas();
    };

    animId = requestAnimationFrame(loop);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [present, spawnTarget, finishGame, renderCanvas, handRef]);

  // Responsive Canvas Resize Observer
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const width = container.clientWidth;
      const height = container.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse / Pointer fallback movement handler
  const handlePointerMove = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    pointerXRef.current = Math.min(1, Math.max(0, normX));
  };

  // Ensure window scroll is reset on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isDeathMode = gameState === "playing" && timeLeft <= DEATH_MODE_THRESHOLD;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden arcade-arena-viewport select-none touch-none"
      onPointerMove={handlePointerMove}
      data-testid="arcade-game-container"
    >
      {/* Hidden camera video feed used for MediaPipe analysis */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Primary HTML5 Canvas Renderer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Death Mode Pulsating Screen Tint */}
      {isDeathMode && <div className="absolute inset-0 pointer-events-none arcade-death-vignette" />}

      {/* Cyberpunk Top HUD */}
      <header className="arcade-game-hud" aria-label="Game HUD">
        {/* Left: Score HUD Panel */}
        <div className="hud-panel left-panel">
          <div className="hud-metric-label">SCORE</div>
          <div
            className={`hud-metric-value ${isDeathMode ? "danger-mode" : "cyan-mode"}`}
            data-testid="game-score-display"
          >
            {String(score).padStart(2, "0")}
          </div>
          <div className="hud-sub-metric">
            <span className="pilot-name">{playerName}</span>
            <span className="ai-target-tag">AI: {AI_BENCHMARK_SCORE} 🤖</span>
          </div>
        </div>

        {/* Center: Synapse Branding & Quick Controls */}
        <div className="hud-center-deck">
          <div className="hud-brand-chip">
            <img src="/assets/logo.png" width={28} height={28} alt="Synapse logo" className="hud-logo-mini" />
            <span className="hud-brand-text">SYNAPSE</span>
            <span className="live-status-dot" />
          </div>
          <div className="hud-controls-pill">
            <button
              className="arcade-hud-btn"
              onClick={() => setMuted((prev) => !prev)}
              title={muted ? "Unmute Sound" : "Mute Sound"}
              aria-label={muted ? "Unmute Sound" : "Mute Sound"}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            {gameState === "playing" && (
              <button
                className="arcade-hud-btn"
                onClick={() => setIsPaused((prev) => !prev)}
                title={isPaused ? "Resume Game" : "Pause Game"}
                aria-label={isPaused ? "Resume Game" : "Pause Game"}
              >
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            )}
            <button
              className="arcade-hud-btn exit-btn"
              onClick={onExit}
              title="Return to Main Menu"
              aria-label="Return to Main Menu"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Right: Timer & Death Mode */}
        <div className="hud-panel right-panel">
          <div className="hud-metric-label">TIME REMAINING</div>
          <div
            className={`hud-metric-value ${
              isDeathMode ? "danger-mode animate-pulse" : "purple-mode"
            }`}
            data-testid="game-time-display"
          >
            {String(timeLeft).padStart(2, "0")}
          </div>
          {isDeathMode ? (
            <div className="death-mode-alert-badge" data-testid="death-mode-badge">
              <span className="alert-blink-dot" /> DEATH MODE 🔥
            </div>
          ) : (
            <div className="hud-sub-metric">
              <span className="match-clock-tag">40S ARENA</span>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Telemetry Status Bar */}
      <footer className="arcade-status-ticker" aria-live="polite">
        <div className="ticker-capsule">
          {error ? (
            <span className="ticker-alert-error">⚠ {error} — Mouse drag controls active</span>
          ) : ready ? (
            present ? (
              <span className="ticker-active">
                <span className="live-status-dot" /> Tracking active · <strong className="text-neon-cyan">✊ Fist = pause</strong> · <strong className="text-neon-cyan">🖐 Open palm = resume</strong>
              </span>
            ) : (
              <span className="ticker-waiting">✋ Show hand to camera or drag with mouse to steer basket</span>
            )
          ) : (
            <span className="ticker-loading">⚡ Initializing MediaPipe AI Vision neural model…</span>
          )}
        </div>
      </footer>

      {/* Countdown Overlay */}
      {gameState === "countdown" && (
        <div className="arcade-countdown-backdrop">
          <div className="countdown-card animate-pop-in" key={countdown}>
            <div className="countdown-eyebrow">
              GET READY, {playerName.toUpperCase()}
            </div>
            <div className="countdown-number">
              {countdown > 0 ? countdown : "GO!"}
            </div>
            <div className="countdown-hint">STEER BASKET WITH INDEX FINGERTIP</div>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && gameState === "playing" && (
        <div className="arcade-pause-backdrop">
          <div className="arcade-pause-card animate-pop-in">
            <div className="deck-corner-bracket top-left" aria-hidden="true" />
            <div className="deck-corner-bracket top-right" aria-hidden="true" />
            <div className="deck-corner-bracket bottom-left" aria-hidden="true" />
            <div className="deck-corner-bracket bottom-right" aria-hidden="true" />

            <div className="pause-icon-halo">
              <Pause size={30} className="text-neon-cyan" />
            </div>
            <h2 className="pause-title">TACTICAL PAUSE</h2>
            <p className="pause-instructions">
              Open your palm toward camera or click below to resume
            </p>

            <div className="pause-actions-deck">
              <button
                className="arcade-deploy-btn pause-resume-btn"
                onClick={() => setIsPaused(false)}
              >
                <span className="btn-content">
                  <Play size={18} className="fill-current" />
                  <span>RESUME ARENA</span>
                </span>
              </button>
              <button
                className="secondary-cyber-btn"
                onClick={onExit}
              >
                <LogOut size={16} />
                <span>ABANDON MATCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Complete Game Over Modal */}
      {gameState === "ended" && (
        <GameOverModal
          score={score}
          playerName={playerName}
          leaderboard={leaderboard}
          isHighScore={isHighScore}
          rankTitle={getRankTitle(score)}
          onPlayAgain={restartGame}
          onExit={onExit}
        />
      )}
    </div>
  );
}
