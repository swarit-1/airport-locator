'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

export function CopyShareButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="gs-btn-secondary gap-2 !px-4 !py-2 text-sm"
    >
      <Copy className="h-4 w-4" />
      {copied ? 'Link copied' : 'Copy share link'}
    </button>
  );
}
