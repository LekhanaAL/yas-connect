import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface UserLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  profiles: {
    name: string | null;
    lesson_number: string | null;
  }[] | null;
}

export default function LiveMap({ currentUser }: { currentUser: User | null }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainer.current) return;
    if (mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [78, 22],
      zoom: 2.2,
      attributionControl: false,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl());
    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('locations').select('user_id,latitude,longitude,updated_at,profiles(name,lesson_number)');
      if (error) {
        console.error("Error fetching locations:", error);
        setUsers([]);
      } else {
        setUsers(data as UserLocation[] || []);
      }
      setLoading(false);
    };
    fetchUsers();
    const sub = supabase
      .channel('realtime:locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, fetchUsers)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapContainer.current) return;
    const map = mapRef.current;

    let markers: mapboxgl.Marker[] = [];

    console.log('All users:', users);
    users.forEach((u) => {
      if (!u || typeof u.latitude !== 'number' || typeof u.longitude !== 'number') {
        console.warn('Invalid user location, skipping:', u);
        return;
      }

      // Create marker: violet for current user, blue for others
      const el = document.createElement('div');
      el.style.width = '10px';
      el.style.height = '10px';
      el.style.backgroundColor = (currentUser && u.user_id === currentUser.id) ? 'violet' : 'blue';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';

      const name = u.profiles?.[0]?.name || "User";
      const type = u.profiles?.[0]?.lesson_number || "N";

      const popup = new mapboxgl.Popup({ offset: 18 })
        .setHTML(`<strong>${name}</strong><br>${type}`);

      try {
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([u.longitude, u.latitude])
          .setPopup(popup)
          .addTo(map);
        markers.push(marker);
      } catch (err) {
        console.error('Error adding marker:', err);
      }
    });

    return () => {
      markers.forEach(marker => marker.remove());
      markers = [];
    };
  }, [users, currentUser]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', borderRadius: 16, boxShadow: '0 4px 24px #0002', overflow: 'hidden', margin: 16 }} aria-label="Live user map">
      {loading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}><div className="loader" /></div>}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {/* Optionally add SRF logo overlay or wavy background here */}
    </div>
  );
} 