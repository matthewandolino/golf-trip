import { useState } from 'react';
import { Calendar, Plus, X, ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import BackgroundPage from '../components/BackgroundPage';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES } from '../lib/constants';
import type { TeeTime, Event as TripEvent, TeamPairing } from '../lib/types';

const EVENT_COLORS: Record<TripEvent['type'], string> = {
  golf: 'border-l-green-400',
  dinner: 'border-l-amber-400',
  bar: 'border-l-purple-400',
  activity: 'border-l-blue-400',
  other: 'border-l-white/30',
};

const EVENT_LABELS: Record<TripEvent['type'], string> = {
  golf: 'Golf',
  dinner: 'Dinner',
  bar: 'Bar',
  activity: 'Activity',
  other: 'Other',
};

export default function Schedule() {
  const tripConfig = useStore((s) => s.tripConfig);
  const schedule = useStore((s) => s.schedule);
  const players = useStore((s) => s.players);
  const addTeeTime = useStore((s) => s.addTeeTime);
  const addEvent = useStore((s) => s.addEvent);
  const removeTeeTime = useStore((s) => s.removeTeeTime);
  const removeEvent = useStore((s) => s.removeEvent);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showTeeModal, setShowTeeModal] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState<string | null>(null);

  const tripDays = eachDayOfInterval({
    start: parseISO(tripConfig.startDate),
    end: parseISO(tripConfig.endDate),
  });

  const getDayData = (dateStr: string) =>
    schedule.find((d) => d.date === dateStr) ?? { date: dateStr, teeTimes: [], events: [] };

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.schedule}>
      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        <div className="mb-6">
          <h1 className="text-2xl text-white">Schedule</h1>
          <p className="text-white/40 text-sm">Day-by-day itinerary</p>
        </div>

        {tripDays.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} />}
            title="No schedule set"
            message="Trip dates will appear here once configured."
          />
        ) : (
          <div className="space-y-3">
            {tripDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayData = getDayData(dateStr);
              const isExpanded = expandedDay === dateStr;
              const totalItems = dayData.teeTimes.length + dayData.events.length;

              return (
                <GlassCard key={dateStr} className="p-0 overflow-hidden">
                  {/* Day Header */}
                  <button
                    onClick={() =>
                      setExpandedDay(isExpanded ? null : dateStr)
                    }
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">
                        {format(day, 'EEEE')}
                      </p>
                      <p className="text-white/40 text-xs">
                        {format(day, 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {totalItems > 0 && (
                        <span className="text-xs text-white/40">
                          {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-white/40" />
                      ) : (
                        <ChevronDown size={16} className="text-white/40" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 space-y-3">
                      {/* Tee Times */}
                      {dayData.teeTimes.map((tt) => (
                        <div
                          key={tt.id}
                          className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-300 text-xs font-medium uppercase tracking-wider">
                                Tee Time
                              </span>
                            </div>
                            <button
                              onClick={() => removeTeeTime(dateStr, tt.id)}
                              className="text-white/30 hover:text-red-400"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-white/60 text-xs mb-2">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {tt.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {tt.course}
                            </span>
                            <span>{tt.holes} holes</span>
                          </div>
                          {tt.teams.length > 0 && (
                            <div className="space-y-1">
                              {tt.teams.map((team, i) => (
                                <div key={i} className="text-xs text-white/50">
                                  <span className="text-white/70">{team.name}:</span>{' '}
                                  {team.playerIds
                                    .map((pid) => getPlayer(pid)?.name ?? pid)
                                    .join(', ')}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Events */}
                      {dayData.events.map((evt) => (
                        <div
                          key={evt.id}
                          className={`border-l-2 ${EVENT_COLORS[evt.type]} bg-white/5 rounded-r-lg p-3`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/40 text-xs uppercase tracking-wider">
                              {EVENT_LABELS[evt.type]}
                            </span>
                            <button
                              onClick={() => removeEvent(dateStr, evt.id)}
                              className="text-white/30 hover:text-red-400"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-white text-sm font-medium">{evt.title}</p>
                          <div className="flex items-center gap-2 text-white/50 text-xs mt-1">
                            <Clock size={12} />
                            {evt.time}
                          </div>
                          {evt.description && (
                            <p className="text-white/40 text-xs mt-1">{evt.description}</p>
                          )}
                        </div>
                      ))}

                      {totalItems === 0 && (
                        <p className="text-white/30 text-xs text-center py-2">
                          Nothing planned yet
                        </p>
                      )}

                      {/* Add Buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setShowTeeModal(dateStr)}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-500/10 border border-green-500/20 text-green-300 text-xs py-2 rounded-lg"
                        >
                          <Plus size={14} /> Tee Time
                        </button>
                        <button
                          onClick={() => setShowEventModal(dateStr)}
                          className="flex-1 flex items-center justify-center gap-1 bg-white/5 border border-white/10 text-white/60 text-xs py-2 rounded-lg"
                        >
                          <Plus size={14} /> Event
                        </button>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Tee Time Modal */}
        {showTeeModal && (
          <TeeTimeModal
            date={showTeeModal}
            players={players}
            onSave={(teeTime) => {
              addTeeTime(showTeeModal, teeTime);
              setShowTeeModal(null);
            }}
            onClose={() => setShowTeeModal(null)}
          />
        )}

        {/* Event Modal */}
        {showEventModal && (
          <EventModal
            date={showEventModal}
            onSave={(event) => {
              addEvent(showEventModal, event);
              setShowEventModal(null);
            }}
            onClose={() => setShowEventModal(null)}
          />
        )}
      </div>
    </BackgroundPage>
  );
}

interface TeeTimeModalProps {
  date: string;
  players: { id: string; name: string }[];
  onSave: (teeTime: TeeTime) => void;
  onClose: () => void;
}

function TeeTimeModal({ date, players, onSave, onClose }: TeeTimeModalProps) {
  const [time, setTime] = useState('08:00');
  const [course, setCourse] = useState('');
  const [holes, setHoles] = useState<9 | 18>(18);
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [teams, setTeams] = useState<TeamPairing[]>([]);

  const addTeam = () => {
    if (teamName && selectedPlayers.length > 0) {
      setTeams([...teams, { name: teamName, playerIds: selectedPlayers }]);
      setTeamName('');
      setSelectedPlayers([]);
    }
  };

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    onSave({ id: crypto.randomUUID(), date, time, course, holes, teams });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a3c2a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg text-white">Add Tee Time</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-white/50 text-xs mb-1">Date</label>
            <p className="text-white text-sm">
              {format(parseISO(date), 'EEEE, MMMM d')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Holes</label>
              <select
                value={holes}
                onChange={(e) => setHoles(Number(e.target.value) as 9 | 18)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
              >
                <option value={18} className="bg-[#1a3c2a]">18 holes</option>
                <option value={9} className="bg-[#1a3c2a]">9 holes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Course</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course name"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
            />
          </div>

          {/* Team Builder */}
          <div>
            <label className="block text-white/50 text-xs mb-1">Teams (optional)</label>
            {teams.map((team, i) => (
              <div key={i} className="flex items-center gap-2 mb-2 text-xs text-white/60">
                <span className="text-white/80">{team.name}:</span>
                <span>
                  {team.playerIds
                    .map((pid) => players.find((p) => p.id === pid)?.name)
                    .join(', ')}
                </span>
                <button
                  type="button"
                  onClick={() => setTeams(teams.filter((_, j) => j !== i))}
                  className="text-white/30 hover:text-red-400 ml-auto"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <div className="space-y-2">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
              />
              <div className="flex flex-wrap gap-1">
                {players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlayer(p.id)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      selectedPlayers.includes(p.id)
                        ? 'bg-[#c9a84c]/30 text-[#c9a84c] border border-[#c9a84c]/50'
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              {teamName && selectedPlayers.length > 0 && (
                <button
                  type="button"
                  onClick={addTeam}
                  className="text-xs text-[#c9a84c] hover:underline"
                >
                  + Add team
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#c9a84c] text-[#1a3c2a] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#d4b65d] transition-colors"
          >
            Add Tee Time
          </button>
        </form>
      </div>
    </div>
  );
}

interface EventModalProps {
  date: string;
  onSave: (event: TripEvent) => void;
  onClose: () => void;
}

function EventModal({ date, onSave, onClose }: EventModalProps) {
  const [time, setTime] = useState('18:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TripEvent['type']>('dinner');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSave({ id: crypto.randomUUID(), date, time, title, description, type });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a3c2a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg text-white">Add Event</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-white/50 text-xs mb-1">Date</label>
            <p className="text-white text-sm">
              {format(parseISO(date), 'EEEE, MMMM d')}
            </p>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event name"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TripEvent['type'])}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
              >
                {Object.entries(EVENT_LABELS).map(([key, label]) => (
                  <option key={key} value={key} className="bg-[#1a3c2a]">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details..."
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#c9a84c] text-[#1a3c2a] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#d4b65d] transition-colors"
          >
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
}
