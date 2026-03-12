'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Send,
  Flag,
  Share2,
  LogOut,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { getAdminRulesRepo, getCircleRepo, getMessageRepo, getReportRepo } from '@/lib/repositories';
import { rideLinkProvider } from '@/lib/providers';
import { useHydrated } from '@/hooks/use-hydrated';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  const hydrated = useHydrated();
  const circleRepo = getCircleRepo();
  const messageRepo = getMessageRepo();
  const reportRepo = getReportRepo();
  const rulesRepo = getAdminRulesRepo();
  const [circle, setCircle] = useState<ReturnType<typeof circleRepo.getById>>();
  const [members, setMembers] = useState<ReturnType<typeof circleRepo.getMembers>>([]);
  const [messages, setMessages] = useState<ReturnType<typeof messageRepo.getByCircleId>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [rideLinks, setRideLinks] = useState<Array<{ provider: string; web_link: string }>>([]);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const joined = useMemo(
    () => members.some((member) => member.user_name === 'You' && member.status === 'active'),
    [members],
  );

  useEffect(() => {
    if (!hydrated) return;
    setCircle(circleRepo.getById(params.id));
    setMembers(circleRepo.getMembers(params.id));
    setMessages(messageRepo.getByCircleId(params.id));
  }, [circleRepo, hydrated, messageRepo, params.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!circle) return;

    const airport = rulesRepo.getAirport(circle.airport_iata);
    if (!airport) return;

    const origin = { lat: circle.origin_lat, lng: circle.origin_lng };
    const destination = { lat: airport.lat, lng: airport.lng };

    Promise.all([
      rideLinkProvider.getRideLink(origin, destination, 'uber').catch(() => null),
      rideLinkProvider.getRideLink(origin, destination, 'lyft').catch(() => null),
    ]).then(([uber, lyft]) => {
      const links: Array<{ provider: string; web_link: string }> = [];
      if (uber) links.push({ provider: 'uber', web_link: uber.web_link });
      if (lyft) links.push({ provider: 'lyft', web_link: lyft.web_link });
      setRideLinks(links);
    });
  }, [circle, rulesRepo]);

  if (!hydrated) {
    return <div className="min-h-dvh bg-surface-primary" />;
  }

  if (!circle) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-primary">
        <div className="text-center">
          <h1 className="text-xl font-bold text-ink-900">Circle not found</h1>
          <p className="mt-2 text-sm text-ink-500">This circle was removed or the link is invalid.</p>
          <Link href="/circles" className="gs-btn-primary mt-5">
            Back to circles
          </Link>
        </div>
      </div>
    );
  }

  const refresh = () => {
    setCircle(circleRepo.getById(params.id));
    setMembers(circleRepo.getMembers(params.id));
    setMessages(messageRepo.getByCircleId(params.id));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !joined) return;

    messageRepo.send({
      id: `msg-${Date.now()}`,
      circle_id: params.id,
      sender: 'You',
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      type: 'text',
      created_at: new Date().toISOString(),
    });

    setNewMessage('');
    refresh();
  };

  const handleJoin = () => {
    circleRepo.join(params.id, {
      circle_id: params.id,
      user_name: 'You',
      role: 'member',
      status: 'active',
      joined_at: new Date().toISOString(),
    });
    refresh();
  };

  const handleLeave = () => {
    circleRepo.leave(params.id, 'You');
    refresh();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/circles/${params.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReport = () => {
    reportRepo.create({
      id: `report-${Date.now()}`,
      reporter: 'you@demo.gateshare.app',
      reported_user: null,
      circle_id: params.id,
      reason: 'safety',
      details: `Manual report filed from circle ${params.id}.`,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-surface-primary">
      <header className="border-b border-ink-100 bg-surface-primary/90 backdrop-blur-md sticky top-0 z-10">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link
            href="/circles"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2"
          >
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold text-ink-900">
              {circle.airport_iata} around {formatTime(circle.target_leave_time)}
            </div>
            <div className="text-xs text-ink-500">{circle.neighborhood} · {circle.visibility}</div>
          </div>
          <button onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors" title="Copy link">
            <Share2 className="h-4 w-4 text-ink-500" />
          </button>
          <button onClick={handleReport} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors" title="Report">
            <Flag className="h-4 w-4 text-ink-500" />
          </button>
        </div>
      </header>

      <div className="border-b border-ink-100 bg-[color:var(--surface-secondary)]">
        <div className="gs-container grid gap-5 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Circle summary</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">{circle.airport_name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-600">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-ink-400" />
                Leave window {formatTime(circle.leave_window_start)} to {formatTime(circle.leave_window_end)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-ink-400" />
                Pickup around {circle.neighborhood}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-success-500">
                <DollarSign className="h-4 w-4" />
                Save about ${(circle.estimated_savings_cents / 100).toFixed(0)} each
              </span>
            </div>
            {copied && <p className="mt-3 text-xs font-medium text-success-500">Circle link copied.</p>}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-900">Members</span>
              <span className="text-sm text-ink-500">{members.length}/{circle.max_members}</span>
            </div>
            <div className="mt-3 space-y-2">
              {members.map((member) => (
                <div key={member.user_name} className="flex items-center justify-between rounded-xl bg-surface-secondary px-3 py-2 text-sm">
                  <span className="font-medium text-ink-900">{member.user_name}</span>
                  <span className="text-xs capitalize text-ink-500">{member.role}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {rideLinks.map((link) => (
                <a
                  key={link.provider}
                  href={link.web_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-secondary"
                >
                  {link.provider === 'uber' ? 'Uber' : 'Lyft'}
                  <ExternalLink className="h-4 w-4 text-ink-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="gs-container py-6">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-surface-secondary px-6 py-10 text-center">
              <Users className="mx-auto h-10 w-10 text-ink-200" />
              <h2 className="mt-4 text-lg font-semibold text-ink-900">No messages yet</h2>
              <p className="mt-2 text-sm text-ink-500">Join the circle to break the ice and confirm pickup details.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isSystem = message.type === 'system';
                const isMine = message.sender === 'You';

                if (isSystem) {
                  return (
                    <div key={message.id} className="text-center text-xs text-ink-400">
                      {message.content}
                    </div>
                  );
                }

                return (
                  <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] ${isMine ? '' : 'pr-6'}`}>
                      {!isMine && (
                        <div className="mb-1 text-xs font-medium text-ink-500">{message.sender}</div>
                      )}
                      <div className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${isMine ? 'rounded-br-md bg-brand-500 text-white' : 'rounded-bl-md bg-surface-secondary text-ink-900'}`}>
                        {message.content}
                      </div>
                      <div className={`mt-1 text-2xs text-ink-400 ${isMine ? 'text-right' : ''}`}>{message.time}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-ink-100 bg-surface-primary/90 backdrop-blur-md sticky bottom-0">
        <div className="gs-container py-3">
          {!joined ? (
            <button
              onClick={handleJoin}
              className="gs-btn-primary w-full gap-2"
              disabled={circle.current_members >= circle.max_members}
            >
              <UserPlus className="h-5 w-5" />
              {circle.current_members >= circle.max_members ? 'Circle is full' : 'Join this circle'}
            </button>
          ) : (
            <div className="flex gap-2">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
                className="flex flex-1 gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Message the group"
                  className="gs-input flex-1"
                />
                <button type="submit" disabled={!newMessage.trim()} className="gs-btn-primary !px-4">
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <button onClick={handleLeave} className="gs-btn-secondary !px-4" title="Leave circle">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
