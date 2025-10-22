"use client";

import { useCallback, useState } from "react";

export function useShare(defaultTitle = "Check out this item") {
  const [copied, setCopied] = useState(false);

  const share = useCallback(
    async (title?: string) => {
      try {
        const url = window.location.href;
        const finalTitle = title || defaultTitle;

        const isMobileUA = /mobile/i.test(navigator.userAgent);

        if (navigator.share && isMobileUA) {
          await navigator.share({ title: finalTitle, url });
          return;
        }

        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [defaultTitle]
  );

  return { share, copied };
}
