import Icon from './Icon.jsx';
import { useHeaderScroll } from '../hooks/useHeaderScroll.js';

export default function Header() {
  const isScrolled = useHeaderScroll();

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Verba home">
          <span className="brand-mark" aria-hidden="true">V</span>
          Verba
        </a>
        <div className="nav-links">
          <a href="#demo">Demo</a>
          <a href="#features">Features</a>
          <a href="#impact">Impact</a>
          <a href="#roadmap">Roadmap</a>
          <a className="nav-cta" href="#demo">
            <Icon name="arrow" />
            Prototype
          </a>
        </div>
      </nav>
    </header>
  );
}
