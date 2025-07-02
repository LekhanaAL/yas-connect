import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabaseClient';
import UserMarker from './UserMarker';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface UserLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  avatar_url?: string | null;
}

export default function LiveMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [users, setUsers] = useState<UserLocation[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [78, 22],
      zoom: 3,
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    // Fetch user locations and avatars from Supabase
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('user_id,latitude,longitude,profiles:profiles!inner(avatar_url)');
      if (!error && data) {
        // Map avatar_url from joined profiles
        setUsers(
          data.map((u: any) => ({
            user_id: u.user_id,
            latitude: u.latitude,
            longitude: u.longitude,
            avatar_url: u.profiles?.avatar_url || null,
          }))
        );
      }
    };
    fetchUsers();
    // Optionally, subscribe to realtime updates here
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    let markers: mapboxgl.Marker[] = [];
    users.forEach((u) => {
      if (typeof u.latitude !== 'number' || typeof u.longitude !== 'number') return;
      const el = document.createElement('img');
      el.src = u.avatar_url || '/default-avatar.png';
      el.width = 48;
      el.height = 48;
      el.style.borderRadius = '50%';
      el.style.border = '3px solid #fff';
      el.style.boxShadow = '0 0 8px #0003';
      el.style.objectFit = 'cover';
      el.style.cursor = 'pointer';
      el.style.zIndex = '1';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([u.longitude, u.latitude])
        .addTo(map);
      markers.push(marker);
    });
    return () => markers.forEach(marker => marker.remove());
  }, [users]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', width: '100%' }}>
      <div ref={mapContainer} style={{ width: '80vw', maxWidth: 1200, height: '60vh', minHeight: 400, borderRadius: 16, boxShadow: '0 4px 24px #0002', overflow: 'hidden' }} />
    </div>
  );
} 