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
  const [showConsentModal, setShowConsentModal] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0003', maxWidth: 400, width: '90%', padding: 32, textAlign: 'center' }}>
        <h2 style={{ color: '#1A2A4F', marginBottom: 16 }}>Location Sharing Consent</h2>
        <p style={{ marginBottom: 24 }}>To appear on the global map, please allow location sharing. Your location will be visible to other devotees.</p>
        <label style={{ display: 'block', margin: '24px 0', fontWeight: 500 }}>
          <input type="checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} style={{ marginRight: 8 }} />
          I consent to sharing my location
        </label>
        <button
          style={{ background: consentChecked ? '#FFD600' : '#ccc', color: '#1A2A4F', fontWeight: 700, border: 'none', borderRadius: 8, padding: 12, marginTop: 8, cursor: consentChecked ? 'pointer' : 'not-allowed', fontSize: 16 }}
          disabled={!consentChecked}
          onClick={() => { setConsent(true); setShowConsentModal(false); }}
        >
          Continue
        </button>
      </div>
    </div>
  );
  return (
    <>
      <LocationUpdater user={user} />
      <LiveMap currentUser={user} />
    </>
  );
}
