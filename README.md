# ⚡ Synapse Gesture Arena — AI-Powered Gesture-Controlled Arcade Game

> **Play without touching. Beat the AI.**  
> A touchless neon-cyberpunk browser arcade game powered by real-time computer vision, running client-side machine learning directly in the browser.

[![Live Demo](https://img.shields.io/badge/Live_Demo-synapse--gesture--arena.vercel.app-20d5ff?style=for-the-badge&logo=vercel)](https://synapse-gesture-arena.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Synapse--Gesture--Arena-a855f7?style=for-the-badge&logo=github)](https://github.com/dheerajkmahale/Synapse-Gesture-Arena)
[![Vision](https://img.shields.io/badge/Vision-MediaPipe_Tasks_Vision-20d5ff?style=for-the-badge)](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-36_Passing_(100%25)-34d399?style=for-the-badge)](https://vitest.dev/)
[![Edge AI](https://img.shields.io/badge/Inference-100%25_Client--Side-facc15?style=for-the-badge)](https://github.com/dheerajkmahale/Synapse-Gesture-Arena)

---

## 🔗 Quick Links

* **Live Application**: [https://synapse-gesture-arena.vercel.app](https://synapse-gesture-arena.vercel.app/)
* **Source Code**: [https://github.com/dheerajkmahale/Synapse-Gesture-Arena](https://github.com/dheerajkmahale/Synapse-Gesture-Arena)
* **Live Reference Inspiration**: [https://synapse-gesture-pulse-arena.lovable.app/](https://synapse-gesture-pulse-arena.lovable.app/)

---

## 🖼️ Application Preview

```
+-----------------------------------------------------------------------------------------+
|                                    SYNAPSE GESTURE ARENA                                |
|                                                                                         |
|   SCORE: 42                [ SYNAPSE CYBERPUNK HUD ]               TIME: 08             |
|   AI Benchmark: 35 🤖         (Mute | Pause | Exit)                DEATH MODE 🔥        |
|                                                                                         |
|       * (cyan energy target +1)                                                         |
|                                   * (purple bonus target +5)                            |
|                                                                                         |
|                                                                                         |
|                    [==== GLOWING NEON BASKET ====]                                      |
|                                   ^ (steered by index finger landmark 8)                |
|                                                                                         |
|   AI is tracking your hand in real time... [✊ Fist = Pause]  [🖐 Open Palm = Resume]    |
+-----------------------------------------------------------------------------------------+
```

> **Screenshot Instructions**:  
> To add real in-game screenshots to your repository:
> 1. Launch the game in your browser (`npm run dev` or visit the live Vercel URL).
> 2. Capture high-resolution screenshots of the **Landing Page**, **Arcade Gameplay with Hand Tracking Skeleton**, and **Mission Complete / Leaderboard Modal**.
> 3. Save images to `docs/screenshots/` and link them here using `![Gameplay](docs/screenshots/gameplay.png)`.

---

## 🕹️ Project Overview

**Synapse Gesture Arena** is a real-time, touchless browser arcade game. Players steer an energy basket using their **index fingertip in physical space** via their webcam to catch falling energy pulses, avoid hazards, and beat a benchmark AI score within a 40-second countdown.

The project demonstrates edge AI capabilities: zero-latency computer vision inference running completely inside the client's browser using WebAssembly (WASM) and WebGL/GPU acceleration. No server inference, no external APIs, and zero biometric data transmitted over the network.

---

## ✨ Key Features

1. **Touchless Real-Time Computer Vision Control**:
   * Uses **Google MediaPipe Hand Landmarker** to extract 21 3D hand coordinates on every video frame.
   * Tracks **Index Fingertip (Landmark 8)** mapped horizontally to direct the basket.
   * Adaptive exponential moving average smoothing ($1 - e^{-18 dt}$) filters micro-tremors while maintaining snappy response.

2. **Intuitive Gesture State Machine**:
   * **✊ Fist**: Pauses the game loop when held for $\ge 0.35$ seconds.
   * **🖐 Open Palm**: Instantly unpauses and resumes gameplay.
   * **Pause Duration Compensation**: Accurately freezes internal timers during pauses so countdown time and target spawns never suffer from drift.

3. **Arcade Dynamics & High-Velocity Gameplay**:
   * **Falling Cyan Pulses (+1 point)**: Regular targets with random arcade hit popups (`Nice!`, `Perfect!`, `Great!`, `Boom!`).
   * **Rare Purple Bonus Targets (+5 points)**: 8% spawn probability, accompanied by distinct acoustic signals.
   * **Particle Explosions**: 14 radial particles per catch with delta-time gravity, velocity, and alpha decay.

4. **DEATH MODE 🔥 (Final 10 Seconds)**:
   * Triggers automatically when time remaining $\le 10$ seconds.
   * Activates pulsating crimson emergency screen tint, alert sirens, accelerated target drop speeds, and dual-target spawn bursts.

5. **Local Persistent Leaderboard & AI Benchmark**:
   * **AI Benchmark Target**: 35 points 🤖.
   * Dynamic Rank Titles:
     * $\ge 50$ pts: `AI SLAYER 😎`
     * $\ge 35$ pts: `PRO PLAYER 🔥`
     * $\ge 20$ pts: `ALMOST THERE 😏`
     * $< 20$ pts: `TRY AGAIN 😂`
   * Persistent Top 5 leaderboard saved in browser `localStorage`.

6. **Procedural Web Audio API Synthesizer**:
   * Built without external audio assets. All sound effects (catch chimes, bonus fanfares, miss buzzers, countdown metronomes, death sirens, victory fanfares) are synthesized programmatically using native browser oscillators and gain envelopes.

7. **Dual Mode & Accessibility Fallback**:
   * Includes both **Arcade Pulse** (official reflex arcade) and **Cyber Duel** (Rock-Paper-Scissors vs AI bot).
   * Fully playable via **mouse and touchscreen fallback** when webcam hardware is unavailable or permissions are denied.
   * Keyboard accessibility shortcuts (`Enter` to play again, `Escape` to return home).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18 (`react`, `react-dom`) |
| **Build & Bundler** | Vite 6 |
| **Computer Vision Engine** | Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision` 0.10.x) |
| **Machine Learning Acceleration** | WebAssembly (WASM SIMD) + GPU Delegate |
| **Audio Engine** | Web Audio API (Native Procedural Synthesizer) |
| **Graphics Rendering** | HTML5 Canvas 2D Context (High-DPI scaled) |
| **State & Storage** | React Hooks (`useRef`, `useState`, `useEffect`, `useCallback`) + `localStorage` |
| **Testing** | Vitest 5 (36 passing automated unit tests) |
| **Deployment & Hosting** | Vercel (Edge Network with SPA Rewrites) |

---

## 🏛️ Architecture & Data Flow

```
+------------------+
|   User Webcam    |
+--------+---------+
         |
         | Raw video frames (requestAnimationFrame)
         v
+-------------------------------------------------------------+
|               Google MediaPipe Tasks Vision                 |
|  - FilesetResolver (local /wasm/ + CDN fallback)            |
|  - HandLandmarker (float16 neural model /models/)           |
+------------------------------+------------------------------+
                               |
                               | 21 3D Normalized Landmarks
                               v
+-------------------------------------------------------------+
|             useArcadeHandTracking Custom Hook               |
|  - Mirror X coordinate: 1 - Landmark[8].x                   |
|  - Exponential Smoothing (EMA): lerp(prev, target, alpha)   |
|  - Finger Extension Classifier: Open Palm vs Fist           |
+------------------------------+------------------------------+
                               |
                               | Smoothed Position & Gesture Events
                               v
+-------------------------------------------------------------+
|                     Arcade Game Engine                      |
|  - Delta-time (dt) game loop & target spawner               |
|  - Pause duration accumulator (drift-free timer)            |
|  - AABB collision detection & particle physics              |
|  - DEATH MODE velocity & frequency scaling                  |
+------------------------------+------------------------------+
                               |
         +---------------------+---------------------+
         |                                           |
         v                                           v
+------------------+                       +------------------+
|   HTML5 Canvas   |                       |  Web Audio API   |
|  - Cyber paddle  |                       |  - Hit chime     |
|  - Targets & FX  |                       |  - Bonus fanfare |
|  - Hand skeleton |                       |  - Death siren   |
+--------+---------+                       +------------------+
         |
         v
+-------------------------------------------------------------+
|              Scoring, UI HUD & Persistent State             |
|  - Real-time score & countdown sync                         |
|  - Top 5 Leaderboard (localStorage)                         |
|  - Mission Complete Game Over Modal                         |
+-------------------------------------------------------------+
```

---

## 🖐️ How Hand Tracking Works

1. **Camera Stream Capture**: The browser requests webcam access via `navigator.mediaDevices.getUserMedia` with video constraints tailored for 60fps tracking.
2. **Landmark Inference**: The MediaPipe `HandLandmarker` singleton processes the `<video>` element, identifying 21 key joints (wrist, knuckles, PIP joints, and fingertips).
3. **Paddle Steering**: Landmark 8 (index fingertip) horizontal position is mirrored and dynamically normalized:
   $$\text{targetX} = \text{clamp}\left((\text{mirroredX} - 0.5) \times 1.45 + 0.5, 0, 1\right)$$
4. **Adaptive Smoothing**: An exponential moving average algorithm reduces jitter while allowing immediate reaction to rapid sweeps:
   $$\text{paddleX}_{t} = \text{paddleX}_{t-1} + (\text{targetX} - \text{paddleX}_{t-1}) \times (1 - e^{-18 \cdot dt})$$
5. **Gesture Classification**:
   * **Open Palm**: Detected when 4 or more fingertips are extended beyond their respective proximal interphalangeal (PIP) joints.
   * **Fist**: Detected when 1 or fewer fingertips are extended, held continuously for $\ge 0.35$ seconds.

---

## 🎮 Gesture Controls Reference

| Input | Physical Action | In-Game Result |
| :--- | :--- | :--- |
| **Index Fingertip** | Move hand horizontally across webcam view | Steers the glowing basket left and right |
| **✊ Fist** | Close hand into a fist for $\ge 0.35$s | **Pauses** game, targets freeze, timer halts |
| **🖐 Open Palm** | Open all fingers toward the camera | **Resumes** game immediately |
| **🖱️ Mouse / Touch** | Click & drag across the screen | **Fallback control** active when webcam is disabled |

---

## ⚡ Scoring & DEATH MODE Mechanics

* **Regular Target**: Cyan sphere, $+1$ point.
* **Bonus Target**: Purple sphere, $+5$ points (8% spawn rate).
* **Miss Penalty**: Targets falling off screen trigger miss audio cue.
* **Match Length**: 40 seconds total.
* **DEATH MODE Activation**: Triggered automatically when $\le 10$ seconds remain.
  * Target drop speed increases by up to 35%.
  * Spawn interval reduces to ~420ms.
  * Chance for simultaneous double-pulse spawns.
  * Audio switches to emergency warning siren and pulsing red screen tint.

---

## 🚀 Installation & Local Development

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* A laptop or desktop with a webcam, running Chrome, Edge, Brave, Firefox, or Safari.

### Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/dheerajkmahale/Synapse-Gesture-Arena.git
cd Synapse-Gesture-Arena

# 2. Install dependencies cleanly
npm ci

# 3. Start local development server
npm run dev
```

The Vite dev server starts at `http://localhost:5173`.

---

## 🧪 Testing

The test suite validates gesture classification, camera diagnostic error mapping, leaderboard storage, game physics, pause compensation, and Web Audio resilience:

```bash
# Run unit test suite once
npm test

# Run tests in watch mode
npm run test -- --watch
```

**Test Results**: **36 passing tests (100%)** across 4 test suites:
* `gestureClassifier.test.js`: Validates palm, fist, and pointing gesture classification.
* `camera.test.js`: Validates `NotAllowedError`, `NotFoundError`, `NotReadableError`, and track teardown.
* `gameLogic.test.js`: Validates name sanitization, countdown intervals, and duel mechanics.
* `arcadeGame.test.js`: Validates score calculation, pause time freeze compensation, ranking titles, and leaderboard persistence.

---

## 📦 Production Build

```bash
npm run build
```

The build command bundles the application into the `dist/` directory:
* Bundles all HTML, JavaScript chunks, and CSS.
* Automatically includes local neural models (`dist/models/hand_landmarker.task`, ~7.82 MB).
* Copies local WebAssembly runtimes (`dist/wasm/*.wasm`, ~11.15 MB).

To preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment Information (Vercel)

The application is deployed on **Vercel** with continuous deployment from the `main` branch.

* **Production URL**: [https://synapse-gesture-arena.vercel.app](https://synapse-gesture-arena.vercel.app/)
* **Vercel Configuration (`vercel.json`)**:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
* **HTTPS Requirement**: Modern browsers restrict camera access (`getUserMedia`) to secure contexts (`https://` or `localhost`). Deployment on Vercel automatically provides SSL/TLS certificates.

---

## 🛡️ Browser & Webcam Requirements

* **Permissions**: The browser must be granted webcam permission. When prompted, select **Allow**.
* **Lighting**: Recommended 300+ lux ambient room lighting with minimal backlight glare.
* **Camera Distance**: Keep hand approximately 1.5 to 3 feet (45–90 cm) in front of the lens.
* **Camera Lock**: If another app (Zoom, Google Meet, Teams) has locked the webcam, close that app and reload.
* **Mouse/Touch Fallback**: If camera access is denied, an error banner appears and mouse/touch drag controls activate automatically.

---

## ⚠️ Known Limitations

1. **Hardware & Lighting Sensitivity**: Hand landmark confidence can degrade in extremely dark rooms or when direct sunlight shines behind the player.
2. **Single Hand Focus**: The arcade pipeline detects and follows the primary detected hand (first hand in frame).
3. **Headless / Background Tab Behavior**: When the browser tab is hidden, `requestAnimationFrame` is throttled by the browser to conserve battery. The pause duration accumulator prevents time loss during intentional pauses, but active gameplay requires the tab to remain focused.

---

## 👥 Credits & Acknowledgments

* Designed and built for the **Synapse Student AI Club** (Data Science & Agentic AI Club).
* Inspired by the touchless arcade concept at [synapse-gesture-pulse-arena.lovable.app](https://synapse-gesture-pulse-arena.lovable.app/).
* Powered by **Google MediaPipe Tasks Vision** research.
