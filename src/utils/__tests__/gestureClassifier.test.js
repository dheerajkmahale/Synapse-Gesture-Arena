import { describe, it, expect } from "vitest";
import { classifyGesture } from "../gestureClassifier";

// Helper to construct a baseline 21-landmark hand array
function createHandSkeleton() {
  const points = [];
  for (let i = 0; i < 21; i++) {
    points.push({ x: 0.5, y: 0.5, z: 0 });
  }
  return points;
}

// Generate Open Palm landmarks where all fingers are extended upwards
function createOpenPalmLandmarks() {
  const points = createHandSkeleton();
  points[0] = { x: 0.5, y: 0.8, z: 0 }; // Wrist at bottom

  // Thumb
  points[1] = { x: 0.45, y: 0.75, z: 0 };
  points[2] = { x: 0.40, y: 0.70, z: 0 };
  points[3] = { x: 0.35, y: 0.65, z: 0 };
  points[4] = { x: 0.30, y: 0.60, z: 0 }; // Thumb tip extended outwards

  // Index (tips far from wrist, high up)
  points[5] = { x: 0.45, y: 0.65, z: 0 };
  points[6] = { x: 0.45, y: 0.55, z: 0 };
  points[7] = { x: 0.45, y: 0.45, z: 0 };
  points[8] = { x: 0.45, y: 0.30, z: 0 };

  // Middle
  points[9] = { x: 0.50, y: 0.65, z: 0 };
  points[10] = { x: 0.50, y: 0.52, z: 0 };
  points[11] = { x: 0.50, y: 0.42, z: 0 };
  points[12] = { x: 0.50, y: 0.28, z: 0 };

  // Ring
  points[13] = { x: 0.55, y: 0.65, z: 0 };
  points[14] = { x: 0.55, y: 0.54, z: 0 };
  points[15] = { x: 0.55, y: 0.44, z: 0 };
  points[16] = { x: 0.55, y: 0.32, z: 0 };

  // Pinky
  points[17] = { x: 0.60, y: 0.67, z: 0 };
  points[18] = { x: 0.60, y: 0.58, z: 0 };
  points[19] = { x: 0.60, y: 0.50, z: 0 };
  points[20] = { x: 0.60, y: 0.38, z: 0 };

  return points;
}

// Generate Fist landmarks where fingers are curled into palm
function createFistLandmarks() {
  const points = createHandSkeleton();
  points[0] = { x: 0.5, y: 0.8, z: 0 }; // Wrist

  // Thumb curled across palm
  points[1] = { x: 0.47, y: 0.77, z: 0 };
  points[2] = { x: 0.45, y: 0.74, z: 0 };
  points[3] = { x: 0.46, y: 0.71, z: 0 };
  points[4] = { x: 0.48, y: 0.70, z: 0 };

  // Fingers curled down towards wrist
  // Index
  points[5] = { x: 0.46, y: 0.66, z: 0 };
  points[6] = { x: 0.46, y: 0.60, z: 0 };
  points[7] = { x: 0.46, y: 0.65, z: 0 };
  points[8] = { x: 0.46, y: 0.70, z: 0 }; // Tip curled back

  // Middle
  points[9] = { x: 0.50, y: 0.65, z: 0 };
  points[10] = { x: 0.50, y: 0.59, z: 0 };
  points[11] = { x: 0.50, y: 0.64, z: 0 };
  points[12] = { x: 0.50, y: 0.69, z: 0 };

  // Ring
  points[13] = { x: 0.54, y: 0.66, z: 0 };
  points[14] = { x: 0.54, y: 0.61, z: 0 };
  points[15] = { x: 0.54, y: 0.66, z: 0 };
  points[16] = { x: 0.54, y: 0.71, z: 0 };

  // Pinky
  points[17] = { x: 0.58, y: 0.68, z: 0 };
  points[18] = { x: 0.58, y: 0.63, z: 0 };
  points[19] = { x: 0.58, y: 0.68, z: 0 };
  points[20] = { x: 0.58, y: 0.73, z: 0 };

  return points;
}

// Generate Pointing gesture landmarks (Index extended, others curled)
function createPointingLandmarks() {
  const points = createFistLandmarks();

  // Extend index finger
  points[5] = { x: 0.46, y: 0.66, z: 0 };
  points[6] = { x: 0.46, y: 0.55, z: 0 };
  points[7] = { x: 0.46, y: 0.45, z: 0 };
  points[8] = { x: 0.46, y: 0.30, z: 0 }; // Tip high up and extended

  return points;
}

describe("Gesture Classifier - MediaPipe Hand Landmarks", () => {
  it("handles null and empty landmark arrays gracefully", () => {
    const emptyResult = classifyGesture(null);
    expect(emptyResult.status).toBe("NO_HAND");
    expect(emptyResult.gesture).toBe("No hand detected");
    expect(emptyResult.move).toBeNull();

    const shortResult = classifyGesture([{ x: 0, y: 0 }]);
    expect(shortResult.status).toBe("NO_HAND");
  });

  it("correctly classifies Open Palm as Paper", () => {
    const palm = createOpenPalmLandmarks();
    const result = classifyGesture(palm);
    expect(result.gesture).toBe("Open Palm");
    expect(result.move).toBe("Paper");
    expect(result.status).toBe("RECOGNIZED");
  });

  it("correctly classifies Fist as Rock", () => {
    const fist = createFistLandmarks();
    const result = classifyGesture(fist);
    expect(result.gesture).toBe("Fist");
    expect(result.move).toBe("Rock");
    expect(result.status).toBe("RECOGNIZED");
  });

  it("correctly classifies Pointing as Scissors", () => {
    const pointing = createPointingLandmarks();
    const result = classifyGesture(pointing);
    expect(result.gesture).toBe("Point");
    expect(result.move).toBe("Scissors");
    expect(result.status).toBe("RECOGNIZED");
  });
});
