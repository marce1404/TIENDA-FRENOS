
'use client';

import { useState, useEffect } from 'react';

export function useDefaultImages() {
  const [defaultPastillaImage, setDefaultPastillaImage] = useState<string | null>(null);
  const [defaultDiscoImage, setDefaultDiscoImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = () => {
      const pastillaUrl = localStorage.getItem('defaultPastillaImageUrl');
      if (pastillaUrl) setDefaultPastillaImage(pastillaUrl);

      const discoUrl = localStorage.getItem('defaultDiscoImageUrl');
      if (discoUrl) setDefaultDiscoImage(discoUrl);
    };

    loadImages();

    // Listen for changes in localStorage from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'defaultPastillaImageUrl' || e.key === 'defaultDiscoImageUrl') {
        loadImages();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { defaultPastillaImage, defaultDiscoImage };
}
