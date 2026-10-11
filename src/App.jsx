import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ArcadeGame } from "./components/ArcadeGame";
import { GameDashboard } from "./components/GameDashboard";
import { sanitizePlayerName } from "./utils/gameLogic";

export default function App() {
  const [screen, setScreen] = useState("home"); // "home" | "game"
  const [playerName, setPlayerName] = useState("");
  const [gameMode, setGameMode] = useState("arcade"); // "arcade" | "duel"
  const [muted, setMuted] = useState(false);

  const handleStartGame = () => {
    window.scrollTo(0, 0);
    setPlayerName((prev) => sanitizePlayerName(prev));
    setScreen("game");
  };

  const handleExitGame = () => {
    window.scrollTo(0, 0);
    setScreen("home");
  };

  return (
    <main className="app-shell min-h-screen w-full bg-background text-foreground">
      {screen === "home" ? (
        <LandingPage
          playerName={playerName}
          setPlayerName={setPlayerName}
          onStartGame={handleStartGame}
          gameMode={gameMode}
          setGameMode={setGameMode}
          muted={muted}
          setMuted={setMuted}
        />
      ) : gameMode === "arcade" ? (
        <ArcadeGame
          playerName={playerName || "Player"}
          onExit={handleExitGame}
          initialMuted={muted}
        />
      ) : (
        <GameDashboard
          playerName={playerName || "Player"}
          gameMode="continuous"
          muted={muted}
          setMuted={setMuted}
          onExitGame={handleExitGame}
        />
      )}
    </main>
  );
}