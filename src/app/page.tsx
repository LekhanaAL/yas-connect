"use client";
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import AuthForm from './components/AuthForm';
import ProfileSetup from './components/ProfileSetup';
import LiveMap from './components/LiveMap';
import LocationUpdater from './components/LocationUpdater';
import { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setProfileComplete(!!data));
  }, [user]);

  if (!user) return <AuthForm onAuth={setUser} />;
  if (!profileComplete) return <ProfileSetup user={user} onComplete={() => setProfileComplete(true)} />;
  if (!consent) return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 32, textAlign: 'center' }}>
      <h2>Location Sharing Consent</h2>
      <p>To appear on the global map, please allow location sharing. Your location will be visible to other devotees.</p>
      <label style={{ display: 'block', margin: '24px 0' }}>
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> I consent to sharing my location
      </label>
    </div>
  );
  return (
    <>
      <LocationUpdater user={user} />
      <LiveMap currentUser={user} />
    </>
  );
}
