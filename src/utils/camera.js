/**
 * Camera API Utilities & Diagnostics
 * Robust WebRTC camera manager with progressive constraint fallbacks,
 * precise error classification, and resource cleanup.
 */

export class CameraError extends Error {
  constructor(type, message, originalError = null, diagnosticInfo = {}) {
    super(message);
    this.name = "CameraError";
    this.type = type; // "NOT_ALLOWED" | "NOT_FOUND" | "NOT_READABLE" | "SECURITY" | "NOT_SUPPORTED" | "OVERCONSTRAINED" | "ABORTED" | "UNKNOWN"
    this.originalError = originalError;
    this.diagnosticInfo = diagnosticInfo;
  }
}

/**
 * Checks system and browser environment support for webcam capture.
 */
export async function checkCameraSupport() {
  const isSecure = typeof window !== "undefined" ? !!window.isSecureContext : false;
  const hasMediaDevices = typeof navigator !== "undefined" && !!navigator.mediaDevices;
  const hasGetUserMedia = hasMediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";

  let devices = [];
  try {
    if (hasMediaDevices && typeof navigator.mediaDevices.enumerateDevices === "function") {
      const all = await navigator.mediaDevices.enumerateDevices();
      devices = all.filter((d) => d.kind === "videoinput");
    }
  } catch (err) {
    console.warn("[Synapse Camera] Error enumerating devices:", err);
  }

  return {
    isSecureContext: isSecure,
    hasMediaDevices,
    hasGetUserMedia,
    cameraCount: devices.length,
    devices
  };
}

/**
 * Requests camera stream with progressive fallback hierarchy:
 * 1. Preferred device or ideal constraints (1280x720, facingMode user, 30fps)
 * 2. Basic facingMode user (no resolution locks)
 * 3. Most permissive { video: true } fallback for maximum hardware compatibility
 */
export async function requestCameraStream(preferredDeviceId = null) {
  // Pre-flight check: Secure context
  if (typeof window !== "undefined" && !window.isSecureContext) {
    const error = new CameraError(
      "SECURITY",
      "Camera requires a secure context (HTTPS or http://localhost / http://127.0.0.1). Insecure HTTP origins block camera access.",
      null,
      { isSecureContext: false }
    );
    console.error("[Synapse Camera] Insecure context detected:", error);
    throw error;
  }

  // Pre-flight check: MediaDevices support
  if (!navigator?.mediaDevices?.getUserMedia) {
    const error = new CameraError(
      "NOT_SUPPORTED",
      "navigator.mediaDevices.getUserMedia is not supported or is disabled in this browser.",
      null,
      {
        hasMediaDevices: !!navigator?.mediaDevices,
        hasGetUserMedia: !!navigator?.mediaDevices?.getUserMedia
      }
    );
    console.error("[Synapse Camera] MediaDevices API unsupported:", error);
    throw error;
  }

  // Progressive constraint fallback list
  const attempts = [];

  if (preferredDeviceId) {
    attempts.push({
      video: {
        deviceId: { exact: preferredDeviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    attempts.push({
      video: { deviceId: { exact: preferredDeviceId } },
      audio: false
    });
  }

  // Attempt 1: Ideal 720p 30fps with facingMode user
  attempts.push({
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
    audio: false
  });

  // Attempt 2: Relaxed user facingMode without dimensions
  attempts.push({
    video: { facingMode: "user" },
    audio: false
  });

  // Attempt 3: Ultimate fallback - any available video input
  attempts.push({
    video: true,
    audio: false
  });

  let lastError = null;

  for (let i = 0; i < attempts.length; i++) {
    const constraints = attempts[i];
    try {
      console.log(`[Synapse Camera] Requesting getUserMedia (attempt ${i + 1}/${attempts.length}):`, constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const tracks = stream.getVideoTracks();
      console.log(`[Synapse Camera] Camera stream acquired successfully on attempt ${i + 1}:`, {
        trackCount: tracks.length,
        tracks: tracks.map((t) => ({
          label: t.label,
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
          settings: t.getSettings ? t.getSettings() : {}
        }))
      });

      return stream;
    } catch (err) {
      lastError = err;
      console.warn(`[Synapse Camera] Attempt ${i + 1} failed:`, {
        name: err.name,
        message: err.message,
        constraint: err.constraint || null
      });

      // Stop immediately on fatal errors where loosening constraints won't help:
      // 1. User/OS denied permission
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        break;
      }
      // 2. Hardware is locked by another program
      if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        break;
      }
      // 3. No physical camera found
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        break;
      }
      // 4. Security block
      if (err.name === "SecurityError") {
        break;
      }
    }
  }

  return mapAndThrowCameraError(lastError);
}

/**
 * Maps standard browser MediaStream errors into structured, user-actionable CameraError objects.
 */
export function mapAndThrowCameraError(err) {
  const errName = err?.name || "UnknownError";
  const errMsg = err?.message || "Unknown camera error";
  const constraint = err?.constraint || null;

  const diagnostic = {
    name: errName,
    message: errMsg,
    constraint,
    isSecureContext: typeof window !== "undefined" ? window.isSecureContext : false
  };

  console.error("[Synapse Camera] Fatal error acquiring camera:", diagnostic);

  // 1. Permission Denied (NotAllowedError / PermissionDeniedError)
  if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
    throw new CameraError(
      "NOT_ALLOWED",
      "Camera permission was denied. Please allow camera access in your browser address bar and verify that Windows Privacy & Security -> Camera allows browser access.",
      err,
      diagnostic
    );
  }

  // 2. No Hardware (NotFoundError / DevicesNotFoundError)
  if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
    throw new CameraError(
      "NOT_FOUND",
      "No camera device detected on your system. Please verify your webcam is plugged in and recognized in Windows Device Manager.",
      err,
      diagnostic
    );
  }

  // 3. Camera in Use / Locked (NotReadableError / TrackStartError)
  if (errName === "NotReadableError" || errName === "TrackStartError") {
    throw new CameraError(
      "NOT_READABLE",
      "Camera is in use by another application (e.g. Zoom, MS Teams, Skype, or another browser tab). Close other camera apps and retry.",
      err,
      diagnostic
    );
  }

  // 4. Security Block (SecurityError)
  if (errName === "SecurityError") {
    throw new CameraError(
      "SECURITY",
      "Camera access was blocked by browser security restrictions or iframe permissions policy.",
      err,
      diagnostic
    );
  }

  // 5. Constraints Unfulfillable (OverconstrainedError)
  if (errName === "OverconstrainedError" || errName === "ConstraintNotSatisfiedError") {
    throw new CameraError(
      "OVERCONSTRAINED",
      `Webcam cannot fulfill requested video constraints (failed constraint: ${constraint || "resolution/frameRate"}).`,
      err,
      diagnostic
    );
  }

  // 6. Aborted
  if (errName === "AbortError") {
    throw new CameraError(
      "ABORTED",
      "Camera access request was aborted by the browser or page transition.",
      err,
      diagnostic
    );
  }

  // 7. Unknown / Generic
  throw new CameraError(
    "UNKNOWN",
    `Could not activate camera (${errName}: ${errMsg})`,
    err,
    diagnostic
  );
}

/**
 * Cleanly stops all tracks on a MediaStream and releases hardware locks.
 */
export function stopCameraStream(stream) {
  if (!stream) return;
  try {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      try {
        track.enabled = false;
        track.stop();
        console.log(`[Synapse Camera] Stopped track: ${track.kind} (${track.id})`);
      } catch (trackErr) {
        console.warn("[Synapse Camera] Error stopping track:", trackErr);
      }
    });
  } catch (err) {
    console.warn("[Synapse Camera] Error releasing stream:", err);
  }
}

/**
 * Lists available video input devices.
 */
export async function listCameraDevices() {
  if (!navigator?.mediaDevices?.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput");
  } catch (err) {
    console.warn("[Synapse Camera] enumerateDevices failed:", err);
    return [];
  }
}
