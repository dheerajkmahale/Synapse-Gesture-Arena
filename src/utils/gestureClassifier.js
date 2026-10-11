/**
 * MediaPipe Hand Gesture Classifier
 *
 * Maps 21 3D hand landmarks to:
 * - "Open Palm" -> "Paper"
 * - "Fist"      -> "Rock"
 * - "Point"     -> "Scissors" (supports index pointing and 2-finger scissors)
 *
 * MediaPipe landmarks index reference:
 * 0: Wrist
 * Thumb:  1 (CMC), 2 (MCP), 3 (IP), 4 (Tip)
 * Index:  5 (MCP), 6 (PIP), 7 (DIP), 8 (Tip)
 * Middle: 9 (MCP), 10 (PIP), 11 (DIP), 12 (Tip)
 * Ring:   13 (MCP), 14 (PIP), 15 (DIP), 16 (Tip)
 * Pinky:  17 (MCP), 18 (PIP), 19 (DIP), 20 (Tip)
 */

// Calculate 2D Euclidean distance between two landmark points
export function distance2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate 3D Euclidean distance when z is available
export function distance3D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Checks if a non-thumb finger is extended.
 * Uses both distance-from-wrist comparison and vertical height comparison
 * to provide orientation tolerance.
 */
export function isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
  const wrist = landmarks[0];
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];

  const distWristToTip = distance2D(wrist, tip);
  const distWristToPip = distance2D(wrist, pip);
  const distWristToMcp = distance2D(wrist, mcp);

  // Finger is extended if tip is distinctly further from wrist than PIP & MCP
  const distExtended = distWristToTip > distWristToPip * 1.08 && distWristToTip > distWristToMcp * 1.15;

  // Relative distance to MCP: if finger is folded, tip is near MCP
  const tipToMcp = distance2D(tip, mcp);
  const pipToMcp = distance2D(pip, mcp);
  const foldCheck = tipToMcp > pipToMcp * 1.1;

  // Also check y position assuming standard upwards hand
  const yExtended = tip.y < pip.y;

  return distExtended && (foldCheck || yExtended);
}

/**
 * Checks if thumb is extended away from palm.
 */
export function isThumbExtended(landmarks) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];

  const thumbToPinkyMcp = distance2D(thumbTip, pinkyMcp);
  const thumbIpToPinkyMcp = distance2D(thumbIp, pinkyMcp);
  const thumbToIndexMcp = distance2D(thumbTip, indexMcp);

  // When tucked in a fist, thumb tip is close to index MCP
  return thumbToPinkyMcp > thumbIpToPinkyMcp * 1.1 && thumbToIndexMcp > 0.12;
}

/**
 * Classifies 21 MediaPipe hand landmarks into game gestures.
 * Returns structured classification result.
 */
export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return {
      gesture: "No hand detected",
      move: null,
      confidence: 0,
      fingers: null,
      status: "NO_HAND"
    };
  }

  const indexExtended = isFingerExtended(landmarks, 8, 6, 5);
  const middleExtended = isFingerExtended(landmarks, 12, 10, 9);
  const ringExtended = isFingerExtended(landmarks, 16, 14, 13);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18, 17);
  const thumbExtended = isThumbExtended(landmarks);

  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

  const fingers = {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended
  };

  // 1. OPEN PALM -> PAPER
  // At least 4 non-thumb fingers extended, or 3 fingers + thumb clearly open
  if (extendedCount >= 4 || (extendedCount >= 3 && thumbExtended && indexExtended && middleExtended)) {
    return {
      gesture: "Open Palm",
      move: "Paper",
      confidence: extendedCount === 4 && thumbExtended ? 0.98 : 0.88,
      fingers,
      status: "RECOGNIZED"
    };
  }

  // 2. FIST -> ROCK
  // 0 non-thumb fingers extended, and thumb curled
  if (extendedCount === 0) {
    return {
      gesture: "Fist",
      move: "Rock",
      confidence: !thumbExtended ? 0.98 : 0.89,
      fingers,
      status: "RECOGNIZED"
    };
  }

  // 3. POINT / SCISSORS -> SCISSORS
  // Case A: Index finger pointing alone (index = true, middle = false, ring = false, pinky = false)
  // Case B: Scissors / Peace sign (index = true, middle = true, ring = false, pinky = false)
  if (indexExtended && !ringExtended && !pinkyExtended) {
    const isPointing = !middleExtended;
    return {
      gesture: isPointing ? "Point" : "Scissors",
      move: "Scissors",
      confidence: 0.94,
      fingers,
      status: "RECOGNIZED"
    };
  }

  // Partial / transitional hand state
  return {
    gesture: "Partial Hand",
    move: null,
    confidence: 0.45,
    fingers,
    status: "PARTIAL"
  };
}
