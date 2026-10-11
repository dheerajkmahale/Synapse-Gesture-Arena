import React, { useState, useEffect } from "react";
import { Hand, Pause, Bot, Volume2, VolumeX, Trophy, Info, ChevronDown, ChevronUp, Gamepad2, Swords, Award } from "lucide-react";
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
    <section className="landing min-h-screen w-full relative overflow-hidden grid-bg flex flex-col items-center justify-center p-6" aria-label="Synapse Gesture Arena Landing">
      {/* Top Floating Controls */}
      <div className="landing-top-bar absolute top-6 right-6 z-20">
        <button
          className="arcade-hud-btn"
          onClick={toggleSound}
          title={muted ? "Unmute audio" : "Mute audio"}
          aria-label={muted ? "Unmute audio" : "Mute audio"}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Ambient Cyber Light Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-neon-blue/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-neon-purple/20 blur-3xl" aria-hidden="true" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center py-8">
        {/* Synapse Logo */}
        <div className="logo-container mb-4">
          <img
            src="/assets/logo.png"
            width={120}
            height={120}
            alt="Synapse Gesture Arena Logo"
            className="drop-shadow-[0_0_30px_hsl(195_100%_55%/0.6)] mx-auto"
          />
        </div>

        {/* Big Eyebrow & Hero Title */}
        <div className="font-display font-black text-4xl md:text-6xl text-neon tracking-wide mb-2 animate-pop-in">
          NO TOUCH GAME 🤖
        </div>

        <h1 className="font-display font-bold text-xl md:text-2xl text-neon-purple tracking-[0.3em] mb-3">
          SYNAPSE GESTURE ARENA
        </h1>

        <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-lg">
          Play without touching. <span className="text-neon font-bold">Beat the AI.</span>
        </p>

        {/* Player Name & Launch Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-stretch gap-4 mb-6">
          <div className="input-wrap">
            <label htmlFor="playerNameInput" className="sr-only">Player Name</label>
            <input
              type="text"
              id="playerNameInput"
              maxLength={16}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="off"
              className="w-full px-5 py-4 text-center text-xl font-display tracking-widest bg-card/70 border border-border rounded-xl text-foreground outline-none focus:border-neon-blue focus:glow-blue transition"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className={`mode-pill ${gameMode === "arcade" ? "active" : ""}`}
              onClick={() => setGameMode("arcade")}
            >
              <Gamepad2 size={15} /> Arcade Pulse (Official)
            </button>
            <button
              type="button"
              className={`mode-pill ${gameMode === "duel" ? "active" : ""}`}
              onClick={() => setGameMode("duel")}
            >
              <Swords size={15} /> Cyber Duel (RPS)
            </button>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            disabled={!playerName || !playerName.trim()}
            className="w-full px-10 py-4 font-display font-black tracking-widest text-xl bg-gradient-neon text-primary-foreground rounded-xl glow-blue hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 animate-pulse-glow"
          >
            START GAME ▶
          </button>
        </form>

        {/* Quick Rules Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm max-w-lg w-full mb-6">
          <div className="rule-pill">
            <Hand size={16} className="text-neon" />
            <span>🖐 Open palm = play</span>
          </div>
          <div className="rule-pill">
            <Pause size={16} className="text-neon-purple" />
            <span>✊ Fist = pause</span>
          </div>
          <div className="rule-pill">
            <Bot size={16} className="text-gold-accent" />
            <span>🤖 AI score: {AI_BENCHMARK_SCORE}</span>
          </div>
        </div>

        {/* How Does It Work Accordion Toggle */}
        <button
          onClick={() => setShowExplainer((prev) => !prev)}
          className="text-muted-foreground hover:text-neon underline underline-offset-4 transition text-sm flex items-center gap-1.5 mb-6"
        >
          <Info size={15} />
          {showExplainer ? "Hide details" : "How does it work?"}
          {showExplainer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Expandable Info Section for Judges */}
        {showExplainer && (
          <div className="max-w-xl w-full text-left bg-card/80 border border-border rounded-xl p-6 mb-8 animate-pop-in">
            <div className="font-display tracking-widest text-neon-purple text-xs font-bold mb-2">
              FOR JUDGES & VISITORS
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              This system uses <strong className="text-neon">AI computer vision</strong> to track your hand and convert
              gestures into controls in real time. We detect 21 hand landmarks per frame and follow your index fingertip
              to steer the basket — no controller, no physical touch.
            </p>
            <ul className="mt-3 text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Real-world uses: touchless kiosks, sterile health environments, AR/VR, and accessibility.</li>
              <li>Powered by Google MediaPipe Vision running 100% locally in your browser.</li>
              <li>Zero latency edge inference, no video or biometric data leaves your machine.</li>
              <li>Built by the Synapse Student AI Club.</li>
            </ul>
          </div>
        )}

        {/* Top 5 Leaderboard Display */}
        {leaderboard.length > 0 && (
          <div className="w-full max-w-md bg-card/60 border border-border rounded-xl p-5 mb-6">
            <div className="font-display tracking-widest text-xs text-muted-foreground mb-3 flex items-center justify-center gap-2">
              <Award size={15} className="text-gold-accent" /> TOP 5 LEADERBOARD
            </div>
            <ul className="space-y-2">
              {leaderboard.map((item, idx) => (
                <li
                  key={`landing-lb-${idx}`}
                  className={`flex items-center justify-between font-display text-base px-3 py-2 rounded-lg ${
                    idx === 0 ? "bg-gradient-neon text-primary-foreground font-bold" : "bg-muted/40"
                  }`}
                >
                  <span>
                    {idx === 0 ? "👑" : `#${idx + 1}`} {item.name}
                  </span>
                  <span className="font-black">{item.score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <footer className="text-xs text-muted-foreground tracking-widest font-display">
          A SYNAPSE AI CLUB EXPERIENCE · ZERO-TOUCH INTERFACE
        </footer>
      </div>
    </section>
  );
}
