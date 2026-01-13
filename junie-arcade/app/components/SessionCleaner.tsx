'use client';

import { useEffect } from 'react';

export default function SessionCleaner() {
  useEffect(() => {
    // Clear all player credentials when returning to the main menu/home page
    // This ensures a new session starts when they go back to a game
    localStorage.removeItem('junie_player_id');
    localStorage.removeItem('junie_username');
    localStorage.removeItem('junie_country');
    localStorage.removeItem('last_saved_score_jump');
    localStorage.removeItem('last_saved_score_reflex');
    localStorage.removeItem('last_saved_score_memory');
    console.log('Player session and credentials cleared');
  }, []);

  return null;
}
