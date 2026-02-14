import { useState, useRef, useEffect } from 'react';
import { Send, Pin, PinOff, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import BackgroundPage from '../components/BackgroundPage';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES, PLAYERS } from '../lib/constants';
import { sanitize } from '../lib/sanitize';
import type { Message } from '../lib/types';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const REACTION_OPTIONS = ['\u{1f44d}', '\u{1f525}', '\u26f3', '\u{1f37a}'];

// ── Initials Avatar ─────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-8 h-8 rounded-full bg-[#2d5a3f] flex items-center justify-center text-xs font-bold text-[#c9a84c] shrink-0">
      {initials}
    </div>
  );
}

// ── Chat Bubble ─────────────────────────────────────────────────────
function ChatBubble({ message, isSent }: { message: Message; isSent: boolean }) {
  const togglePin = useStore((s) => s.togglePin);
  const addReaction = useStore((s) => s.addReaction);
  const activePlayerId = useStore((s) => s.activePlayerId);
  const [showReactions, setShowReactions] = useState(false);

  const player = PLAYERS.find((p) => p.id === message.playerId);
  const time = format(new Date(message.timestamp), 'h:mm a');

  const allReactions = Object.entries(message.reactions).filter(
    ([, pids]) => pids.length > 0
  );

  return (
    <div className={`flex gap-2 mb-3 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isSent && <Avatar name={player?.name ?? '?'} />}
      <div className={`max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
        {!isSent && (
          <span className="text-xs text-[#c9a84c] font-medium ml-1">{player?.name}</span>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm relative ${
            isSent
              ? 'bg-[#2d5a3f] rounded-tr-sm'
              : 'bg-white/10 rounded-tl-sm'
          } ${message.pinned ? 'border border-[#c9a84c]/40' : ''}`}
          onClick={() => setShowReactions(!showReactions)}
        >
          {message.pinned && (
            <Pin size={10} className="absolute -top-1 -right-1 text-[#c9a84c]" />
          )}
          <p className="break-words whitespace-pre-wrap">{message.text}</p>
          <div className={`text-[10px] mt-1 ${isSent ? 'text-white/40 text-right' : 'text-white/30'}`}>
            {time}
          </div>
        </div>

        {/* Reactions display */}
        {allReactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
            {allReactions.map(([emoji, pids]) => (
              <button
                key={emoji}
                onClick={() => addReaction(message.id, emoji, activePlayerId)}
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  pids.includes(activePlayerId)
                    ? 'bg-[#c9a84c]/30 border border-[#c9a84c]/50'
                    : 'bg-white/10'
                }`}
              >
                {emoji} {pids.length}
              </button>
            ))}
          </div>
        )}

        {/* Reaction picker */}
        {showReactions && (
          <div className={`flex gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
            {REACTION_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  addReaction(message.id, emoji, activePlayerId);
                  setShowReactions(false);
                }}
                className="text-base bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => {
                togglePin(message.id);
                setShowReactions(false);
              }}
              className="text-xs bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-[#c9a84c]"
            >
              {message.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pinned Messages ─────────────────────────────────────────────────
function PinnedMessages({ messages }: { messages: Message[] }) {
  const pinned = messages.filter((m) => m.pinned);
  if (pinned.length === 0) return null;

  return (
    <div className="glass rounded-xl p-3 mb-3">
      <div className="flex items-center gap-1.5 mb-2 text-[#c9a84c]">
        <Pin size={12} />
        <span className="text-xs font-medium">Pinned ({pinned.length})</span>
      </div>
      {pinned.map((m) => {
        const player = PLAYERS.find((p) => p.id === m.playerId);
        return (
          <div key={m.id} className="text-xs text-white/70 mb-1 truncate">
            <span className="font-medium text-white/90">{player?.name}: </span>
            {m.text}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Chat Page ──────────────────────────────────────────────────
export default function Chat() {
  const messages = useStore((s) => s.messages);
  const addMessage = useStore((s) => s.addMessage);
  const activePlayerId = useStore((s) => s.activePlayerId);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPlayer = PLAYERS.find((p) => p.id === activePlayerId);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg: Message = {
      id: uid(),
      playerId: activePlayerId,
      text: sanitize(trimmed),
      timestamp: new Date().toISOString(),
      pinned: false,
      reactions: {},
    };
    addMessage(msg);
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.chat}>
      <div className="max-w-md mx-auto px-4 pt-6 pb-40 flex flex-col min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Chat</h2>

        <PinnedMessages messages={messages} />

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageCircle size={48} className="text-white/20 mb-3" />
              <p className="text-white/40 text-sm text-center">
                No messages yet. Break the ice and send the first message!
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} isSent={msg.playerId === activePlayerId} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="fixed bottom-[6.5rem] left-0 right-0 px-4 pb-2">
          <div className="max-w-md mx-auto">
            <div className="glass rounded-2xl flex items-center gap-2 p-2">
              <Avatar name={currentPlayer?.name ?? '?'} />
              <input
                ref={inputRef}
                type="text"
                maxLength={500}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message as ${currentPlayer?.name?.split(' ')[0] ?? 'Guest'}...`}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/30 px-1 py-1.5"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="w-9 h-9 rounded-xl bg-[#c9a84c] flex items-center justify-center disabled:opacity-30 shrink-0"
              >
                <Send size={16} className="text-[#1a3c2a]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}
