import { useState } from 'react';
import { Bed, Plus, X } from 'lucide-react';
import BackgroundPage from '../components/BackgroundPage';
import GlassCard from '../components/GlassCard';
import PlayerAvatar from '../components/PlayerAvatar';
import EmptyState from '../components/EmptyState';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES } from '../lib/constants';
import type { Room } from '../lib/types';

export default function Quarters() {
  const rooms = useStore((s) => s.rooms);
  const players = useStore((s) => s.players);
  const addRoom = useStore((s) => s.addRoom);
  const updateRoom = useStore((s) => s.updateRoom);
  const removeRoom = useStore((s) => s.removeRoom);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.quarters}>
      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl text-white">Quarters</h1>
            <p className="text-white/40 text-sm">Room assignments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#c9a84c] text-[#1a3c2a] p-2 rounded-full"
          >
            <Plus size={20} />
          </button>
        </div>

        {rooms.length === 0 ? (
          <EmptyState
            icon={<Bed size={48} />}
            title="No rooms assigned"
            message="Add room assignments so everyone knows where they're staying."
          />
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <GlassCard
                key={room.id}
                onClick={() => handleEdit(room)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium text-sm">{room.name}</h3>
                    {room.number && (
                      <p className="text-white/40 text-xs">Room {room.number}</p>
                    )}
                  </div>
                  <span className="text-white/30 text-xs">
                    {room.playerIds.length} guest{room.playerIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {room.playerIds.map((pid) => {
                    const player = getPlayer(pid);
                    return player ? (
                      <div key={pid} className="flex items-center gap-2 bg-white/5 rounded-full px-2 py-1">
                        <PlayerAvatar name={player.name} playerId={pid} size="sm" />
                        <span className="text-white/70 text-xs">{player.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                {room.notes && (
                  <p className="text-white/40 text-xs mt-2 border-t border-white/10 pt-2">
                    {room.notes}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        )}

        {showModal && (
          <RoomModal
            room={editingRoom}
            players={players}
            onSave={(roomData) => {
              if (editingRoom) {
                updateRoom(editingRoom.id, roomData);
              } else {
                addRoom({ ...roomData, id: crypto.randomUUID() } as Room);
              }
              handleClose();
            }}
            onDelete={
              editingRoom
                ? () => {
                    removeRoom(editingRoom.id);
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

interface RoomModalProps {
  room: Room | null;
  players: { id: string; name: string }[];
  onSave: (room: Omit<Room, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function RoomModal({ room, players, onSave, onDelete, onClose }: RoomModalProps) {
  const [name, setName] = useState(room?.name ?? '');
  const [number, setNumber] = useState(room?.number ?? '');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(room?.playerIds ?? []);
  const [notes, setNotes] = useState(room?.notes ?? '');

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({ name, number: number || undefined, playerIds: selectedPlayers, notes: notes || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a3c2a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg text-white">{room ? 'Edit Room' : 'Add Room'}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1">Room Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Suite A"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Room Number</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="101"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Guests</label>
            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    selectedPlayers.includes(p.id)
                      ? 'bg-[#c9a84c]/30 text-[#c9a84c] border border-[#c9a84c]/50'
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Room details, check-in info..."
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#c9a84c]/50 resize-none"
            />
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
              {room ? 'Update' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
