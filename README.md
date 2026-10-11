# ⚡ Synapse Gesture Arena — No Touch AI Game

> **Play without touching. Beat the AI.**  
> A cyberpunk, camera-powered arcade game built with **React 18**, **Vite**, and **Google MediaPipe Tasks Vision**.  
> Live Inspiration: [synapse-gesture-pulse-arena.lovable.app](https://synapse-gesture-pulse-arena.lovable.app/) · Created for **Synapse Student AI Club**.

![Synapse Gesture Arena](https://img.shields.io/badge/Vision-MediaPipe_Tasks_0.10.35-20d5ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-a855f7?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-6.0-34d399?style=for-the-badge)
![Status](https://img.shields.io/badge/Tests-34%20Passing%20(100%25)-34d399?style=for-the-badge)
![License](https://img.shields.io/badge/Edge%20AI-100%25%20In--Browser-facc15?style=for-the-badge)

---

## 🕹️ 1. Project Overview

**Synapse Gesture Arena** is a futuristic, neon-cyberpunk browser game where players control gameplay in real-time **purely using hand gestures captured through their webcam**. No mouse, keyboard, or controller is needed during gameplay.

The application includes two distinct game modes:
1. **Arcade Pulse (Official Reference Mode)**: Falling cyan energy targets (+1) and rare purple bonus targets (+5) fall from the top of the arena. Players steer a glowing horizontal basket using their **index fingertip (landmark 8)** to catch targets before they hit the ground. When the 40-second timer drops to 10 seconds, the arena triggers **DEATH MODE 🔥** with red pulsating alerts, rapid spawning, and intense warning sirens.
2. **Cyber Duel (Rock-Paper-Scissors Mode)**: Real-time hand duel against an adaptive neural AI opponent with instant gesture feedback (Fist = Rock, Palm = Paper, Point = Scissors) and continuous or Best-of-5 scoring.

---

## ✨ 2. Key Features

- **Cyberpunk UI & Visual Excellence**:
  - Neon cyan (`#20D5FF`), purple (`#A855F7`), and alert red (`#FF2A55`) aesthetic.
  - High-DPI HTML5 `<canvas>` rendering with delta-time ($dt$) physics and exponential smoothing (`lerp`).
  - Animated cyber grid background, ambient radial glows, and typography from Google Fonts (`Orbitron` & `Rajdhani`).
- **Touchless Real-Time Vision Pipeline**:
  - Real-time 21 hand landmarks tracking via **Google MediaPipe Hand Landmarker**.
  - Local offline assets: WASM binaries bundled in `public/wasm/` and float16 neural model in `public/models/hand_landmarker.task` (with CDN auto-fallback).
  - Mirrored tracking with adaptive smoothing ($A \leftarrow A + (x_{hand} - A) \times (1 - e^{-18 dt})$).
- **Gesture Control Mechanics**:
  - 🖐 **Open Palm**: Resumes gameplay immediately.
  - ✊ **Fist**: Pauses gameplay when held for $\ge 0.35$s.
  - 👆 **Index Fingertip (Landmark 8)**: Steers the basket smoothly across the bottom boundary.
  - 🖱️ **Touch / Pointer Fallback**: Allows mouse/touch drag navigation if camera access is unavailable or denied.
- **Arcade Gameplay & Death Mode**:
  - 40-second match countdown.
  - **Regular Targets** (+1): Glowing cyan spheres with random hit popups (`Nice!`, `Perfect!`, `Great!`, `+1`, `Boom!`).
  - **Bonus Targets** (+5): Rare purple glowing spheres (8% spawn rate) with distinct chime and `+5 BONUS!` banner.
  - **Exploding Particles**: Radial 14-particle burst on every catch with velocity, gravity, and lifetime decay.
  - **DEATH MODE 🔥 ($\le 10$s)**: Red screen pulse overlay, sinister warning siren, rapid spawning (25% double target chance), and high velocity.
- **AI Benchmark & Local Leaderboard**:
  - AI Target Benchmark: **35 Points 🤖**.
  - Rank Titles:
    - $\ge 50$ pts: `AI SLAYER 😎`
    - $\ge 35$ pts: `PRO PLAYER 🔥`
    - $\ge 20$ pts: `ALMOST THERE 😏`
    - $< 20$ pts: `TRY AGAIN 😂`
  - Persistent Top 5 Leaderboard saved in `localStorage` (`sga_leaderboard_v1`).
- **Pure Web Audio API Sound Synthesizer**:
  - 100% procedural Web Audio synthesizer: catch chime, bonus fanfare, miss buzz, countdown tick, death alarm, high score fanfare, and start tones. No external MP3/WAV files required.
- **Privacy & Security**:
  - 100% client-side execution. No video frames, biometric data, or camera feeds are ever sent over a network.

---

## 🛠️ 3. Technology Stack

- **Framework**: React 18 (`react`, `react-dom`)
- **Bundler & Tooling**: Vite 6
- **Computer Vision**: `@mediapipe/tasks-vision` (Hand Landmarker Model)
- **Audio Synthesis**: Native Web Audio API
- **Icons**: `lucide-react`
- **Unit Testing**: Vitest 5 (34 passing test cases)
- **Styling**: Cyberpunk design system + Tailwind utility tokens (`src/lovable.css` & `src/styles.css`)

---

## 🚀 4. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Modern browser with WebRTC webcam support (Chrome, Edge, Brave, Safari, Firefox).

### Installation & Development Server
```bash
# Clone or navigate to the project directory
cd synapse-gesture-arena

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Unit Tests
```bash
npm test
```
Runs the Vitest test suite testing scoring logic, leaderboard persistence, collision physics, camera diagnostic handling, and gesture classification.

### Building for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` folder ready for deployment on Vercel, Netlify, or GitHub Pages.

---

## 🎮 5. How to Play

1. **Enter Your Callsign**: Type your player name in the input box on the landing page.
2. **Choose Mode**:
   - **Arcade Pulse (Official)**: Catch falling cyan & purple targets, trigger Death Mode, and beat AI score 35.
   - **Cyber Duel (RPS)**: Classic Rock-Paper-Scissors hand battle against the AI bot.
3. **Allow Camera Permission**: Allow camera access when prompted by the browser.
4. **Position Your Hand**: Hold your hand 1.5–3 feet from the webcam with good lighting.
5. **Control the Basket**:
   - Move your **index fingertip** left and right to steer the basket and catch falling targets.
   - ✊ **Make a Fist** for 0.4s to pause the game.
   - 🖐 **Open your Palm** to resume immediately.
   - *(Optional)* Drag with mouse if playing without a camera.
6. **Beat the AI**: Catch as many targets as you can before the 40-second timer hits 0. Try to surpass the AI benchmark of 35 points to earn the `AI SLAYER 😎` title!

---

## 📂 6. Project Architecture

```
synapse-gesture-arena/
├── public/
│   ├── assets/
│   │   └── logo.png                  # Official Synapse emblem
│   ├── models/
│   │   └── hand_landmarker.task      # Local MediaPipe Tasks Vision model (7.8 MB)
│   └── wasm/                         # Local MediaPipe Tasks Vision WASM binaries
│       ├── vision_wasm_internal.wasm
│       ├── vision_wasm_internal.js
│       └── ...
├── src/
│   ├── components/
│   │   ├── ArcadeGame.jsx            # Canvas game loop, physics, HUD, pause overlay
│   │   ├── GameOverModal.jsx         # Mission complete modal & Top 5 leaderboard
│   │   ├── LandingPage.jsx           # Cyberpunk landing screen, rules & mode switch
│   │   ├── GameDashboard.jsx         # Duel mode (Rock-Paper-Scissors)
│   │   ├── CameraView.jsx            # Mirrored video feed with skeleton overlay
│   │   ├── Emblems.jsx               # Cyber SVG graphics
│   │   └── ...
│   ├── hooks/
│   │   ├── useArcadeHandTracking.js  # Low-latency MediaPipe vision hook with EMA lerp
│   │   └── useHandTracking.js        # Duel gesture tracker with camera diagnostics
│   ├── utils/
│   │   ├── arcadeAudio.js            # Pure Web Audio synthesizer
│   │   ├── leaderboard.js            # Local storage score persistence & rank generator
│   │   ├── camera.js                 # Safe getUserMedia & diagnostic error engine
│   │   └── gameLogic.js              # Scoring & duel game mechanics
│   ├── App.jsx                       # Main application shell & router
│   ├── main.jsx                      # React 18 root mounting
│   ├── lovable.css                   # Cyberpunk utilities & layout tokens
│   └── styles.css                    # Custom cyberpunk themes, animations & glow effects
└── package.json
```

---

## 🛡️ 7. Browser Permissions & Troubleshooting

- **"Camera Access Required"**: Click the padlock icon in the browser address bar, set Camera to **Allow**, and click "Try Again".
- **Camera in Use by Another Application**: If another application (Zoom, Teams, Discord) is locking the webcam, close it and refresh.
- **Playing Without a Camera**: The game features an automatic mouse/pointer tracking fallback so all gameplay mechanics are 100% playable on devices without a webcam.

---

## 👥 Credits

Developed for the **Synapse Student AI Club** (Data Science & Agentic AI Club).  
Inspired by the touchless arcade vision demonstrated at `synapse-gesture-pulse-arena.lovable.app`.
