'use client'; // Required for useState and useEffect

import { Game } from '../components/game/Game';
import { FullPageLoader } from '../components/ui/Loader'; // Import the FullPageLoader
import { useState, useEffect } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading or wait for certain conditions
    // For a simple case, just hide after a short delay
    // In a real app, you might wait for specific assets or API calls
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust delay as needed, e.g., 1.5 seconds

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (loading) {
    return <FullPageLoader message="Initializing Game..." />;
  }

  return (
    <main className="w-full h-screen overflow-hidden">
      <Game />
    </main>
  );
}
