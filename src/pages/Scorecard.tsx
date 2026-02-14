import { useState } from 'react';
import { Trophy, Plus, ChevronDown, ChevronUp, Check, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import BackgroundPage from '../components/BackgroundPage';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES, PLAYERS } from '../lib/constants';
import { isValidScore } from '../lib/sanitize';
import type { Round } from '../lib/types';

// ── Biltmore Forest CC – Par 70 ─────────────────────────────────────
// Real par layout: Par 70 (35 front / 35 back)
const HOLE_PARS = [4, 4, 3, 4, 5, 4, 3, 4, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4];
const FRONT_PAR = HOLE_PARS.slice(0, 9).reduce((a, b) => a + b, 0);  // 35
const BACK_PAR = HOLE_PARS.slice(9).reduce((a, b) => a + b, 0);      // 35
const TOTAL_PAR = FRONT_PAR + BACK_PAR;                               // 70
const COURSE_NAME = 'Biltmore Forest CC';

function holeColor(score: number, par: number) {
  const diff = score - par;
  if (diff <= -2) return 'bg-yellow-500/80 text-black';   // eagle+
  if (diff === -1) return 'bg-green-600/80 text-white';   // birdie
  if (diff === 0) return 'bg-white/20 text-white';        // par
  if (diff === 1) return 'bg-red-500/60 text-white';      // bogey
  return 'bg-red-900/70 text-white';                      // double+
}

function formatToPar(total: number, parTotal: number): string {
  const diff = total - parTotal;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

function toParColor(total: number, parTotal: number): string {
  const diff = total - parTotal;
  if (diff < 0) return 'text-green-400';
  if (diff === 0) return 'text-white';
  return 'text-red-400';
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── New Round Form ──────────────────────────────────────────────────
function NewRoundForm({ onClose }: { onClose: () => void }) {
  const addRound = useStore((s) => s.addRound);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [holes, setHoles] = useState<9 | 18>(18);
  const [fmt, setFmt] = useState<Round['format']>('stroke');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedPlayerIds.length === PLAYERS.length) {
      setSelectedPlayerIds([]);
    } else {
      setSelectedPlayerIds(PLAYERS.map((p) => p.id));
    }
  };

  const submit = () => {
    if (selectedPlayerIds.length === 0) return;
    const round: Round = {
      id: uid(),
      date,
      course: COURSE_NAME,
      holes,
      format: fmt,
      scores: selectedPlayerIds.map((pid) => ({
        id: uid(),
        roundId: '',
        playerId: pid,
        holes: Array(holes).fill(null),
        total: 0,
      })),
      complete: false,
    };
    round.scores.forEach((s) => (s.roundId = round.id));
    addRound(round);
    onClose();
  };

  return (
    <div className="glass rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">New Round</h3>
        <button onClick={onClose} className="p-1"><X size={20} /></button>
      </div>

      <label className="block text-sm text-white/70 mb-1">Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm"
      />

      <label className="block text-sm text-white/70 mb-1">Course</label>
      <div className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm opacity-80">
        {COURSE_NAME} &middot; Par {TOTAL_PAR}
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-1">Holes</label>
          <select
            value={holes}
            onChange={(e) => setHoles(Number(e.target.value) as 9 | 18)}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white text-sm"
          >
            <option value={18}>18</option>
            <option value={9}>9</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-1">Format</label>
          <select
            value={fmt}
            onChange={(e) => setFmt(e.target.value as Round['format'])}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white text-sm"
          >
            <option value="stroke">Stroke</option>
            <option value="best-ball">Best Ball</option>
            <option value="scramble">Scramble</option>
            <option value="match">Match Play</option>
          </select>
        </div>
      </div>

      {/* Player Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-white/70">Golfers</label>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-[#c9a84c] hover:underline"
          >
            {selectedPlayerIds.length === PLAYERS.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLAYERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePlayer(p.id)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                selectedPlayerIds.includes(p.id)
                  ? 'bg-[#c9a84c]/30 text-[#c9a84c] border border-[#c9a84c]/50'
                  : 'bg-white/5 text-white/50 border border-white/10'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {selectedPlayerIds.length === 0 && (
          <p className="text-xs text-red-400/70 mt-1">Select at least one golfer</p>
        )}
      </div>

      <button
        onClick={submit}
        disabled={selectedPlayerIds.length === 0}
        className="w-full py-2.5 rounded-xl bg-[#c9a84c] text-[#1a3c2a] font-semibold text-sm disabled:opacity-40"
      >
        Create Round
      </button>
    </div>
  );
}

// ── Live Score Tracker (shows +/- par for each player) ─────────────
function LiveTracker({ round }: { round: Round }) {
  const pars = HOLE_PARS.slice(0, round.holes);

  return (
    <div className="mb-3 space-y-1.5">
      {round.scores.map((score) => {
        const player = PLAYERS.find((p) => p.id === score.playerId);
        const holesPlayed = score.holes.filter((h) => h !== null).length;
        const strokesPlayed = score.holes.reduce<number>((a, h) => a + (h ?? 0), 0);
        const parForPlayed = score.holes.reduce<number>((a, h, i) => a + (h !== null ? pars[i] : 0), 0);
        const thru = holesPlayed;

        return (
          <div key={score.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/90 w-28 truncate">
                {player?.name ?? '??'}
              </span>
              <span className="text-xs text-white/40">thru {thru}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{strokesPlayed || '-'}</span>
              <span className={`text-sm font-bold min-w-[36px] text-right ${
                holesPlayed === 0 ? 'text-white/30' : toParColor(strokesPlayed, parForPlayed)
              }`}>
                {holesPlayed === 0 ? '-' : formatToPar(strokesPlayed, parForPlayed)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Score Entry Grid ────────────────────────────────────────────────
function ScoreGrid({ round }: { round: Round }) {
  const updateRound = useStore((s) => s.updateRound);
  const pars = HOLE_PARS.slice(0, round.holes);
  const parTotal = pars.reduce((a, b) => a + b, 0);

  const setHoleScore = (scoreIdx: number, holeIdx: number, val: string) => {
    const num = parseInt(val, 10);
    const newScores = round.scores.map((s, si) => {
      if (si !== scoreIdx) return s;
      const newHoles = [...s.holes];
      if (val === '' || isNaN(num)) {
        newHoles[holeIdx] = null;
      } else if (isValidScore(num)) {
        newHoles[holeIdx] = num;
      } else {
        return s;
      }
      const total = newHoles.reduce<number>((a, h) => a + (h ?? 0), 0);
      return { ...s, holes: newHoles, total };
    });
    updateRound(round.id, { scores: newScores });
  };

  const markComplete = () => {
    const netScores = round.scores.map((s) => {
      const player = PLAYERS.find((p) => p.id === s.playerId);
      const hcpAdjust = player ? Math.round((player.handicap / 18) * round.holes) : 0;
      return { ...s, netTotal: s.total - hcpAdjust };
    });
    updateRound(round.id, { scores: netScores, complete: true });
  };

  const front = Array.from({ length: Math.min(9, round.holes) }, (_, i) => i);
  const back = round.holes === 18 ? Array.from({ length: 9 }, (_, i) => i + 9) : [];

  const renderNine = (holeIndexes: number[], label: string) => {
    const ninePar = holeIndexes.reduce((a, i) => a + pars[i], 0);
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/60 font-medium">{label}</span>
          <span className="text-xs text-white/30">Par {ninePar}</span>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs border-collapse min-w-[480px]">
            <thead>
              <tr className="text-white/50">
                <th className="text-left py-1 pr-2 sticky left-0 bg-black/40 z-10 min-w-[80px]">Hole</th>
                {holeIndexes.map((i) => (
                  <th key={i} className="text-center px-1 py-1 min-w-[28px]">{i + 1}</th>
                ))}
                <th className="text-center px-1 py-1 min-w-[32px]">Tot</th>
                <th className="text-center px-1 py-1 min-w-[36px]">+/-</th>
              </tr>
              <tr className="text-[#c9a84c]/70 border-b border-white/10">
                <td className="py-1 sticky left-0 bg-black/40 z-10">Par</td>
                {holeIndexes.map((i) => (
                  <td key={i} className="text-center px-1">{pars[i]}</td>
                ))}
                <td className="text-center font-medium">{ninePar}</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {round.scores.map((score, si) => {
                const player = PLAYERS.find((p) => p.id === score.playerId);
                const nineTotal = holeIndexes.reduce((a, i) => a + (score.holes[i] ?? 0), 0);
                const nineHolesPlayed = holeIndexes.filter((i) => score.holes[i] !== null).length;
                const nineParsPlayed = holeIndexes.reduce((a, i) => a + (score.holes[i] !== null ? pars[i] : 0), 0);
                return (
                  <tr key={score.id} className="border-b border-white/5">
                    <td className="py-1.5 pr-2 sticky left-0 bg-black/40 z-10 font-medium text-white/90 truncate max-w-[80px] text-xs">
                      {player?.name?.split(' ')[0] ?? '??'}
                    </td>
                    {holeIndexes.map((hi) => (
                      <td key={hi} className="text-center px-0.5">
                        {round.complete ? (
                          <span
                            className={`inline-block w-6 h-6 leading-6 rounded text-[10px] font-bold ${
                              score.holes[hi] != null ? holeColor(score.holes[hi]!, pars[hi]) : ''
                            }`}
                          >
                            {score.holes[hi] ?? '-'}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={score.holes[hi] ?? ''}
                            onChange={(e) => setHoleScore(si, hi, e.target.value)}
                            className={`w-7 h-7 text-center rounded text-[11px] font-bold border-0 outline-none ${
                              score.holes[hi] != null
                                ? holeColor(score.holes[hi]!, pars[hi])
                                : 'bg-white/5 text-white/50'
                            }`}
                          />
                        )}
                      </td>
                    ))}
                    <td className="text-center font-bold text-white/90 min-w-[32px]">
                      {nineHolesPlayed > 0 ? nineTotal : '-'}
                    </td>
                    <td className={`text-center font-bold min-w-[36px] text-xs ${
                      nineHolesPlayed === 0 ? 'text-white/30' : toParColor(nineTotal, nineParsPlayed)
                    }`}>
                      {nineHolesPlayed > 0 ? formatToPar(nineTotal, nineParsPlayed) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Overall totals
  const renderTotals = () => (
    <div className="border-t border-white/10 pt-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/60 font-medium">Totals</span>
        <span className="text-xs text-white/30">Par {parTotal}</span>
      </div>
      <div className="space-y-1.5">
        {round.scores.map((score) => {
          const player = PLAYERS.find((p) => p.id === score.playerId);
          const holesPlayed = score.holes.filter((h) => h !== null).length;
          const total = score.total;
          const parPlayed = score.holes.reduce<number>((a, h, i) => a + (h !== null ? pars[i] : 0), 0);
          return (
            <div key={score.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-white/90">{player?.name ?? '??'}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/40">
                  {holesPlayed}/{round.holes} holes
                </span>
                <span className="text-sm font-bold text-white/90 w-8 text-right">
                  {holesPlayed > 0 ? total : '-'}
                </span>
                <span className={`text-sm font-bold w-10 text-right ${
                  holesPlayed === 0 ? 'text-white/30' : toParColor(total, parPlayed)
                }`}>
                  {holesPlayed > 0 ? formatToPar(total, parPlayed) : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold">{round.course}</h3>
          <p className="text-xs text-white/50">
            {format(new Date(round.date + 'T00:00:00'), 'MMM d, yyyy')} &middot; {round.holes} holes &middot;{' '}
            Par {round.holes === 18 ? TOTAL_PAR : FRONT_PAR} &middot; {round.format}
          </p>
        </div>
        {round.complete && (
          <span className="text-[10px] bg-green-600/40 text-green-300 px-2 py-0.5 rounded-full font-medium">
            Final
          </span>
        )}
      </div>

      {/* Live tracker when round is in progress */}
      {!round.complete && <LiveTracker round={round} />}

      {renderNine(front, 'Front 9')}
      {back.length > 0 && renderNine(back, 'Back 9')}

      {renderTotals()}

      {!round.complete && (
        <button
          onClick={markComplete}
          className="w-full py-2 rounded-xl bg-green-600/80 text-white font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Check size={16} /> Finalize Round
        </button>
      )}
    </div>
  );
}

// ── Leaderboard ─────────────────────────────────────────────────────
function Leaderboard({ rounds }: { rounds: Round[] }) {
  const completed = rounds.filter((r) => r.complete);
  if (completed.length === 0) return null;

  const totals = new Map<string, { gross: number; net: number; rounds: number; parTotal: number }>();
  for (const r of completed) {
    const pars = HOLE_PARS.slice(0, r.holes);
    const rParTotal = pars.reduce((a, b) => a + b, 0);
    for (const s of r.scores) {
      const prev = totals.get(s.playerId) ?? { gross: 0, net: 0, rounds: 0, parTotal: 0 };
      totals.set(s.playerId, {
        gross: prev.gross + s.total,
        net: prev.net + (s.netTotal ?? s.total),
        rounds: prev.rounds + 1,
        parTotal: prev.parTotal + rParTotal,
      });
    }
  }

  const sorted = [...totals.entries()]
    .map(([id, data]) => ({ player: PLAYERS.find((p) => p.id === id), ...data }))
    .filter((x) => x.player)
    .sort((a, b) => a.gross - b.gross);

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-[#c9a84c]" /> Leaderboard
      </h3>
      <div className="space-y-2">
        {sorted.map((entry, i) => (
          <div
            key={entry.player!.id}
            className={`flex items-center justify-between px-3 py-2 rounded-xl ${
              i === 0 ? 'bg-[#c9a84c]/20 border border-[#c9a84c]/40' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-[#c9a84c] text-[#1a3c2a]' : 'bg-white/10 text-white/60'
              }`}>
                {i + 1}
              </span>
              <div>
                <span className="font-medium text-sm">{entry.player!.name}</span>
                <span className="text-xs text-white/40 ml-2">
                  ({entry.rounds} rd{entry.rounds > 1 ? 's' : ''})
                </span>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <div className="text-sm font-bold">{entry.gross}</div>
                <div className="text-[10px] text-white/40">gross</div>
              </div>
              <div className={`text-sm font-bold ${toParColor(entry.gross, entry.parTotal)}`}>
                {formatToPar(entry.gross, entry.parTotal)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Scorecard Page ─────────────────────────────────────────────
export default function Scorecard() {
  const rounds = useStore((s) => s.rounds);
  const deleteRound = useStore((s) => s.deleteRound);
  const [showForm, setShowForm] = useState(false);
  const [expandedRound, setExpandedRound] = useState<string | null>(null);

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.scorecard}>
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Scorecard</h2>
            <p className="text-white/40 text-sm">{COURSE_NAME} &middot; Par {TOTAL_PAR}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm bg-[#c9a84c] text-[#1a3c2a] px-3.5 py-2 rounded-xl font-semibold"
          >
            <Plus size={16} /> New Round
          </button>
        </div>

        {showForm && <NewRoundForm onClose={() => setShowForm(false)} />}

        <Leaderboard rounds={rounds} />

        {rounds.length === 0 && !showForm && (
          <div className="glass rounded-2xl p-8 text-center">
            <Trophy size={40} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/50 text-sm">No rounds yet. Create your first round to start tracking scores.</p>
          </div>
        )}

        {[...rounds].reverse().map((round) => (
          <div key={round.id}>
            {expandedRound === round.id ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <button
                    onClick={() => setExpandedRound(null)}
                    className="text-xs text-white/50 flex items-center gap-1"
                  >
                    <ChevronUp size={14} /> Collapse
                  </button>
                  <button
                    onClick={() => { deleteRound(round.id); setExpandedRound(null); }}
                    className="text-xs text-red-400/60 flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
                <ScoreGrid round={round} />
              </div>
            ) : (
              <button
                onClick={() => setExpandedRound(round.id)}
                className="glass rounded-2xl p-4 mb-3 w-full text-left flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-sm">{round.course}</h4>
                  <p className="text-xs text-white/50">
                    {format(new Date(round.date + 'T00:00:00'), 'MMM d')} &middot; {round.holes}h &middot;{' '}
                    Par {round.holes === 18 ? TOTAL_PAR : FRONT_PAR} &middot; {round.format}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {round.complete && (
                    <span className="text-[10px] bg-green-600/40 text-green-300 px-2 py-0.5 rounded-full">Final</span>
                  )}
                  <ChevronDown size={16} className="text-white/40" />
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </BackgroundPage>
  );
}
