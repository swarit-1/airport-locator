import Link from 'next/link';
import { getCircleById, getCircleMembers, getCircleMessages } from '@/lib/server/demo-file-store';
import { CircleDetailClient } from './circle-detail-client';

export default async function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const circle = getCircleById(id);

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

  const members = getCircleMembers(id);
  const messages = getCircleMessages(id);

  return (
    <CircleDetailClient
      initialCircle={circle}
      initialMembers={members}
      initialMessages={messages}
    />
  );
}
