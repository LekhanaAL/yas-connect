import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const SRF_COLORS = {
  gold: '#FFD600',
  blue: '#1A2A4F',
  white: '#fff',
};

function getRoleTag(lesson_number: string | null) {
  if (!lesson_number) return 'N';
  if (lesson_number.toLowerCase().includes('k')) return 'K';
  return 'L';
}

interface UserLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  profiles: {
    name: string | null;
    lesson_number: string | null;
    avatar_url: string | null;
  }[] | null;
}

function createMarkerElement(avatarUrl: string, isCurrentUser: boolean) {
  const el = document.createElement('div');
  el.style.width = '54px';
  el.style.height = '54px';
  el.style.borderRadius = '50%';
  el.style.overflow = 'hidden';
  el.style.border = `3px solid ${isCurrentUser ? SRF_COLORS.gold : SRF_COLORS.white}`;
  el.style.boxShadow = '0 0 8px #0003';
  el.style.background = SRF_COLORS.white;
  el.style.cursor = 'pointer';
  el.innerHTML = `<img src="${avatarUrl || '/default-avatar.png'}" onerror="this.onerror=null;this.src='/default-avatar.png';" style="width:100%;height:100%;object-fit:cover;" alt="User avatar" />`;
  return el;
}

function createPopupHTML(name: string | null, lesson_number: string | null) {
  return `<div class="popup-fade" style="text-align:center;min-width:120px;background:#fff;border-radius:12px;box-shadow:0 2px 8px #FFD600;padding:8px 0 4px 0;">
    <div style="font-weight:bold;color:${SRF_COLORS.blue}">${name || 'User'}</div>
    <div style="color:${SRF_COLORS.gold};font-size:1.1em">Lesson: ${lesson_number || 'N/A'}</div>
    <div style="margin-top:4px;font-size:1.2em;font-weight:bold;color:${SRF_COLORS.blue}">${getRoleTag(lesson_number ?? null)}</div>
  </div>`;
}

export default function LiveMap({ currentUser }: { currentUser: User | null }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    // A simple way to manage markers without attaching to the map instance
    const markers: mapboxgl.Marker[] = [];

    users.forEach((u) => {
      if (!u.latitude || !u.longitude) return;
      const el = createMarkerElement(u.profiles?.[0]?.avatar_url || '', u.user_id === currentUser?.id);
      const popup = new mapboxgl.Popup({ offset: 18 })
        .setHTML(createPopupHTML(u.profiles?.[0]?.name || 'User', u.profiles?.[0]?.lesson_number || 'N/A'));
      const marker = new mapboxgl.Marker(el).setLngLat([u.longitude, u.latitude]).setPopup(popup).addTo(map);
      markers.push(marker);
    });

    // Clean up markers on unmount or when users change
    return () => {
      markers.forEach(marker => marker.remove());
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