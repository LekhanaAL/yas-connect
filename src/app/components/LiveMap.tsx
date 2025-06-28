import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabaseClient';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface UserLocation {
  user_id: string;
  latitude: number;
  longitude: number;
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
    // Fetch user locations from Supabase
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('locations').select('user_id,latitude,longitude');
      if (!error && data) setUsers(data as UserLocation[]);
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
      const el = document.createElement('div');
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.background = '#4285F4';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 0 6px #4285F4AA';
      el.style.display = 'block';
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