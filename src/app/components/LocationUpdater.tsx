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
      console.log('Updating location:', latitude, longitude);
      // Reverse geocode to get city name
      let city = '';
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
        if (response.ok) {
          const data = await response.json();
          city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
        }
      } catch (e) {
        console.warn('Reverse geocoding failed', e);
      }
      await supabase.from('locations').upsert(
        {
          user_id: user.id,
          latitude,
          longitude,
          city, // new field
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
    };
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(updateLocation, undefined, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      });
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);
  return null;
} 