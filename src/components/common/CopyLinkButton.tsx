import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  getUrl: () => string;
  label?: string;
  className?: string;
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  getUrl,
  label = 'Share link',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = getUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-panel text-xs font-medium text-mist hover:text-paper bg-ink-raised hover:bg-line/40 border border-line transition-all duration-200"
        aria-label="Copy share link to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-tier-a" />
            <span className="text-tier-a font-medium">Copied to clipboard</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
};
