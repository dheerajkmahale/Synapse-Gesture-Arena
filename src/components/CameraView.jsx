import React from "react";
import { Camera, Eye, EyeOff, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

export function CameraView({
  videoRef,
  canvasRef,
  cameraActive,
  modelLoaded,
  statusMessage,
  error,
  currentGesture,
  confidence,
  fps,
  countdown,
  onStartCamera,
  onStopCamera,
  overlayEnabled,
  setOverlayEnabled
}) {
  return (
    <div className="camera-panel" aria-label="Webcam and Hand Tracking Panel">
      {/* Panel Top Bar */}
      <div className="panel-top">
        <span className="panel-title">
          <Camera size={15} /> LIVE CAMERA
        </span>
        <div className="panel-top-right">
          {cameraActive && (
            <>
              <button
                className="icon-subtle-button"
                onClick={() => setOverlayEnabled(!overlayEnabled)}
                title={overlayEnabled ? "Hide Hand Skeleton" : "Show Hand Skeleton"}
                aria-label={overlayEnabled ? "Hide Hand Skeleton" : "Show Hand Skeleton"}
              >
                {overlayEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>HUD</span>
              </button>
              <span className="fps-counter">{fps} FPS</span>
            </>
          )}
          <span className={cameraActive ? "status-dot live" : "status-dot offline"}>
            {cameraActive ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="video-box">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="webcam-video"
          aria-label="Webcam feed"
        />
        <canvas ref={canvasRef} className="overlay-canvas" aria-hidden="true" />

        {/* Placeholder when camera is inactive */}
        {!cameraActive && (
          <div className="camera-placeholder">
            {error ? (
              <div className="camera-error-box">
                <AlertTriangle size={38} className="error-icon" />
                <p className="error-headline">
                  {typeof error === "object" && error.type === "NOT_ALLOWED"
                    ? "Camera Permission Denied"
                    : typeof error === "object" && error.type === "NOT_FOUND"
                    ? "No Camera Device Found"
                    : typeof error === "object" && error.type === "NOT_READABLE"
                    ? "Camera In Use by Another App"
                    : typeof error === "object" && error.type === "SECURITY"
                    ? "Security Context Restriction"
                    : typeof error === "object" && error.type === "NOT_SUPPORTED"
                    ? "Webcam API Unsupported"
                    : typeof error === "object" && error.type === "MODEL_LOAD_FAILED"
                    ? "Vision Model Initialization Error"
                    : "Camera Access Required"}
                </p>
                <p className="error-desc">
                  {typeof error === "object" ? error.message : error}
                </p>
                {typeof error === "object" && error.technical && (
                  <div className="error-diag-badge" title="Raw browser error code">
                    <code>DIAGNOSTIC: {error.technical}</code>
                  </div>
                )}
                <button className="primary-button retry-btn" onClick={onStartCamera}>
                  <RefreshCw size={14} /> RETRY CAMERA ACCESS
                </button>
              </div>
            ) : (
              <div className="placeholder-content">
                <div className="camera-icon-halo">
                  <Camera size={44} />
                </div>
                <h3>Enable your camera</h3>
                <p>Detect real-time hand gestures without touching keyboard or mouse.</p>
                <div className="privacy-pill">
                  <ShieldCheck size={14} /> 100% Client-Side Processing • No Uploads
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading overlay when initializing MediaPipe model */}
        {cameraActive && !modelLoaded && (
          <div className="camera-loading-overlay">
            <RefreshCw size={26} className="spinning-icon" />
            <span>Loading Neural Hand Model…</span>
          </div>
        )}

        {/* In-feed HUD Gesture Badge */}
        {cameraActive && modelLoaded && (
          <div className="camera-overlay-hud">
            <span className="hud-label">DETECTED:</span>
            <span className="hud-value">{currentGesture}</span>
            {confidence > 0 && (
              <span className="hud-conf">({Math.round(confidence * 100)}%)</span>
            )}
          </div>
        )}

        {/* Huge Countdown Overlay for round duel */}
        {countdown !== null && (
          <div className="countdown-overlay">
            <div className="countdown-circle">
              <span className="countdown-number">
                {countdown === 0 ? "LOCK IN!" : countdown}
              </span>
            </div>
            <p className="countdown-hint">
              {countdown === 0 ? "EVALUATING GESTURE..." : "HOLD YOUR MOVE READY!"}
            </p>
          </div>
        )}
      </div>

      {/* Status Info Footer */}
      <p className="camera-status" role="status">
        {statusMessage}
      </p>

      {/* Action Buttons */}
      <div className="camera-actions">
        {!cameraActive ? (
          <button className="primary-button camera-button" onClick={onStartCamera}>
            <Camera size={18} /> ENABLE CAMERA
          </button>
        ) : (
          <button className="secondary-button camera-button" onClick={onStopCamera}>
            STOP CAMERA
          </button>
        )}
      </div>
    </div>
  );
}
