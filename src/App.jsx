import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import CameraDemo from './components/CameraDemo.jsx';
import ConversationModes from './components/ConversationModes.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Features from './components/Features.jsx';
import Architecture from './components/Architecture.jsx';
import Coverage from './components/Coverage.jsx';
import Impact from './components/Impact.jsx';
import Roadmap from './components/Roadmap.jsx';
import Footer from './components/Footer.jsx';
import { useReveal } from './hooks/useReveal.js';

export default function App() {
  useReveal();

  return (
    <>
      <div className="ambient-grid" aria-hidden="true" />
      <Header />
      <main id="top">
        <Hero />
        <CameraDemo />
        <ConversationModes />
        <HowItWorks />
        <Features />
        <Architecture />
        <Coverage />
        <Impact />
        <Roadmap />
      </main>
      <Footer />
    </>
  );
}
