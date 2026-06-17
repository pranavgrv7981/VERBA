import { useCallback, useEffect, useRef, useState } from 'react';
import { recognizeHandshape } from '../lib/aslRecognizer.js';
import { clearCanvas, drawHand, resizeCanvas } from '../lib/handDrawing.js';
import { createHandsModel } from '../lib/mediaPipe.js';
import { speakText, stopSpeech } from '../lib/speech.js';

const stableFrameTarget = 16;
const repeatCooldownMs = 3400;

export function useSignRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const handsModelRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const processingRef = useRef(false);
  const candidateRef = useRef({ sign: null, frames: 0 });
  const lastCommitRef = useRef({ sign: null, at: 0 });
  const motionRef = useRef([]);
  const detectedRef = useRef(null);

  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('Camera idle');
  const [modelStatus, setModelStatus] = useState('MediaPipe Hands - ASL starter');
  const [helper, setHelper] = useState('Press Start AI Demo and allow camera access.');
  const [detected, setDetected] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [speechStatus, setSpeechStatus] = useState('Speech ready');

  const publishDetected = useCallback((nextDetected) => {
    const previous = detectedRef.current;
    const isSameEmpty = !previous && !nextDetected;
    const isSameResult = previous && nextDetected &&
      previous.value === nextDetected.value &&
      previous.display === nextDetected.display &&
      Math.abs(previous.confidence - nextDetected.confidence) < 0.03;

    if (isSameEmpty || isSameResult) return;

    detectedRef.current = nextDetected;
    setDetected(nextDetected);
  }, []);

  const resize = useCallback(() => {
    if (canvasRef.current && frameRef.current) {
      resizeCanvas(canvasRef.current, frameRef.current);
    }
  }, []);

  const commitSign = useCallback((result) => {
    const now = Date.now();
    const last = lastCommitRef.current;
    const canRepeat = result.value !== last.sign || now - last.at > repeatCooldownMs;

    if (!canRepeat) return;

    const entry = {
      id: `${now}-${result.value}`,
      text: result.value,
      confidence: result.confidence,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTranscript((items) => [...items, entry]);
    lastCommitRef.current = { sign: result.value, at: now };
    speakText(result.type === 'letter' ? `Letter ${result.value}` : result.value, setSpeechStatus);
  }, []);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    resizeCanvas(canvas, frame);
    const context = canvas.getContext('2d');
    clearCanvas(canvas, context);

    const landmarks = results.multiHandLandmarks?.[0];
    if (!landmarks) {
      candidateRef.current = { sign: null, frames: 0 };
      publishDetected(null);
      setCameraStatus('Searching');
      setHelper('Place one hand inside the frame and hold a supported sign.');
      return;
    }

    drawHand(canvas, context, landmarks);
    motionRef.current = [...motionRef.current, { x: landmarks[0].x, y: landmarks[0].y }].slice(-18);

    const handScore = results.multiHandedness?.[0]?.score ?? 1;
    const result = recognizeHandshape(landmarks, handScore, motionRef.current);

    if (!result) {
      candidateRef.current = { sign: null, frames: 0 };
      publishDetected({ display: 'Gesture unclear', confidence: 0, value: 'Adjust hand' });
      setHelper('Try A, B, C, D, I, L, O, V, Y, Hello, or Yes.');
      return;
    }

    publishDetected(result);
    setCameraStatus('Detecting');
    setHelper('Hold steady for about one second to add it to the conversation.');

    if (candidateRef.current.sign === result.value) {
      candidateRef.current.frames += 1;
    } else {
      candidateRef.current = { sign: result.value, frames: 1 };
    }

    if (candidateRef.current.frames === stableFrameTarget) {
      commitSign(result);
    }
  }, [commitSign, publishDetected]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera API unavailable');
    }

    if (!streamRef.current) {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
    }

    videoRef.current.srcObject = streamRef.current;
    await videoRef.current.play();
    setIsLive(true);
    resize();
  }, [resize]);

  const startRecognitionLoop = useCallback(() => {
    const run = async () => {
      const model = handsModelRef.current;
      const video = videoRef.current;

      if (model && video && video.readyState >= 2 && !processingRef.current) {
        processingRef.current = true;
        try {
          await model.send({ image: video });
        } catch (error) {
          console.error(error);
          setModelStatus('AI processing paused');
          setHelper('The camera is open, but recognition paused. Refresh and try again.');
        } finally {
          processingRef.current = false;
        }
      }

      loopRef.current = window.requestAnimationFrame(run);
    };

    if (!loopRef.current) {
      loopRef.current = window.requestAnimationFrame(run);
    }
  }, []);

  const start = useCallback(async () => {
    setIsStarting(true);
    setCameraStatus('Starting');
    setHelper('Requesting camera access from your browser.');

    try {
      await startCamera();
    } catch (error) {
      console.error(error);
      setIsLive(false);
      setModelStatus('Camera unavailable');

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraStatus('Camera blocked');
        setHelper('Allow camera permission in the browser address bar, then press Start AI Demo again.');
      } else if (error.name === 'NotFoundError') {
        setCameraStatus('No camera found');
        setHelper('Connect a webcam or enable your built-in camera, then try again.');
      } else {
        setCameraStatus('Camera unavailable');
        setHelper('Open through localhost, close other camera apps, and try again.');
      }
      setIsStarting(false);
      return;
    }

    setCameraStatus('Camera live');
    setHelper('Camera opened. Loading the ASL recognition model now.');

    try {
      if (!handsModelRef.current) {
        handsModelRef.current = await createHandsModel(onResults);
      }

      if (handsModelRef.current) {
        setModelStatus('Live landmarks - ASL starter');
        setCameraStatus('AI running');
        setHelper('Show one supported sign at a time. Verba will speak stable detections.');
        startRecognitionLoop();
      } else {
        setModelStatus('AI library offline');
        setHelper('Camera is open. Connect to the internet and refresh to enable MediaPipe recognition.');
      }
    } catch (error) {
      console.error(error);
      setModelStatus('AI model unavailable');
      setCameraStatus('Camera live');
      setHelper('The webcam is still open. Refresh with internet access to enable hand recognition.');
    } finally {
      setIsStarting(false);
    }
  }, [onResults, startCamera, startRecognitionLoop]);

  const speakTranscript = useCallback(() => {
    speakText(transcript.map((item) => item.text).join(' '), setSpeechStatus);
  }, [transcript]);

  const copyTranscript = useCallback(async () => {
    const text = transcript.map((item) => item.text).join(' ');
    if (!text || !navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setSpeechStatus('Copied');
  }, [transcript]);

  const clearTranscript = useCallback(() => {
    stopSpeech();
    setTranscript([]);
    detectedRef.current = null;
    setDetected(null);
    setSpeechStatus('Speech ready');
    candidateRef.current = { sign: null, frames: 0 };
    lastCommitRef.current = { sign: null, at: 0 };
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (loopRef.current) {
        window.cancelAnimationFrame(loopRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      stopSpeech();
    };
  }, [resize]);

  return {
    videoRef,
    canvasRef,
    frameRef,
    isLive,
    isStarting,
    cameraStatus,
    modelStatus,
    helper,
    detected,
    transcript,
    speechStatus,
    start,
    speakTranscript,
    copyTranscript,
    clearTranscript
  };
}
