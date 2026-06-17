import Icon from './Icon.jsx';

export default function Hero() {
  return (
    <section className="section hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="reveal">
          <div className="eyebrow">
            <span className="pulse-dot" aria-hidden="true" />
            Real-time accessibility AI
          </div>
          <h1 id="hero-title">
            Every Gesture <span>Deserves A Voice.</span>
          </h1>
          <p className="lead">
            Verba turns sign language into text and speech through live hand tracking,
            conversation transcripts, and an expandable AI recognition layer.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#demo">
              <Icon name="play" />
              Start Live Demo
            </a>
            <a className="btn btn-secondary" href="#features">
              <Icon name="plus" />
              Explore System
            </a>
          </div>
          <div className="hero-proof" aria-label="Prototype capabilities">
            <div>
              <strong>Live webcam</strong>
              <span>secure browser camera</span>
            </div>
            <div>
              <strong>Hand landmarks</strong>
              <span>21-point motion tracking</span>
            </div>
            <div>
              <strong>Voice output</strong>
              <span>spoken transcript layer</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="mac-window">
            <div className="traffic-lights"><span /><span /><span /></div>
            <div className="hand-stage">
              <div className="gesture-orbit" />
              <div className="synthetic-hand">
                <span className="finger f1" />
                <span className="finger f2" />
                <span className="finger f3" />
                <span className="finger f4" />
                <span className="thumb" />
                <span className="palm" />
                <span className="landmark lm1" />
                <span className="landmark lm2" />
                <span className="landmark lm3" />
                <span className="landmark lm4" />
                <span className="landmark lm5" />
              </div>
            </div>
            <div className="mini-console">
              <span>ASL</span>
              <strong>Hello, nice to meet you.</strong>
              <em>voice ready</em>
            </div>
          </div>
        </div>
      </div>
      <div className="next-hint" aria-hidden="true">
        <span>Scroll to translate</span>
        <span className="mouse-line" />
      </div>
    </section>
  );
}
