import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
if (!mapboxgl.accessToken) {
  console.warn('Mapbox access token is missing! Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file.');
}

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
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainer.current) {
      console.warn('Map container ref is not set.');
      return;
    }
    if (mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
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
    mapRef.current.on('load', () => {
      setMapLoaded(true);
    });
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
    if (!mapRef.current || !mapContainer.current || !mapLoaded) {
      console.warn('Map or map container not ready for markers.');
      return;
    }
    const map = mapRef.current;
    let markers: mapboxgl.Marker[] = [];
    console.log('All users:', users);
    users.forEach((u) => {
      if (!u || typeof u.latitude !== 'number' || typeof u.longitude !== 'number') {
        console.warn('Invalid user location, skipping:', u);
        return;
      }
      if (!map) {
        console.error('Map instance not ready when adding marker:', u);
        return;
      }
      // Create marker: use profile image if available
      const el = document.createElement('div');
      const isCurrentUser = currentUser && u.user_id === currentUser.id;
      el.style.width = isCurrentUser ? '48px' : '40px';
      el.style.height = isCurrentUser ? '48px' : '40px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid #fff';
      el.style.boxShadow = '0 2px 8px #0003';
      el.style.overflow = 'hidden';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.background = '#fff';
      // Add avatar image
      const img = document.createElement('img');
      img.src = u.profiles?.[0]?.avatar_url || '/default-avatar.png';
      img.alt = u.profiles?.[0]?.name || 'User';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      el.appendChild(img);
      // Popup content
      const name = u.profiles?.[0]?.name || "User";
      const avatarUrl = u.profiles?.[0]?.avatar_url || '/default-avatar.png';
      const popupHtml = `
        <div style="display:flex;align-items:center;gap:12px;min-width:120px;">
          <img src="${avatarUrl}" alt="${name}" style="width:40px;height:40px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px #0002;object-fit:cover;" />
          <span style="font-weight:600;font-size:1.1rem;">${name}</span>
        </div>
      `;
      const popup = new mapboxgl.Popup({ offset: 18 })
        .setHTML(popupHtml);
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
  }, [users, currentUser, mapLoaded]);

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-8 p-2 md:p-4 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[60vh] h-[70vh] flex flex-col justify-center items-center">
      {(!mapboxgl.accessToken || !mapContainer) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <span className="text-red-600 font-semibold text-lg">Map cannot be loaded. Check your Mapbox token and network.</span>
        </div>
      )}
      {loading && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"><div className="loader" /></div>}
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[400px] rounded-xl"
        style={{ minHeight: 400 }}
      />
      {/* Optionally add SRF logo overlay or wavy background here */}
    </div>
  );
} 