import { useState, useEffect, useRef, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { classifyGesture } from "../utils/gestureClassifier";
import { requestCameraStream, stopCameraStream, CameraError } from "../utils/camera";

const LOCAL_WASM = "/wasm";
const CDN_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const LOCAL_MODEL = "/models/hand_landmarker.task";
const CDN_MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// Hand landmark connection pairs for drawing cyber skeleton
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17]
];

const FINGERTIPS = [4, 8, 12, 16, 20];
const STABILITY_THRESHOLD_MS = 600; // Require 600ms of consistent gesture for high stability

export function useHandTracking({ onStableGesture = null, overlayEnabled = true } = {}) {
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Camera is offline");
  const [error, setError] = useState(null); // { type, message, technical }

  const [currentGesture, setCurrentGesture] = useState("Waiting for camera");
  const [currentMove, setCurrentMove] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isStable, setIsStable] = useState(false);
  const [stabilityProgress, setStabilityProgress] = useState(0);
  const [fps, setFps] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);

  // Concurrency & StrictMode lifecycle guards
  const isInitializingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Stability tracker refs
  const lastGestureRef = useRef("No hand detected");
  const gestureStartTimeRef = useRef(0);
  const stableTriggeredRef = useRef(false);

  // Performance & FPS tracking
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(performance.now());

  // Keep callback fresh in ref
  const onStableGestureRef = useRef(onStableGesture);
  useEffect(() => {
    onStableGestureRef.current = onStableGesture;
  }, [onStableGesture]);

  // Clean stop method
  const stopTracking = useCallback(() => {
    console.log("[Synapse Camera] Stopping camera tracking and releasing resources...");
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (vErr) {
        console.warn("[Synapse Camera] Error clearing video element:", vErr);
      }
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (isMountedRef.current) {
      setCameraActive(false);
      setStatusMessage("Camera is offline");
      setCurrentGesture("Waiting for camera");
      setCurrentMove(null);
      setConfidence(0);
      setIsStable(false);
      setStabilityProgress(0);
    }
  }, []);

  // Lifecycle: handle unmount and prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      console.log("[Synapse Camera] Component unmounting, cleaning up...");
      isMountedRef.current = false;
      stopTracking();
    };
  }, [stopTracking]);

  // Cyberpunk canvas overlay drawer
  const drawCyberOverlay = useCallback((landmarks, canvas, videoWidth, videoHeight, gestureInfo) => {
    if (!canvas || !overlayEnabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length === 0) return;

    const points = landmarks[0];
    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw glowing skeleton connection lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(168, 85, 247, 0.75)"; // Neon purple glow
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 8;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = points[startIdx];
      const p2 = points[endIdx];
      ctx.beginPath();
      ctx.moveTo((1 - p1.x) * w, p1.y * h);
      ctx.lineTo((1 - p2.x) * w, p2.y * h);
      ctx.stroke();
    }

    // 2. Draw landmark joint points
    ctx.shadowColor = "#20d5ff";
    ctx.shadowBlur = 10;

    points.forEach((p, index) => {
      const isTip = FINGERTIPS.includes(index);
      const isWrist = index === 0;
      const x = (1 - p.x) * w;
      const y = p.y * h;

      ctx.beginPath();
      ctx.arc(x, y, isTip ? 6 : isWrist ? 7 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? "#20d5ff" : isWrist ? "#a855f7" : "#e0f2fe";
      ctx.fill();

      // Outer halo for tips
      if (isTip) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(32, 213, 255, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // 3. Cyberpunk Hand Bounding Box & Target HUD
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    points.forEach((p) => {
      const mx = 1 - p.x;
      if (mx < minX) minX = mx;
      if (mx > maxX) maxX = mx;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const pad = 24;
    const bx = Math.max(0, minX * w - pad);
    const by = Math.max(0, minY * h - pad);
    const bw = Math.min(w - bx, (maxX - minX) * w + pad * 2);
    const bh = Math.min(h - by, (maxY - minY) * h + pad * 2);

    // Corner brackets
    const bracketLen = 16;
    ctx.strokeStyle = "#20d5ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#20d5ff";
    ctx.shadowBlur = 6;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(bx, by + bracketLen);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + bracketLen, by);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(bx + bw - bracketLen, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + bracketLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(bx, by + bh - bracketLen);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bracketLen, by + bh);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(bx + bw - bracketLen, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - bracketLen);
    ctx.stroke();

    // Gesture floating label above hand
    if (gestureInfo && gestureInfo.gesture && gestureInfo.status === "RECOGNIZED") {
      const labelText = `⚡ ${gestureInfo.gesture.toUpperCase()} [${gestureInfo.move?.toUpperCase() || ""}]`;
      ctx.font = "bold 13px 'Orbitron', monospace";
      const textWidth = ctx.measureText(labelText).width;
      const tagX = Math.max(10, Math.min(w - textWidth - 25, bx));
      const tagY = Math.max(24, by - 8);

      ctx.fillStyle = "rgba(7, 10, 18, 0.85)";
      ctx.fillRect(tagX, tagY - 18, textWidth + 18, 24);
      ctx.strokeStyle = "#20d5ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(tagX, tagY - 18, textWidth + 18, 24);

      ctx.fillStyle = "#20d5ff";
      ctx.fillText(labelText, tagX + 9, tagY);
    }

    ctx.shadowBlur = 0;
  }, [overlayEnabled]);

  // Start tracking session
  const startTracking = async () => {
    if (isInitializingRef.current) {
      console.warn("[Synapse Camera] startTracking is already executing, skipping duplicate request.");
      return;
    }
    isInitializingRef.current = true;
    setError(null);

    try {
      setStatusMessage("Requesting camera permission…");
      console.log("[Synapse Camera] Initiating camera stream acquisition...");
      const stream = await requestCameraStream();

      // Check if component unmounted while waiting for user prompt
      if (!isMountedRef.current) {
        console.warn("[Synapse Camera] Component unmounted during camera request, aborting.");
        stopCameraStream(stream);
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        // Wait for video metadata to confirm resolution
        await new Promise((resolve) => {
          if (video.readyState >= 1) {
            resolve();
          } else {
            const onMeta = () => {
              video.removeEventListener("loadedmetadata", onMeta);
              resolve();
            };
            video.addEventListener("loadedmetadata", onMeta);
            // Safety timeout
            setTimeout(resolve, 2000);
          }
        });

        if (!isMountedRef.current) {
          stopCameraStream(stream);
          return;
        }

        try {
          await video.play();
          console.log("[Synapse Camera] Video element playing successfully:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState
          });
        } catch (playErr) {
          if (playErr.name !== "AbortError") {
            console.warn("[Synapse Camera] Non-fatal video.play() warning:", playErr);
          }
        }
      }

      setCameraActive(true);
      setStatusMessage("Initializing Neural Hand Landmarker…");

      // Load MediaPipe HandLandmarker singleton with local and CDN fallbacks
      if (!landmarkerRef.current) {
        let vision = null;
        try {
          console.log("[Synapse Camera] Loading FilesetResolver locally from:", LOCAL_WASM);
          vision = await FilesetResolver.forVisionTasks(LOCAL_WASM);
          console.log("[Synapse Camera] FilesetResolver loaded successfully from local wasm.");
        } catch (localWasmErr) {
          console.warn("[Synapse Camera] Local WASM failed, falling back to CDN:", CDN_WASM, localWasmErr);
          vision = await FilesetResolver.forVisionTasks(CDN_WASM);
          console.log("[Synapse Camera] FilesetResolver loaded successfully from CDN wasm.");
        }

        const modelPaths = [LOCAL_MODEL, CDN_MODEL];
        let created = false;
        let lastModelErr = null;

        for (const modelPath of modelPaths) {
          try {
            console.log(`[Synapse Camera] Creating HandLandmarker with GPU delegate using: ${modelPath}`);
            landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: modelPath,
                delegate: "GPU"
              },
              runningMode: "VIDEO",
              numHands: 1,
              minHandDetectionConfidence: 0.5,
              minHandPresenceConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
            console.log(`[Synapse Camera] HandLandmarker initialized with GPU delegate from: ${modelPath}`);
            created = true;
            break;
          } catch (gpuError) {
            console.warn(`[Synapse Camera] GPU delegate failed for ${modelPath}, trying CPU:`, gpuError);
            try {
              landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: modelPath,
                  delegate: "CPU"
                },
                runningMode: "VIDEO",
                numHands: 1,
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5
              });
              console.log(`[Synapse Camera] HandLandmarker initialized with CPU delegate from: ${modelPath}`);
              created = true;
              break;
            } catch (cpuError) {
              lastModelErr = cpuError;
              console.warn(`[Synapse Camera] CPU delegate failed for ${modelPath}:`, cpuError);
            }
          }
        }

        if (!created) {
          throw lastModelErr || new Error("Failed to initialize MediaPipe HandLandmarker model.");
        }

        setModelLoaded(true);
      }

      setStatusMessage("Hand Tracking Active");

      let lastTimestamp = 0;

      // Real-time detection loop
      const processFrame = () => {
        const currentVideo = videoRef.current;
        const canvas = canvasRef.current;
        let now = performance.now();

        // Ensure strictly increasing timestamp for MediaPipe
        if (now <= lastTimestamp) {
          now = lastTimestamp + 1;
        }
        lastTimestamp = now;

        // Calculate FPS
        frameCountRef.current++;
        if (now - fpsTimerRef.current >= 1000) {
          if (isMountedRef.current) setFps(frameCountRef.current);
          frameCountRef.current = 0;
          fpsTimerRef.current = now;
        }

        if (currentVideo && currentVideo.readyState >= 2 && currentVideo.videoWidth > 0 && landmarkerRef.current) {
          try {
            // MediaPipe inference
            const results = landmarkerRef.current.detectForVideo(currentVideo, now);
            const hasHands = results.landmarks && results.landmarks.length > 0;

            if (hasHands) {
              const classification = classifyGesture(results.landmarks[0]);
              if (isMountedRef.current) {
                setCurrentGesture(classification.gesture);
                setCurrentMove(classification.move);
                setConfidence(classification.confidence);
              }

              // Stability tracking
              if (classification.gesture === lastGestureRef.current && classification.status === "RECOGNIZED") {
                const heldDuration = now - gestureStartTimeRef.current;
                const progress = Math.min(1, heldDuration / STABILITY_THRESHOLD_MS);
                if (isMountedRef.current) setStabilityProgress(progress);

                if (progress >= 1 && !stableTriggeredRef.current) {
                  if (isMountedRef.current) setIsStable(true);
                  stableTriggeredRef.current = true;
                  if (onStableGestureRef.current) {
                    onStableGestureRef.current(classification);
                  }
                }
              } else {
                lastGestureRef.current = classification.gesture;
                gestureStartTimeRef.current = now;
                stableTriggeredRef.current = false;
                if (isMountedRef.current) {
                  setIsStable(false);
                  setStabilityProgress(0);
                }
              }

              // Draw canvas skeleton
              drawCyberOverlay(results.landmarks, canvas, currentVideo.videoWidth, currentVideo.videoHeight, classification);
            } else {
              if (isMountedRef.current) {
                setCurrentGesture("No hand detected");
                setCurrentMove(null);
                setConfidence(0);
                setIsStable(false);
                setStabilityProgress(0);
              }
              lastGestureRef.current = "No hand detected";
              stableTriggeredRef.current = false;

              if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
          } catch (inferErr) {
            // Dropped frame logging
          }
        }

        if (isMountedRef.current) {
          rafRef.current = requestAnimationFrame(processFrame);
        }
      };

      rafRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error("[Synapse Camera] Exception in startTracking:", err);
      stopTracking();

      const isCameraErr = err instanceof CameraError;
      let errorType = isCameraErr ? err.type : "UNKNOWN";
      let userMessage = err?.message;
      let techDetails = "";

      if (err instanceof Event || (!err?.name && !err?.message)) {
        errorType = "MODEL_LOAD_FAILED";
        userMessage = "MediaPipe vision binaries or neural model failed to load.";
        techDetails = `Event: ${err?.type || "Script/WASM Error"}`;
      } else if (isCameraErr) {
        techDetails = err.diagnosticInfo
          ? `${err.diagnosticInfo.name}: ${err.diagnosticInfo.message}`
          : err.message;
      } else {
        errorType = err.name?.includes("Model") ? "MODEL_LOAD_FAILED" : err.name || "UNKNOWN";
        techDetails = `${err.name || "Error"}: ${err.message || "Unknown exception"}`;
      }

      if (isMountedRef.current) {
        setError({
          type: errorType,
          message: userMessage || "Could not activate camera.",
          technical: techDetails
        });
        setStatusMessage(userMessage || "Could not activate camera.");
      }
    } finally {
      isInitializingRef.current = false;
    }
  };

  return {
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
  };
}
