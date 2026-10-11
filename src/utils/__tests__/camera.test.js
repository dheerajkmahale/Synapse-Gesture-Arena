import { describe, it, expect, vi } from "vitest";
import {
  CameraError,
  mapAndThrowCameraError,
  stopCameraStream,
  checkCameraSupport
} from "../camera";

describe("Camera Utility & Error Diagnostic Engine", () => {
  it("creates CameraError with rich diagnostic metadata", () => {
    const original = new Error("Hardware failed");
    original.name = "TrackStartError";
    const camErr = new CameraError("NOT_READABLE", "Camera in use", original, {
      name: "TrackStartError",
      message: "Hardware failed"
    });

    expect(camErr.name).toBe("CameraError");
    expect(camErr.type).toBe("NOT_READABLE");
    expect(camErr.message).toBe("Camera in use");
    expect(camErr.originalError).toBe(original);
    expect(camErr.diagnosticInfo.name).toBe("TrackStartError");
  });

  it("maps NotAllowedError to NOT_ALLOWED with actionable guidance", () => {
    const err = new Error("Permission dismissed");
    err.name = "NotAllowedError";

    expect(() => mapAndThrowCameraError(err)).toThrowError(CameraError);
    try {
      mapAndThrowCameraError(err);
    } catch (e) {
      expect(e.type).toBe("NOT_ALLOWED");
      expect(e.message).toContain("permission was denied");
      expect(e.diagnosticInfo.name).toBe("NotAllowedError");
    }
  });

  it("maps NotFoundError to NOT_FOUND with device check guidance", () => {
    const err = new Error("Requested device not found");
    err.name = "NotFoundError";

    try {
      mapAndThrowCameraError(err);
    } catch (e) {
      expect(e.type).toBe("NOT_FOUND");
      expect(e.message).toContain("No camera device detected");
      expect(e.diagnosticInfo.name).toBe("NotFoundError");
    }
  });

  it("maps NotReadableError to NOT_READABLE indicating app lock", () => {
    const err = new Error("Could not start video source");
    err.name = "NotReadableError";

    try {
      mapAndThrowCameraError(err);
    } catch (e) {
      expect(e.type).toBe("NOT_READABLE");
      expect(e.message).toContain("in use by another application");
    }
  });

  it("maps SecurityError to SECURITY indicating context / policy block", () => {
    const err = new Error("Permission policy blocked");
    err.name = "SecurityError";

    try {
      mapAndThrowCameraError(err);
    } catch (e) {
      expect(e.type).toBe("SECURITY");
      expect(e.message).toContain("security restrictions");
    }
  });

  it("maps OverconstrainedError to OVERCONSTRAINED with failed constraint name", () => {
    const err = new Error("Constraints could not be satisfied");
    err.name = "OverconstrainedError";
    err.constraint = "width";

    try {
      mapAndThrowCameraError(err);
    } catch (e) {
      expect(e.type).toBe("OVERCONSTRAINED");
      expect(e.diagnosticInfo.constraint).toBe("width");
      expect(e.message).toContain("width");
    }
  });

  it("stopCameraStream stops and disables each track cleanly", () => {
    const mockTrack1 = { kind: "video", id: "t1", stop: vi.fn(), enabled: true };
    const mockTrack2 = { kind: "video", id: "t2", stop: vi.fn(), enabled: true };
    const mockStream = {
      getTracks: () => [mockTrack1, mockTrack2]
    };

    stopCameraStream(mockStream);
    expect(mockTrack1.stop).toHaveBeenCalled();
    expect(mockTrack1.enabled).toBe(false);
    expect(mockTrack2.stop).toHaveBeenCalled();
    expect(mockTrack2.enabled).toBe(false);
  });

  it("checkCameraSupport returns environment capability diagnostics", async () => {
    const result = await checkCameraSupport();
    expect(result).toHaveProperty("isSecureContext");
    expect(result).toHaveProperty("hasMediaDevices");
    expect(result).toHaveProperty("hasGetUserMedia");
    expect(result).toHaveProperty("cameraCount");
    expect(Array.isArray(result.devices)).toBe(true);
  });
});
