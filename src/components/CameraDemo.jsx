import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import ModelSwitcher from './ModelSwitcher.jsx';
import { SIGN_SETS } from '../lib/aslRecognizer.js';
import { useSignRecognition } from '../hooks/useSignRecognition.js';

export default function CameraDemo() {
  const [activeModelId, setActiveModelId] = useState('gesture');
  const ai = useSignRecognition(activeModelId);

  const handleSwitch = (modelId, customUrl) => {
    setActiveModelId(modelId);
    ai.handleModelSwitch(modelId, customUrl);
  };

  const rawText = ai.transcript.length
    ? ai.transcript.map(i => i.text).join(' ')
    : 'Signs will appear here.';

  const signs = SIGN_SETS[activeModelId] ?? SIGN_SETS.gesture;

  return (
    <section className="section camera-section" id="demo" aria-labelledby="demo-title">
      <div className="wrap">
        <SectionHeader
          kicker="Live AI camera demo"
          title="Sign language → real sentences, spoken aloud."
        >
          Pick a model, open the camera, sign — Verba converts detections into text.
          Every 3 signs the AI builds a natural sentence and speaks it.
        </SectionHeader>

        {/* Model switcher — outside the camera frame, always visible */}
        <div className="model-switcher-row">
          <ModelSwitcher
            activeId={activeModelId}
            onSwitch={handleSwitch}
            isSwitching={ai.isSwitching}
            isLive={ai.isLive}
          />
        </div>

        <div className="camera-stage">
          <div className={`camera-frame ${ai.isLive ? 'live' : ''}`} ref={ai.frameRef}>
            <video className="camera-video" ref={ai.videoRef} autoPlay playsInline muted />
            <canvas className="landmark-canvas" ref={ai.canvasRef} aria-hidden="true" />

            {!ai.isLive && (
              <div className="ai-empty">
                <div>
                  <strong>Start the live AI demo</strong>
                  Allow camera, choose a model, sign — Verba translates to speech.
                </div>
              </div>
            )}

            <div className="scanline" aria-hidden="true" />
            <div className="camera-topbar">
              <span className="status-pill">
                <span className="pulse-dot" aria-hidden="true" />
                {ai.cameraStatus}
              </span>
              <span className="status-pill">{ai.modelStatus}</span>
            </div>

            <span className="corner c1" aria-hidden="true" />
            <span className="corner c2" aria-hidden="true" />
            <span className="corner c3" aria-hidden="true" />
            <span className="corner c4" aria-hidden="true" />

            <aside className="model-note">
              <strong>Supported signs</strong>
              <span>{signs.length === 1 ? signs[0] : signs.slice(0, 20).join(' · ')}{signs.length > 20 ? ' …' : ''}</span>
            </aside>

            <aside className="translation-panel" aria-label="Live translation output">
              <div className="translation-label">
                <span>{ai.detected?.display || 'Detected sign'}</span>
                <span>{ai.detected ? `${Math.round(ai.detected.confidence * 100)}%` : '--'}</span>
              </div>
              <div className="translation-text" aria-live="polite">
                {ai.detected?.value || 'Show a hand sign'}
              </div>
              <p className="translation-helper">{ai.helper}</p>

              <div className="sentence-output" aria-live="polite">{rawText}</div>

              <div className="ai-sentence-panel">
                <div className="ai-sentence-label">
                  <span>✦ AI sentence</span>
                  <span className="ai-status-tag">{ai.aiStatus || 'waiting for signs…'}</span>
                </div>
                <div className="ai-sentence-text" aria-live="polite">
                  {ai.aiSentence || 'Sign 3+ gestures and AI will form a sentence here.'}
                </div>
              </div>

              <div className="transcript-list" aria-label="Recent transcript">
                <span>Recent signs</span>
                {ai.transcript.length ? (
                  ai.transcript.slice(-4).map(item => (
                    <div className="transcript-item" key={item.id}>
                      <strong>{item.text}</strong>
                      <em>{item.time} / {Math.round(item.confidence * 100)}%</em>
                    </div>
                  ))
                ) : <p>No signs captured yet.</p>}
              </div>

              <div className="speech-row">
                <div className="wave" aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
                </div>
                <span className="confidence">{ai.speechStatus}</span>
              </div>

              <div className="control-row">
                <button className="ai-button" type="button" onClick={ai.start}
                  disabled={ai.isStarting || ai.cameraStatus === 'AI running'}>
                  {ai.isStarting ? 'Starting…' : ai.cameraStatus === 'AI running' ? 'AI Running' : 'Start'}
                </button>
                <button className="ai-button secondary" type="button" onClick={ai.buildAiNow}
                  disabled={!ai.transcript.length}>Build Sentence</button>
                <button className="ai-button secondary" type="button" onClick={ai.speakAiSentence}
                  disabled={!ai.aiSentence}>Speak AI</button>
                <button className="ai-button secondary" type="button" onClick={ai.speakTranscript}
                  disabled={!ai.transcript.length}>Speak Raw</button>
                <button className="ai-button secondary" type="button" onClick={ai.copyTranscript}
                  disabled={!ai.transcript.length}>Copy</button>
                <button className="ai-button secondary" type="button" onClick={ai.clearTranscript}
                  disabled={!ai.transcript.length}>Clear</button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
