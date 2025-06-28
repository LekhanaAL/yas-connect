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
    avatar_url?: string;
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
      style: 'mapbox://styles/lekhanaal/cmcf7yz3z04x701qw7a2vhr59',
      center: [78, 22],
      zoom: 2.2,
      attributionControl: false,
      projection: 'mercator',
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl());
    mapRef.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }));
    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('locations').select('user_id,latitude,longitude,updated_at,profiles(name,lesson_number,avatar_url)');
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

      // Create marker: always use colored circle, no profile image
      const el = document.createElement('div');
      const isCurrentUser = currentUser && u.user_id === currentUser.id;
      el.style.width = isCurrentUser ? '32px' : '24px';
      el.style.height = isCurrentUser ? '32px' : '24px';
      el.style.borderRadius = '50%';
      el.style.border = isCurrentUser ? '3px solid #fff' : '2px solid #fff';
      el.style.boxShadow = isCurrentUser ? '0 0 8px #4285F4' : '0 0 4px #aaa';
      el.style.backgroundColor = isCurrentUser ? '#4285F4' : 'violet';
      el.style.overflow = 'hidden';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      // Log for debugging
      console.log('Adding marker:', u, 'Lat:', u.latitude, 'Lng:', u.longitude, 'Element:', el);

      if (!(el instanceof HTMLElement)) {
        console.error('Marker element is not a valid HTMLElement:', el, u);
        return;
      }

      const name = u.profiles?.[0]?.name || "User";
      const type = u.profiles?.[0]?.lesson_number || "N";

      const popup = new mapboxgl.Popup({ offset: 18 })
        .setHTML(`<strong>${name}</strong><br>${type}`);

      try {
        if (map && el) {
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([u.longitude, u.latitude])
            .setPopup(popup)
            .addTo(map);
          markers.push(marker);
        }
      } catch (err) {
        console.error('Error adding marker:', err, u, el);
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