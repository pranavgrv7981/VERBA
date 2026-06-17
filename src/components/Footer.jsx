export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <a className="brand" href="#top" aria-label="Verba home">
            <span className="brand-mark" aria-hidden="true">V</span>
            Verba
          </a>
          <p>AI-powered accessibility for real-time sign language communication.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#impact">About</a>
          <a href="mailto:hello@verba.ai">Contact</a>
          <a href="#roadmap">Team</a>
          <a href="#features">Accessibility</a>
          <a href="#demo">GitHub</a>
          <a href="#top">Privacy</a>
        </nav>
      </div>
    </footer>
  );
}
