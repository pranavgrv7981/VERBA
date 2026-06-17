export function waitForHandsLibrary(timeoutMs = 4500) {
  return new Promise((resolve) => {
    if (window.Hands) {
      resolve(true);
      return;
    }

    const startedAt = Date.now();
    const check = () => {
      if (window.Hands) {
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve(false);
        return;
      }

      window.setTimeout(check, 120);
    };

    check();
  });
}

export async function createHandsModel(onResults) {
  const isReady = await waitForHandsLibrary();
  if (!isReady) {
    return null;
  }

  const hands = new window.Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    selfieMode: false,
    minDetectionConfidence: 0.68,
    minTrackingConfidence: 0.62
  });

  hands.onResults(onResults);
  return hands;
}
