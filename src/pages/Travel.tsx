import { useState } from 'react';
import { Plane, Car, Plus, X, Clock, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BackgroundPage from '../components/BackgroundPage';
import GlassCard from '../components/GlassCard';
import PlayerAvatar from '../components/PlayerAvatar';
import EmptyState from '../components/EmptyState';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES } from '../lib/constants';
import type { Flight } from '../lib/types';

const STATUS_CONFIG: Record<Flight['status'], { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-white/60', bg: 'bg-white/20' },
  'en-route': { label: 'En Route', color: 'text-blue-300', bg: 'bg-blue-500/30' },
  landed: { label: 'Landed', color: 'text-green-300', bg: 'bg-green-500/30' },
  arrived: { label: 'Arrived', color: 'text-green-300', bg: 'bg-green-500/30' },
  delayed: { label: 'Delayed', color: 'text-yellow-300', bg: 'bg-yellow-500/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-300', bg: 'bg-red-500/30' },
};

export default function Travel() {
  const flights = useStore((s) => s.flights);
  const players = useStore((s) => s.players);
  const addFlight = useStore((s) => s.addFlight);
  const updateFlight = useStore((s) => s.updateFlight);
  const removeFlight = useStore((s) => s.removeFlight);
  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const sortedFlights = [...flights].sort((a, b) =>
    a.arrivalTime.localeCompare(b.arrivalTime)
  );

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingFlight(null);
  };

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.travel}>
      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl text-white">Travel</h1>
            <p className="text-white/40 text-sm">Arrivals board</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#c9a84c] text-[#1a3c2a] p-2 rounded-full"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Travel List */}
        {sortedFlights.length === 0 ? (
          <EmptyState
            icon={<Plane size={48} />}
            title="No travel info yet"
            message="Add your flight or drive info so everyone knows when you're arriving."
          />
        ) : (
          <div className="space-y-3">
            {sortedFlights.map((flight) => {
              const player = getPlayer(flight.playerId);
              const status = STATUS_CONFIG[flight.status];
              const isCar = flight.travelMode === 'car';
              return (
                <GlassCard
                  key={flight.id}
                  onClick={() => handleEdit(flight)}
                  className="flex items-start gap-3"
                >
                  <PlayerAvatar
                    name={player?.name ?? '?'}
                    playerId={flight.playerId}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm flex items-center gap-1.5">
                        {isCar ? <Car size={14} className="text-white/50" /> : <Plane size={14} className="text-white/50" />}
                        {player?.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-white/50 text-xs">
                      {isCar ? (
                        <span>
                          Driving{flight.departureCity ? ` from ${flight.departureCity}` : ''}
                        </span>
                      ) : (
                        <span className="font-mono">
                          {flight.airline} {flight.flightNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-white/50 text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {flight.arrivalTime ? format(parseISO(flight.arrivalTime), 'MMM d, h:mm a') : '--'}
                      </span>
                      {!isCar && flight.terminal && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          Terminal {flight.terminal}
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <TravelModal
            flight={editingFlight}
            players={players}
            onSave={(flight) => {
              if (editingFlight) {
                updateFlight(editingFlight.id, flight);
              } else {
                addFlight({ ...flight, id: crypto.randomUUID() } as Flight);
              }
              handleClose();
            }}
            onDelete={
              editingFlight
                ? () => {
                    removeFlight(editingFlight.id);
                    handleClose();
                  }
                : undefined
            }
            onClose={handleClose}
          />
        )}
      </div>
    </BackgroundPage>
  );
}

interface TravelModalProps {
  flight: Flight | null;
  players: { id: string; name: string }[];
  onSave: (flight: Omit<Flight, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function TravelModal({ flight, players, onSave, onDelete, onClose }: TravelModalProps) {
  const [travelMode, setTravelMode] = useState<'flight' | 'car'>(flight?.travelMode ?? 'flight');
  const [playerId, setPlayerId] = useState(flight?.playerId ?? '');
  const [airline, setAirline] = useState(flight?.airline ?? '');
  const [flightNumber, setFlightNumber] = useState(flight?.flightNumber ?? '');
  const [arrivalTime, setArrivalTime] = useState(flight?.arrivalTime ?? '');
  const [terminal, setTerminal] = useState(flight?.terminal ?? '');
  const [departureCity, setDepartureCity] = useState(flight?.departureCity ?? '');
  const [status, setStatus] = useState<Flight['status']>(flight?.status ?? 'scheduled');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;
    if (travelMode === 'flight' && (!airline || !flightNumber)) return;
    onSave({
      playerId,
      travelMode,
      airline: travelMode === 'flight' ? airline : '',
      flightNumber: travelMode === 'flight' ? flightNumber : '',
      arrivalTime,
      terminal: travelMode === 'flight' ? terminal : '',
      departureCity: travelMode === 'car' ? departureCity : '',
      status,
    });
  };

  const statusOptions = travelMode === 'car'
    ? ['scheduled', 'en-route', 'arrived', 'delayed'] as const
    : ['scheduled', 'en-route', 'landed', 'delayed', 'cancelled'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a3c2a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg text-white">{flight ? 'Edit Travel' : 'Add Travel'}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Travel Mode Toggle */}
          <div>
            <label className="block text-white/50 text-xs mb-2">How are you getting there?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTravelMode('flight')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  travelMode === 'flight'
                    ? 'bg-[#c9a84c] text-[#1a3c2a]'
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                <Plane size={16} />
                Flying
              </button>
              <button
                type="button"
                onClick={() => setTravelMode('car')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  travelMode === 'car'
                    ? 'bg-[#c9a84c] text-[#1a3c2a]'
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                <Car size={16} />
                Driving
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Player</label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
            >
              <option value="">Select player</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1a3c2a]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {travelMode === 'flight' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-xs mb-1">Airline</label>
                  <input
                    type="text"
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    placeholder="Delta"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1">Flight #</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="DL1234"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1">Terminal</label>
                <input
                  type="text"
                  value={terminal}
                  onChange={(e) => setTerminal(e.target.value)}
                  placeholder="A"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-white/50 text-xs mb-1">Driving from</label>
              <input
                type="text"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                placeholder="Charlotte, NC"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
              />
            </div>
          )}

          <div>
            <label className="block text-white/50 text-xs mb-1">Arrival Time</label>
            <input
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
            />
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Flight['status'])}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]/50"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="bg-[#1a3c2a]">
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-[#c9a84c] text-[#1a3c2a] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#d4b65d] transition-colors"
            >
              {flight ? 'Update' : travelMode === 'flight' ? 'Add Flight' : 'Add Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
