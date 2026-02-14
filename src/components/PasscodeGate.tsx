import { useState } from 'react';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES } from '../lib/constants';

export default function PasscodeGate() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [step, setStep] = useState<'passcode' | 'player'>('passcode');
  const authenticate = useStore((s) => s.authenticate);
  const setCurrentPlayer = useStore((s) => s.setCurrentPlayer);
  const players = useStore((s) => s.players);
  const tripConfig = useStore((s) => s.tripConfig);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticate(passcode)) {
      setError(false);
      setStep('player');
    } else {
      setError(true);
      setPasscode('');
    }
  };

  const handlePlayerSelect = () => {
    if (playerId) {
      setCurrentPlayer(playerId);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGES.home})` }}
      />
      <div className="fixed inset-0 bg-black/70" />

      <div className="relative z-10 w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl text-[#c9a84c] mb-2">{tripConfig.tripName}</h1>
          <p className="text-white/50 text-sm tracking-widest uppercase">
            {tripConfig.location}
          </p>
        </div>

        {step === 'passcode' ? (
          <form onSubmit={handlePasscodeSubmit}>
            <div className="glass rounded-2xl p-6">
              <label className="block text-white/60 text-sm mb-3 text-center">
                Enter trip passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Passcode"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-lg tracking-wider placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-sm text-center mt-3">
                  Incorrect passcode. Try again.
                </p>
              )}
              <button
                type="submit"
                className="w-full mt-4 bg-[#c9a84c] text-[#1a3c2a] font-semibold py-3 rounded-lg hover:bg-[#d4b65d] transition-colors"
              >
                Enter
              </button>
            </div>
          </form>
        ) : (
          <div className="glass rounded-2xl p-6">
            <label className="block text-white/60 text-sm mb-3 text-center">
              Who are you?
            </label>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setPlayerId(player.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    playerId === player.id
                      ? 'bg-[#c9a84c]/20 border border-[#c9a84c]/50 text-white'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">{player.name}</span>
                  {player.nickname && (
                    <span className="text-white/40 ml-2">({player.nickname})</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handlePlayerSelect}
              disabled={!playerId}
              className="w-full bg-[#c9a84c] text-[#1a3c2a] font-semibold py-3 rounded-lg hover:bg-[#d4b65d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
