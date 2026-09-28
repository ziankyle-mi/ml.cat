import { HashRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import { Draft } from './pages/Draft';
import { Counter } from './pages/Counter';
import { HeroPage } from './pages/HeroPage';
import { RetriGame } from './pages/RetriGame';
import { Sandbox } from './pages/Sandbox';
import heroesData from './data/heroes.json';
import type { Hero } from './types/hero';

const heroes = heroesData as Hero[];

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-ink text-paper">
        <Navbar heroes={heroes} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/draft" element={<Draft />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/retri" element={<RetriGame />} />
            <Route path="/hero/:id" element={<HeroPage />} />
            <Route path="/sandbox" element={<Sandbox />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
