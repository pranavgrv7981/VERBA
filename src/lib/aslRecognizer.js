function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function makeResult(value, confidence, type = 'letter') {
  return {
    value,
    confidence,
    type,
    display: type === 'letter' ? `ASL ${value}` : value
  };
}

function motionRange(history, axis) {
  if (history.length < 8) return 0;
  const values = history.map((point) => point[axis]);
  return Math.max(...values) - Math.min(...values);
}

export function recognizeHandshape(landmarks, handScore = 1, motionHistory = []) {
  const palmWidth = Math.max(distance(landmarks[5], landmarks[17]), 0.045);
  const wrist = landmarks[0];
  const isExtended = (tip, pip) => (
    landmarks[tip].y < landmarks[pip].y - palmWidth * 0.08 &&
    distance(landmarks[tip], wrist) > distance(landmarks[pip], wrist) * 1.02
  );

  const fingers = {
    index: isExtended(8, 6),
    middle: isExtended(12, 10),
    ring: isExtended(16, 14),
    pinky: isExtended(20, 18)
  };

  const extendedCount = Object.values(fingers).filter(Boolean).length;
  const thumbAway = distance(landmarks[4], landmarks[9]) > palmWidth * 0.9 ||
    distance(landmarks[4], landmarks[5]) > palmWidth * 0.72;
  const thumbLong = distance(landmarks[4], wrist) > distance(landmarks[2], wrist) * 1.05;
  const thumbExtended = thumbAway && thumbLong;
  const thumbIndexDistance = distance(landmarks[4], landmarks[8]);
  const averageThumbTipDistance = (
    distance(landmarks[4], landmarks[8]) +
    distance(landmarks[4], landmarks[12]) +
    distance(landmarks[4], landmarks[16]) +
    distance(landmarks[4], landmarks[20])
  ) / 4;
  const indexMiddleSpread = distance(landmarks[8], landmarks[12]) > palmWidth * 0.38;
  const allFingersOpen = fingers.index && fingers.middle && fingers.ring && fingers.pinky;
  const noFingersOpen = extendedCount === 0;
  const openCurve = thumbIndexDistance > palmWidth * 0.58 &&
    thumbIndexDistance < palmWidth * 1.48 &&
    averageThumbTipDistance > palmWidth * 0.72 &&
    extendedCount > 0 &&
    extendedCount < 4;
  const horizontalMotion = motionRange(motionHistory, 'x');
  const verticalMotion = motionRange(motionHistory, 'y');

  const withScore = (result, boost = 1) => ({
    ...result,
    confidence: Math.min(result.confidence * handScore * boost, 0.98)
  });

  if (allFingersOpen && thumbExtended && horizontalMotion > palmWidth * 1.1) {
    return withScore(makeResult('Hello', 0.94, 'phrase'));
  }

  if (noFingersOpen && verticalMotion > palmWidth * 0.75) {
    return withScore(makeResult('Yes', 0.82, 'phrase'));
  }

  if (thumbIndexDistance < palmWidth * 0.58 && averageThumbTipDistance < palmWidth * 0.92 && extendedCount <= 2) {
    return withScore(makeResult('O', 0.9));
  }

  if (allFingersOpen && thumbExtended) {
    return withScore(makeResult('Hello', 0.88, 'phrase'));
  }

  if (allFingersOpen && !thumbExtended) {
    return withScore(makeResult('B', 0.86));
  }

  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky && indexMiddleSpread) {
    return withScore(makeResult('V', 0.9));
  }

  if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && thumbExtended) {
    return withScore(makeResult('L', 0.9));
  }

  if (!fingers.index && !fingers.middle && !fingers.ring && fingers.pinky && thumbExtended) {
    return withScore(makeResult('Y', 0.89));
  }

  if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return withScore(makeResult('D', 0.82));
  }

  if (!fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    return withScore(makeResult('I', 0.82));
  }

  if (noFingersOpen) {
    return withScore(makeResult('A', thumbExtended ? 0.86 : 0.76));
  }

  if (openCurve) {
    return withScore(makeResult('C', 0.78));
  }

  return null;
}

export const supportedSigns = [
  'A', 'B', 'C', 'D', 'I', 'L', 'O', 'V', 'Y', 'Hello', 'Yes'
];
