import { useState, useRef, useEffect, useCallback } from 'react';
import * as contractsApi from '../api/contracts';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';

const POLL_INTERVAL_MS = 4000;

export default function ChatThread({
  contractId,
  otherPartyName,
}: {
  contractId: string;
  otherPartyName: string;
}) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    contractsApi.listMessages(contractId).then(setMessages).catch(() => {});
  }, [contractId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const sent = await contractsApi.sendMessage(contractId, text.trim());
      setMessages((prev) => [...prev, sent]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-3 px-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === currentUser?.id;
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? 'bg-primary text-white' : 'bg-white border border-border text-ink'
                }`}
              >
                {!isMine && <p className="text-xs text-muted mb-0.5">{otherPartyName}</p>}
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-muted'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-border mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-border rounded px-3 py-2 text-sm bg-white"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
