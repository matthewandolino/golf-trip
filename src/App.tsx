import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import PasscodeGate from './components/PasscodeGate';
import Home from './pages/Home';
import Travel from './pages/Travel';
import Schedule from './pages/Schedule';
import Scorecard from './pages/Scorecard';
import Betting from './pages/Betting';
import Expenses from './pages/Expenses';
import Quarters from './pages/Quarters';
import Chat from './pages/Chat';
import { useStore } from './store/useStore';

export default function App() {
  const authenticated = useStore((s) => s.auth.authenticated);
  const currentPlayerId = useStore((s) => s.auth.currentPlayerId);

  if (!authenticated || !currentPlayerId) {
    return <PasscodeGate />;
  }

  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/betting" element={<Betting />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/quarters" element={<Quarters />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
