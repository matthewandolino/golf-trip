import { useState } from 'react';
import { DollarSign, Plus, X, TrendingUp, TrendingDown, Check, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import BackgroundPage from '../components/BackgroundPage';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES, PLAYERS } from '../lib/constants';
import { isValidAmount } from '../lib/sanitize';
import type { Bet, BetResult } from '../lib/types';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const BET_TYPE_LABELS: Record<Bet['type'], string> = {
  nassau: 'Nassau',
  skins: 'Skins',
  'closest-to-pin': 'Closest to Pin',
  'long-drive': 'Long Drive',
  custom: 'Custom',
};

// ── New Bet Form ────────────────────────────────────────────────────
function NewBetForm({ onClose }: { onClose: () => void }) {
  const addBet = useStore((s) => s.addBet);
  const rounds = useStore((s) => s.rounds);
  const [betType, setBetType] = useState<Bet['type']>('nassau');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [roundId, setRoundId] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(PLAYERS.map((p) => p.id));
  const [error, setError] = useState('');

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const submit = () => {
    const amt = parseFloat(amount);
    if (!title.trim()) { setError('Enter a title'); return; }
    if (!amount || isNaN(amt) || !isValidAmount(amt)) { setError('Enter a valid positive amount'); return; }
    if (selectedPlayers.length < 2) { setError('Select at least 2 players'); return; }
    setError('');

    const bet: Bet = {
      id: uid(),
      type: betType,
      title: title.trim(),
      amount: amt,
      roundId: roundId || undefined,
      participants: selectedPlayers,
      results: [],
      settled: false,
    };
    addBet(bet);
    onClose();
  };

  const activeRounds = rounds.filter((r) => !r.complete);
  const completedRounds = rounds.filter((r) => r.complete);

  return (
    <div className="glass rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">New Bet</h3>
        <button onClick={onClose} className="p-1"><X size={20} /></button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <label className="block text-sm text-white/70 mb-1">Type</label>
      <select
        value={betType}
        onChange={(e) => setBetType(e.target.value as Bet['type'])}
        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm"
      >
        {(Object.keys(BET_TYPE_LABELS) as Bet['type'][]).map((t) => (
          <option key={t} value={t} className="bg-[#1a3c2a]">{BET_TYPE_LABELS[t]}</option>
        ))}
      </select>

      <label className="block text-sm text-white/70 mb-1">Title</label>
      <input
        type="text"
        maxLength={80}
        placeholder="e.g. Front 9 Nassau"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm placeholder:text-white/30"
      />

      <label className="block text-sm text-white/70 mb-1">Amount ($)</label>
      <input
        type="number"
        step="0.01"
        min="0.01"
        placeholder="10.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm placeholder:text-white/30"
      />

      {/* Linked Round */}
      <label className="block text-sm text-white/70 mb-1">
        <span className="flex items-center gap-1"><Link2 size={14} /> Link to Round</span>
      </label>
      {rounds.length === 0 ? (
        <p className="text-xs text-white/30 mb-3">No rounds created yet. Create a round in Scores first.</p>
      ) : (
        <select
          value={roundId}
          onChange={(e) => setRoundId(e.target.value)}
          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm"
        >
          <option value="" className="bg-[#1a3c2a]">No linked round</option>
          {activeRounds.length > 0 && (
            <optgroup label="Live Rounds" className="bg-[#1a3c2a]">
              {activeRounds.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#1a3c2a]">
                  {format(new Date(r.date + 'T00:00:00'), 'MMM d')} &middot; {r.holes}h {r.format} (In Progress)
                </option>
              ))}
            </optgroup>
          )}
          {completedRounds.length > 0 && (
            <optgroup label="Completed Rounds" className="bg-[#1a3c2a]">
              {completedRounds.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#1a3c2a]">
                  {format(new Date(r.date + 'T00:00:00'), 'MMM d')} &middot; {r.holes}h {r.format} (Final)
                </option>
              ))}
            </optgroup>
          )}
        </select>
      )}

      <label className="block text-sm text-white/70 mb-2">Participants</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {PLAYERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => togglePlayer(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedPlayers.includes(p.id)
                ? 'bg-[#c9a84c] text-[#1a3c2a]'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        className="w-full py-2.5 rounded-xl bg-[#c9a84c] text-[#1a3c2a] font-semibold text-sm"
      >
        Create Bet
      </button>
    </div>
  );
}

// ── Settle Bet Modal ────────────────────────────────────────────────
function SettleBetForm({ bet, onClose }: { bet: Bet; onClose: () => void }) {
  const settleBet = useStore((s) => s.settleBet);
  const [results, setResults] = useState<Record<string, string>>(
    Object.fromEntries(bet.participants.map((pid) => [pid, '']))
  );
  const [error, setError] = useState('');

  const submit = () => {
    const parsed: BetResult[] = [];
    for (const pid of bet.participants) {
      const val = parseFloat(results[pid]);
      if (results[pid] === '' || isNaN(val)) { setError('Enter amounts for all players'); return; }
      if (!Number.isFinite(val)) { setError('Invalid amount'); return; }
      const parts = results[pid].replace('-', '').split('.');
      if (parts[1] && parts[1].length > 2) { setError('Max 2 decimal places'); return; }
      parsed.push({ playerId: pid, amount: val });
    }
    setError('');
    settleBet(bet.id, parsed);
    onClose();
  };

  return (
    <div className="border-t border-white/10 pt-3 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Settle Bet</h4>
        <button onClick={onClose} className="p-1 text-white/40"><X size={16} /></button>
      </div>
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      <p className="text-xs text-white/40 mb-3">+ for winners, - for losers</p>
      {bet.participants.map((pid) => {
        const player = PLAYERS.find((p) => p.id === pid);
        return (
          <div key={pid} className="flex items-center gap-3 mb-2">
            <span className="text-sm w-24 truncate text-white/80">{player?.name}</span>
            <div className="flex-1 flex items-center gap-1">
              <span className="text-white/30 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={results[pid]}
                onChange={(e) => setResults((prev) => ({ ...prev, [pid]: e.target.value }))}
                className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white text-sm placeholder:text-white/30"
              />
            </div>
          </div>
        );
      })}
      <button
        onClick={submit}
        className="w-full mt-3 py-2.5 rounded-xl bg-green-600/80 text-white font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Check size={16} /> Settle Bet
      </button>
    </div>
  );
}

// ── Bet Card ────────────────────────────────────────────────────────
function BetCard({ bet }: { bet: Bet }) {
  const [showSettle, setShowSettle] = useState(false);
  const deleteBet = useStore((s) => s.deleteBet);
  const rounds = useStore((s) => s.rounds);
  const linkedRound = bet.roundId ? rounds.find((r) => r.id === bet.roundId) : null;

  return (
    <div className="glass rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] font-medium shrink-0">
            {BET_TYPE_LABELS[bet.type]}
          </span>
          <h4 className="font-semibold text-sm truncate">{bet.title}</h4>
        </div>
        <span className="text-sm font-bold text-[#c9a84c] shrink-0 ml-2">${bet.amount.toFixed(2)}</span>
      </div>

      {/* Linked round badge */}
      {linkedRound && (
        <div className="flex items-center gap-1.5 mb-2 text-xs">
          <Link2 size={12} className="text-white/40" />
          <span className="text-white/50">
            {format(new Date(linkedRound.date + 'T00:00:00'), 'MMM d')} &middot; {linkedRound.holes}h {linkedRound.format}
          </span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
            linkedRound.complete
              ? 'bg-green-600/30 text-green-300'
              : 'bg-blue-500/30 text-blue-300'
          }`}>
            {linkedRound.complete ? 'Final' : 'Live'}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {bet.participants.map((pid) => {
          const player = PLAYERS.find((p) => p.id === pid);
          return (
            <span key={pid} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">
              {player?.name}
            </span>
          );
        })}
      </div>

      {bet.settled ? (
        <div>
          <div className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
            <Check size={12} /> Settled
          </div>
          <div className="space-y-1">
            {bet.results.map((r) => {
              const player = PLAYERS.find((p) => p.id === r.playerId);
              return (
                <div key={r.playerId} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{player?.name}</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    r.amount >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {r.amount >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {r.amount >= 0 ? '+' : ''}${r.amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : showSettle ? (
        <SettleBetForm bet={bet} onClose={() => setShowSettle(false)} />
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettle(true)}
            className="flex-1 py-2 rounded-xl bg-green-600/60 text-white text-xs font-semibold"
          >
            Settle
          </button>
          <button
            onClick={() => deleteBet(bet.id)}
            className="py-2 px-3 rounded-xl bg-red-500/20 text-red-400 text-xs font-semibold"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Settlement Summary ──────────────────────────────────────────────
function SettlementSummary() {
  const bets = useStore((s) => s.bets);
  const settled = bets.filter((b) => b.settled);
  if (settled.length === 0) return null;

  const balances = new Map<string, number>();
  for (const bet of settled) {
    for (const r of bet.results) {
      balances.set(r.playerId, (balances.get(r.playerId) ?? 0) + r.amount);
    }
  }

  const entries = [...balances.entries()]
    .map(([id, bal]) => ({ player: PLAYERS.find((p) => p.id === id)!, balance: bal }))
    .filter((e) => e.player)
    .sort((a, b) => b.balance - a.balance);

  if (entries.every((e) => e.balance === 0)) return null;

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <h3 className="text-base font-semibold mb-3">Running Tally</h3>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.player.id} className="flex items-center justify-between">
            <span className="text-sm text-white/80">{e.player.name}</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${
              e.balance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {e.balance >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {e.balance >= 0 ? '+' : ''}${e.balance.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Betting Page ───────────────────────────────────────────────
export default function Betting() {
  const bets = useStore((s) => s.bets);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'settled'>('all');

  const filteredBets = bets.filter((b) => {
    if (filter === 'active') return !b.settled;
    if (filter === 'settled') return b.settled;
    return true;
  });

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.betting}>
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Betting</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm bg-[#c9a84c] text-[#1a3c2a] px-3.5 py-2 rounded-xl font-semibold"
          >
            <Plus size={16} /> New Bet
          </button>
        </div>

        {showForm && <NewBetForm onClose={() => setShowForm(false)} />}

        <SettlementSummary />

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'settled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                filter === f ? 'bg-[#c9a84c] text-[#1a3c2a]' : 'bg-white/10 text-white/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredBets.length === 0 && !showForm && (
          <div className="glass rounded-2xl p-8 text-center">
            <DollarSign size={40} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/50 text-sm">
              {bets.length === 0
                ? 'No bets yet. Create your first bet to start the action.'
                : 'No bets match this filter.'}
            </p>
          </div>
        )}

        {[...filteredBets].reverse().map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>
    </BackgroundPage>
  );
}
