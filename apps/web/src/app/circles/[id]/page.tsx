'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft, Users, Clock, MapPin, DollarSign, Send,
  ExternalLink, Flag, Share2, LogOut, UserPlus,
} from 'lucide-react';
import { demoCircles } from '@/lib/demo-data';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  type: 'text' | 'system';
}

const demoMessages: ChatMessage[] = [
  { id: '1', sender: 'System', content: 'Alice C. created this circle', time: '10:00 AM', isMe: false, type: 'system' },
  { id: '2', sender: 'Alice C.', content: 'Hey! I\'m heading to SEA tomorrow around 11am from downtown. Anyone want to share a ride?', time: '10:02 AM', isMe: false, type: 'text' },
  { id: '3', sender: 'Bob M.', content: 'I\'m in! My flight is at 2:30. Where should we meet?', time: '10:15 AM', isMe: false, type: 'text' },
  { id: '4', sender: 'Alice C.', content: 'How about the Starbucks on Pike & 3rd? Easy pickup spot.', time: '10:18 AM', isMe: false, type: 'text' },
  { id: '5', sender: 'System', content: 'Bob M. joined the circle', time: '10:20 AM', isMe: false, type: 'system' },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  const circle = demoCircles[0]!; // Demo: always show first circle
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [newMessage, setNewMessage] = useState('');
  const [joined, setJoined] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'You',
        content: newMessage.trim(),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        isMe: true,
        type: 'text',
      },
    ]);
    setNewMessage('');
  };

  return (
    <div className="min-h-dvh flex flex-col bg-surface-primary">
      {/* Header */}
      <header className="border-b border-ink-100 bg-surface-primary/80 backdrop-blur-md sticky top-0 z-10">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link
            href="/circles"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2"
          >
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-ink-900 truncate">
              {circle.airport_iata} · {formatTime(circle.target_leave_time)}
            </div>
            <div className="text-xs text-ink-500">
              {circle.current_members + (joined ? 1 : 0)}/{circle.max_members} members · {circle.neighborhood}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors" title="Share">
              <Share2 className="h-4 w-4 text-ink-500" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors" title="Report">
              <Flag className="h-4 w-4 text-ink-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Circle info */}
      <div className="border-b border-ink-100 bg-surface-secondary">
        <div className="gs-container py-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-ink-600">
              <Clock className="h-4 w-4 text-ink-400" />
              Window: {formatTime(circle.leave_window_start)} – {formatTime(circle.leave_window_end)}
            </div>
            <div className="flex items-center gap-1.5 text-success-500 font-semibold">
              <DollarSign className="h-4 w-4" />
              Save ~${(circle.estimated_savings_cents / 100).toFixed(0)} each
            </div>
            <div className="flex items-center gap-1.5 text-ink-600">
              <MapPin className="h-4 w-4 text-ink-400" />
              +{circle.estimated_extra_minutes} min detour
            </div>
          </div>

          {/* Ride links */}
          <div className="mt-3 flex gap-2">
            <a
              href="https://m.uber.com/ul/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-black text-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              Uber <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://ride.lyft.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF00BF] text-white px-3 py-1.5 text-xs font-semibold hover:bg-[#E600AC] transition-colors"
            >
              Lyft <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="gs-container py-4 space-y-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${msg.type === 'system' ? 'text-center' : msg.isMe ? 'flex justify-end' : 'flex justify-start'}`}
            >
              {msg.type === 'system' ? (
                <p className="text-xs text-ink-400 py-1">{msg.content}</p>
              ) : (
                <div className={`max-w-[80%] sm:max-w-[60%] ${msg.isMe ? 'order-1' : ''}`}>
                  {!msg.isMe && (
                    <span className="text-xs font-medium text-ink-500 ml-3 mb-0.5 block">{msg.sender}</span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      msg.isMe
                        ? 'bg-brand-500 text-white rounded-br-md'
                        : 'bg-surface-secondary text-ink-900 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <span className={`text-2xs text-ink-400 mt-0.5 block ${msg.isMe ? 'text-right mr-1' : 'ml-3'}`}>
                    {msg.time}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Join / Chat input */}
      <div className="border-t border-ink-100 bg-surface-primary/80 backdrop-blur-md sticky bottom-0">
        <div className="gs-container py-3">
          {!joined ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setJoined(true);
                  setMessages((prev) => [
                    ...prev,
                    { id: `sys-${Date.now()}`, sender: 'System', content: 'You joined the circle', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }), isMe: false, type: 'system' },
                  ]);
                }}
                className="gs-btn-primary flex-1 gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Join this circle
              </button>
              <button className="gs-btn-secondary !px-4" title="Leave">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="gs-input flex-1"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="gs-btn-primary !px-4"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
