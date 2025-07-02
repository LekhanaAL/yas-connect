"use client";
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface LocationUpdaterProps {
  user: User | null;
}

export default function LocationUpdater({ user }: LocationUpdaterProps) {
  useEffect(() => {
    if (!user) return;
    let watchId: number | undefined;
    const updateLocation = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      await supabase.from('locations').upsert(
        {
          user_id: user.id,
          latitude,
          longitude,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
    };
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(updateLocation);
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);
  return null;
} 