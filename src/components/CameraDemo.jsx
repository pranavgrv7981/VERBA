import SectionHeader from './SectionHeader.jsx';
import { supportedSigns } from '../lib/aslRecognizer.js';
import { useSignRecognition } from '../hooks/useSignRecognition.js';

export default function CameraDemo() {
  const ai = useSignRecognition();
  const outputText = ai.transcript.length
    ? ai.transcript.map((item) => item.text).join(' ')
    : 'Output will appear here.';

  return (
    <section className="section camera-section" id="demo" aria-labelledby="demo-title">
      <div className="wrap">
        <SectionHeader
          kicker="Live AI camera demo"
          title="A black macOS-style cockpit for real-time sign understanding."
        >
          Open the camera, show one supported sign at a time, and Verba will convert stable detections into
          text and speech. The recognizer is isolated so a trained full-ASL model can replace it later.
        </SectionHeader>

        <div className="camera-stage">
          <div className={`camera-frame ${ai.isLive ? 'live' : ''}`} ref={ai.frameRef}>
            <video className="camera-video" ref={ai.videoRef} autoPlay playsInline muted />
            <canvas className="landmark-canvas" ref={ai.canvasRef} aria-hidden="true" />

            {!ai.isLive && (
              <div className="ai-empty">
                <div>
                  <strong>Start the live AI demo</strong>
                  Allow camera access, hold an ASL handshape, and Verba will translate it into speech-ready text.
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
              <strong>Supported now</strong>
              <span>{supportedSigns.join(' | ')}</span>
              <em>Full ASL conversation needs a trained model. This UI is ready for that upgrade.</em>
            </aside>

            <aside className="translation-panel" aria-label="Live translation output">
              <div className="translation-label">
                <span>{ai.detected?.display || 'Detected sign'}</span>
                <span>{ai.detected ? `Confidence ${Math.round(ai.detected.confidence * 100)}%` : 'Confidence --'}</span>
              </div>

              <div className="translation-text" aria-live="polite">
                {ai.detected?.value || 'Show a hand sign'}
              </div>

              <p className="translation-helper">{ai.helper}</p>
              <div className="sentence-output" aria-live="polite">{outputText}</div>

              <div className="transcript-list" aria-label="Recent transcript">
                <span>Recent transcript</span>
                {ai.transcript.length ? (
                  ai.transcript.slice(-4).map((item) => (
                    <div className="transcript-item" key={item.id}>
                      <strong>{item.text}</strong>
                      <em>{item.time} / {Math.round(item.confidence * 100)}%</em>
                    </div>
                  ))
                ) : (
                  <p>No signs captured yet.</p>
                )}
              </div>

              <div className="speech-row">
                <div className="wave" aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, index) => <span key={index} />)}
                </div>
                <span className="confidence">{ai.speechStatus}</span>
              </div>

              <div className="control-row">
                <button className="ai-button" type="button" onClick={ai.start} disabled={ai.isStarting || ai.cameraStatus === 'AI running'}>
                  {ai.isStarting ? 'Starting...' : ai.cameraStatus === 'AI running' ? 'AI Running' : 'Start AI Demo'}
                </button>
                <button className="ai-button secondary" type="button" onClick={ai.speakTranscript} disabled={!ai.transcript.length}>
                  Speak Output
                </button>
                <button className="ai-button secondary" type="button" onClick={ai.copyTranscript} disabled={!ai.transcript.length}>
                  Copy
                </button>
                <button className="ai-button secondary" type="button" onClick={ai.clearTranscript} disabled={!ai.transcript.length}>
                  Clear
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
