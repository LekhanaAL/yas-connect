import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '../lib/supabaseClient';
import UserMarker from './UserMarker';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface UserLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  avatar_url?: string | null;
  city?: string | null;
}

export default function LiveMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [78, 22],
      zoom: 3,
      minZoom: 1.2,
      maxZoom: 8,
      maxBounds: [
        [-180, -85],
        [180, 85]
      ]
    });
    mapRef.current = map;
    map.on('load', () => setLoading(false));
    return () => map.remove();
  }, []);

  useEffect(() => {
    // Fetch user locations and avatars from Supabase
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('user_id,latitude,longitude,city,profiles:profiles!inner(avatar_url)');
      setLoading(false);
      if (!error && data) {
        // Map avatar_url from joined profiles
        setUsers(
          data.map((u: any) => ({
            user_id: u.user_id,
            latitude: u.latitude,
            longitude: u.longitude,
            avatar_url: u.profiles?.avatar_url || null,
            city: u.city || null,
          }))
        );
      }
    };
    fetchUsers();

    // Subscribe to realtime updates on the locations table
    const channel = supabase
      .channel('public:locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, (payload) => {
        // Refetch all users on any change (simplest, most robust way)
        fetchUsers();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    let markers: mapboxgl.Marker[] = [];
    users.forEach((u) => {
      if (typeof u.latitude !== 'number' || typeof u.longitude !== 'number') return;
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.position = 'relative';
      el.style.zIndex = '2';
      // Avatar
      const img = document.createElement('img');
      img.src = u.avatar_url || '/default-avatar.png';
      img.width = 48;
      img.height = 48;
      img.style.borderRadius = '50%';
      img.style.border = '3px solid #fff';
      img.style.boxShadow = '0 0 8px #0003';
      img.style.objectFit = 'cover';
      img.style.cursor = 'pointer';
      img.style.zIndex = '2';
      img.alt = 'User avatar';
      img.tabIndex = 0;
      img.setAttribute('aria-label', u.city ? `User in ${u.city}` : 'User location');
      // Hover/click feedback
      img.addEventListener('mouseenter', () => { img.style.boxShadow = '0 0 16px #FFD600'; });
      img.addEventListener('mouseleave', () => { img.style.boxShadow = '0 0 8px #0003'; });
      el.appendChild(img);
      // Prevent overlap: add a small offset if multiple users in same city
      let offsetY = 0;
      if (u.city) {
        const sameCityCount = users.filter(x => x.city === u.city).length;
        if (sameCityCount > 1) {
          offsetY = Math.floor(Math.random() * 20) - 10;
        }
      }
      el.style.transform = `translateY(${offsetY}px)`;
      // Popup
      if (u.city) {
        const popupContent = document.createElement('div');
        popupContent.style.display = 'flex';
        popupContent.style.flexDirection = 'column';
        popupContent.style.alignItems = 'center';
        popupContent.style.padding = '8px 12px';
        popupContent.style.fontSize = '16px';
        popupContent.style.fontWeight = '500';
        popupContent.style.color = '#1A2A4F';
        popupContent.innerHTML = `<div style="margin-bottom:4px;"><img src='${u.avatar_url || '/default-avatar.png'}' width='32' height='32' style='border-radius:50%;border:2px solid #FFD600;object-fit:cover;'/></div><div>${u.city}</div>`;
        const popup = new mapboxgl.Popup({ offset: 30, closeButton: true, closeOnClick: true })
          .setDOMContent(popupContent);
        img.addEventListener('click', () => popup.addTo(map).setLngLat([u.longitude, u.latitude]));
        img.addEventListener('keypress', (e) => { if (e.key === 'Enter') popup.addTo(map).setLngLat([u.longitude, u.latitude]); });
      }
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([u.longitude, u.latitude])
        .addTo(map);
      markers.push(marker);
    });
    return () => markers.forEach(marker => marker.remove());
  }, [users]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', width: '100%' }}>
      <div ref={mapContainer} style={{ width: '90vw', maxWidth: 1200, height: '60vh', minHeight: 300, borderRadius: 16, boxShadow: '0 4px 24px #0002', overflow: 'hidden', position: 'relative' }} aria-label="Live user map">
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader" aria-label="Loading map..." />
          </div>
        )}
      </div>
    </div>
  );
} 