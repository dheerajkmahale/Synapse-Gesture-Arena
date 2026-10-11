import { useState, useEffect, useRef, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { requestCameraStream, stopCameraStream, CameraError } from "../utils/camera";

const LOCAL_WASM = "/wasm";
const CDN_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const LOCAL_MODEL = "/models/hand_landmarker.task";
const CDN_MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function useArcadeHandTracking(videoRef) {
  const [ready, setReady] = useState(false);
  const [present, setPresent] = useState(false);
  const [error, setError] = useState(null);
  const [currentGesture, setCurrentGesture] = useState("Waiting for camera");

  const handRef = useRef({
    x: 0.5,
    y: 0.5,
    open: false,
    fist: false,
    landmarks: null
  });

  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const isInitializingRef = useRef(false);
  const isMountedRef = useRef(true);
  const smoothedXRef = useRef(0.5);
  const lastDetectionTimeRef = useRef(0);

  // Stop tracking and clean up camera tracks
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef?.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {}
    }
    if (isMountedRef.current) {
      setReady(false);
      setPresent(false);
      setCurrentGesture("Waiting for camera");
    }
  }, [videoRef]);

  // Clean gesture heuristic: checks finger extension
  const classifyHandGesture = (landmarks) => {
    if (!landmarks || landmarks.length < 21) {
      return { open: false, fist: false, gestureName: "No hand" };
    }
    // Fingertips: 8 (index), 12 (middle), 16 (ring), 20 (pinky)
    // PIP joints: 6, 10, 14, 18
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    let extendedCount = 0;

    for (let i = 0; i < tips.length; i++) {
      if (landmarks[tips[i]].y < landmarks[pips[i]].y - 0.02) {
        extendedCount++;
      }
    }

    // Thumb check: landmark 4 vs landmark 3
    if (Math.abs(landmarks[4].x - landmarks[3].x) > 0.035) {
      extendedCount++;
    }

    const isOpen = extendedCount >= 4;
    const isFist = extendedCount <= 1;
    const gestureName = isOpen ? "Open Palm" : isFist ? "Fist" : "Partial";

    return { open: isOpen, fist: isFist, gestureName };
  };

  const start = useCallback(async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;
    setError(null);

    try {
      console.log("[Synapse Arcade CV] Requesting camera stream...");
      const stream = await requestCameraStream();
      if (!isMountedRef.current) {
        stopCameraStream(stream);
        return;
      }

      streamRef.current = stream;
      const video = videoRef?.current;

      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        await new Promise((resolve) => {
          if (video.readyState >= 1) {
            resolve();
          } else {
            const onMeta = () => {
              video.removeEventListener("loadedmetadata", onMeta);
              resolve();
            };
            video.addEventListener("loadedmetadata", onMeta);
            setTimeout(resolve, 2000);
          }
        });

        if (!isMountedRef.current) {
          stopCameraStream(stream);
          return;
        }

        try {
          await video.play();
        } catch (playErr) {
          if (playErr.name !== "AbortError") {
            console.warn("[Synapse Arcade CV] video.play() warning:", playErr);
          }
        }
      }

      // Initialize MediaPipe HandLandmarker singleton
      if (!landmarkerRef.current) {
        let vision = null;
        try {
          vision = await FilesetResolver.forVisionTasks(LOCAL_WASM);
        } catch {
          vision = await FilesetResolver.forVisionTasks(CDN_WASM);
        }

        const modelOptions = [LOCAL_MODEL, CDN_MODEL];
        let created = false;

        for (const modelPath of modelOptions) {
          try {
            landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: modelPath, delegate: "GPU" },
              runningMode: "VIDEO",
              numHands: 1,
              minHandDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
            created = true;
            break;
          } catch {
            try {
              landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: modelPath, delegate: "CPU" },
                runningMode: "VIDEO",
                numHands: 1,
                minHandDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
              });
              created = true;
              break;
            } catch {}
          }
        }

        if (!created) {
          throw new Error("Could not initialize MediaPipe Hand Landmarker model.");
        }
      }

      setReady(true);
      let lastTimestamp = 0;

      // Detection Loop
      const process = () => {
        const vid = videoRef?.current;
        let now = performance.now();

        if (now <= lastTimestamp) {
          now = lastTimestamp + 1;
        }
        lastTimestamp = now;

        if (vid && vid.readyState >= 2 && vid.videoWidth > 0 && landmarkerRef.current) {
          try {
            const results = landmarkerRef.current.detectForVideo(vid, now);
            const hasHands = results.landmarks && results.landmarks.length > 0;

            if (hasHands) {
              const rawLandmarks = results.landmarks[0];
              const indexTip = rawLandmarks[8];

              // Mirrored horizontal position
              const rawMirroredX = 1 - indexTip.x;
              // Expand active center area slightly for natural reaching
              const mappedX = Math.min(1, Math.max(0, (rawMirroredX - 0.5) * 1.45 + 0.5));

              // Adaptive smoothing (faster response on quick movements, smooth on micro-jitter)
              const delta = Math.abs(mappedX - smoothedXRef.current);
              const alpha = delta > 0.05 ? 0.88 : 0.55;
              smoothedXRef.current = smoothedXRef.current * (1 - alpha) + mappedX * alpha;

              const gesture = classifyHandGesture(rawLandmarks);

              handRef.current = {
                x: smoothedXRef.current,
                y: 1 - indexTip.y,
                open: gesture.open,
                fist: gesture.fist,
                landmarks: rawLandmarks.map((p) => ({ x: 1 - p.x, y: p.y }))
              };

              lastDetectionTimeRef.current = now;
              if (isMountedRef.current) {
                setPresent(true);
                setCurrentGesture(gesture.gestureName);
              }
            } else {
              // Graceful disappearance: wait 400ms before clearing present state
              if (now - lastDetectionTimeRef.current > 400) {
                handRef.current = {
                  ...handRef.current,
                  landmarks: null,
                  open: false,
                  fist: false
                };
                if (isMountedRef.current) {
                  setPresent(false);
                  setCurrentGesture("No hand detected");
                }
              }
            }
          } catch {}
        }

        if (isMountedRef.current) {
          rafRef.current = requestAnimationFrame(process);
        }
      };

      rafRef.current = requestAnimationFrame(process);
    } catch (err) {
      console.error("[Synapse Arcade CV] Start error:", err);
      stop();
      if (isMountedRef.current) {
        setError(err.message || "Camera unavailable");
      }
    } finally {
      isInitializingRef.current = false;
    }
  }, [videoRef, stop]);

  useEffect(() => {
    isMountedRef.current = true;
    start();
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [start, stop]);

  return {
    ready,
    present,
    error,
    handRef,
    currentGesture,
    restartCamera: start
  };
}
