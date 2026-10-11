import React, { useState, useEffect } from "react";
import {
  Hand,
  Pause,
  Bot,
  Volume2,
  VolumeX,
  Trophy,
  Info,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Swords,
  Award,
  Terminal,
  Play,
  Zap,
  Sparkles,
  Shield,
  Crosshair
} from "lucide-react";
import { getLeaderboard, AI_BENCHMARK_SCORE } from "../utils/leaderboard";
import { arcadeAudio } from "../utils/arcadeAudio";

export function LandingPage({
  playerName,
  setPlayerName,
  onStartGame,
  gameMode = "arcade",
  setGameMode,
  muted,
  setMuted
}) {
  const [showExplainer, setShowExplainer] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName || !playerName.trim()) return;
    arcadeAudio.start();
    onStartGame();
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    arcadeAudio.setMuted(next);
  };

  return (
    <section className="arcade-page-wrapper" aria-label="Synapse Gesture Arena Landing">
      {/* Background Cyber Grid & Ambient Lighting */}
      <div className="cyber-ambient-glow glow-cyan" aria-hidden="true" />
      <div className="cyber-ambient-glow glow-violet" aria-hidden="true" />
      <div className="cyber-grid-canvas" aria-hidden="true" />
      <div className="cyber-scanlines" aria-hidden="true" />

      {/* Top Navigation HUD Bar */}
      <header className="arcade-top-nav">
        <div className="nav-brand-badge">
          <span className="live-status-dot" />
          <span className="nav-brand-text">EDGE AI VISION CORE · V1.0</span>
        </div>
        <div className="nav-actions">
          <button
            className="arcade-hud-btn"
            onClick={toggleSound}
            title={muted ? "Unmute Sound" : "Mute Sound"}
            aria-label={muted ? "Unmute Sound" : "Mute Sound"}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span className="hud-btn-label">{muted ? "MUTED" : "AUDIO ON"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="arcade-main-container">
        {/* Hero Branding Section */}
        <div className="arcade-hero-header">
          {/* Logo Hologram Container */}
          <div className="arcade-logo-halo">
            <div className="logo-ring-pulse" />
            <img
              src="/assets/logo.png"
              width={100}
              height={100}
              alt="Synapse AI Logo"
              className="arcade-logo-img"
            />
          </div>

          {/* Eyebrow Status */}
          <div className="arcade-eyebrow">
            <Sparkles size={13} className="text-neon-cyan" />
            <span>TOUCHLESS COMPUTER VISION ARENA</span>
            <Sparkles size={13} className="text-neon-cyan" />
          </div>

          {/* Cinematic Title */}
          <h1 className="arcade-title">
            <span className="title-cyan">SYNAPSE</span>
            <span className="title-purple">GESTURE ARENA</span>
          </h1>

          <p className="arcade-subtitle">
            Zero touch. Pure reflex. <span className="highlight-text">Outplay the AI.</span>
          </p>
        </div>

        {/* Operator Launch Deck */}
        <div className="arcade-terminal-deck">
          <div className="deck-corner-bracket top-left" aria-hidden="true" />
          <div className="deck-corner-bracket top-right" aria-hidden="true" />
          <div className="deck-corner-bracket bottom-left" aria-hidden="true" />
          <div className="deck-corner-bracket bottom-right" aria-hidden="true" />

          <form onSubmit={handleSubmit} className="arcade-launch-form">
            {/* Input Section */}
            <div className="callsign-section">
              <div className="callsign-header">
                <label htmlFor="playerNameInput" className="callsign-label">
                  <Terminal size={15} className="text-neon-cyan" />
                  <span>OPERATOR CALLSIGN</span>
                </label>
                <span className="callsign-char-limit">MAX 16 CHARS</span>
              </div>

              <div className="callsign-input-wrapper">
                <input
                  type="text"
                  id="playerNameInput"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="ENTER CALLSIGN (E.G. CYBERPILOT)"
                  autoComplete="off"
                  spellCheck={false}
                  className="player-callsign-input"
                  aria-label="Operator Callsign"
                />
              </div>

              {(!playerName || !playerName.trim()) && (
                <div className="callsign-tip">
                  <span className="pulse-prompt">▶</span> Type your callsign above to activate the launch sequence
                </div>
              )}
            </div>

            {/* Mode Selection Cards */}
            <div className="mode-selection-deck">
              <div className="mode-deck-label">SELECT MISSION MODE:</div>
              <div className="mode-cards-grid">
                <button
                  type="button"
                  className={`mode-card ${gameMode === "arcade" ? "active" : ""}`}
                  onClick={() => setGameMode("arcade")}
                  aria-pressed={gameMode === "arcade"}
                >
                  <div className="mode-card-header">
                    <Crosshair size={18} className="mode-card-icon" />
                    <span className="mode-card-title">Arcade Pulse</span>
                    {gameMode === "arcade" && <span className="mode-active-pill">ACTIVE</span>}
                  </div>
                  <p className="mode-card-desc">
                    Catch falling cyan & purple pulses. Survive final 10s DEATH MODE.
                  </p>
                </button>

                <button
                  type="button"
                  className={`mode-card ${gameMode === "duel" ? "active" : ""}`}
                  onClick={() => setGameMode("duel")}
                  aria-pressed={gameMode === "duel"}
                >
                  <div className="mode-card-header">
                    <Swords size={18} className="mode-card-icon" />
                    <span className="mode-card-title">Cyber Duel (RPS)</span>
                    {gameMode === "duel" && <span className="mode-active-pill">ACTIVE</span>}
                  </div>
                  <p className="mode-card-desc">
                    Real-time Rock-Paper-Scissors neural showdown against the AI bot.
                  </p>
                </button>
              </div>
            </div>

            {/* Primary Launch CTA Button */}
            <button
              type="submit"
              disabled={!playerName || !playerName.trim()}
              className="arcade-deploy-btn"
              aria-label="Deploy to Arena"
            >
              <span className="btn-ambient-glow" />
              <span className="btn-content">
                <Play size={20} className="fill-current" />
                <span>DEPLOY TO ARENA</span>
              </span>
            </button>
          </form>
        </div>

        {/* Gesture Telemetry HUD Cards */}
        <div className="telemetry-deck">
          <div className="telemetry-card">
            <div className="telemetry-icon-box cyan">
              <Hand size={20} />
            </div>
            <div className="telemetry-content">
              <div className="telemetry-label">STEER & RESUME</div>
              <div className="telemetry-val">🖐 Open Palm / Index Finger</div>
              <div className="telemetry-sub">Follows index tip · Open palm unfreezes</div>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-icon-box purple">
              <Pause size={20} />
            </div>
            <div className="telemetry-content">
              <div className="telemetry-label">HOLD TO PAUSE</div>
              <div className="telemetry-val">✊ Clenched Fist</div>
              <div className="telemetry-sub">Hold for 0.4s to freeze arena time</div>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-icon-box gold">
              <Bot size={20} />
            </div>
            <div className="telemetry-content">
              <div className="telemetry-label">AI BENCHMARK</div>
              <div className="telemetry-val">🤖 {AI_BENCHMARK_SCORE} Points</div>
              <div className="telemetry-sub">Beat 35 to earn AI SLAYER title</div>
            </div>
          </div>
        </div>

        {/* Tournament Leaderboard Card */}
        <div className="arcade-leaderboard-card">
          <div className="leaderboard-card-header">
            <div className="header-title-wrap">
              <Trophy size={18} className="text-gold-accent" />
              <h2 className="leaderboard-card-title">HALL OF FAME · TOP OPERATORS</h2>
            </div>
            <span className="leaderboard-sub-pill">LOCAL PERSISTENT</span>
          </div>

          <ul className="leaderboard-card-list">
            {leaderboard.length === 0 ? (
              <li className="leaderboard-empty-row">
                <span className="empty-icon">🛡️</span>
                <span>No mission records yet. Enter your callsign and claim #1!</span>
              </li>
            ) : (
              leaderboard.map((item, idx) => {
                const isChampion = idx === 0;
                const isPodium = idx <= 2;
                return (
                  <li
                    key={`landing-lb-${idx}-${item.score}`}
                    className={`leaderboard-card-row ${isChampion ? "rank-champion" : isPodium ? "rank-podium" : ""}`}
                  >
                    <div className="row-left">
                      <span className={`rank-tag rank-${idx + 1}`}>
                        {idx === 0 ? "👑 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                      </span>
                      <span className="operator-name">{item.name}</span>
                    </div>
                    <div className="row-right">
                      <span className="operator-score">{item.score}</span>
                      <span className="score-units">PTS</span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Technical Architecture Dossier (Collapsible) */}
        <div className="arcade-dossier-wrapper">
          <button
            onClick={() => setShowExplainer((prev) => !prev)}
            className="dossier-toggle-btn"
            aria-expanded={showExplainer}
          >
            <Info size={16} className="text-neon-cyan" />
            <span>TECHNICAL ARCHITECTURE & JUDGE BRIEFING</span>
            {showExplainer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showExplainer && (
            <div className="arcade-dossier-content animate-pop-in">
              <div className="dossier-badge-row">
                <span className="tech-badge cyan">MediaPipe Tasks 0.10.x</span>
                <span className="tech-badge violet">WASM SIMD Acceleration</span>
                <span className="tech-badge gold">WebGL GPU Delegate</span>
                <span className="tech-badge green">100% Client-Side Privacy</span>
              </div>

              <p className="dossier-text">
                Synapse Gesture Arena processes video streams at <strong>60 FPS</strong> using an in-browser neural landmarker.
                By detecting <strong>21 3D joint landmarks</strong> per frame and applying adaptive exponential moving average (EMA)
                jitter filtering, the system steers the basket with zero perceived latency.
              </p>

              <div className="dossier-features-grid">
                <div className="feature-block">
                  <Shield size={16} className="text-neon-cyan" />
                  <div>
                    <strong>Edge Privacy Guarantee</strong>
                    <p>All inference executes in browser memory. No camera frames or biometrics ever touch a server.</p>
                  </div>
                </div>
                <div className="feature-block">
                  <Zap size={16} className="text-neon-purple" />
                  <div>
                    <strong>WASM Offline Binaries</strong>
                    <p>Bundled local WebAssembly binaries ensure rapid startup with automatic CDN resilience fallback.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="arcade-footer">
          <div className="footer-line">
            <span>SYNAPSE AI CLUB</span>
            <span className="footer-dot">·</span>
            <span>DATA SCIENCE & AGENTIC AI</span>
            <span className="footer-dot">·</span>
            <span>TOUCHLESS INTERFACE EXPERIENCE</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
