'use client';

import { useEffect } from 'react';

export function AutoRefresh() {
  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      window.location.reload();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
