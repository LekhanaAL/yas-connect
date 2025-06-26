"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface ProfileSetupProps {
  user: User;
  onComplete: () => void;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [form, setForm] = useState({ name: '', lesson_number: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputStyle = { padding: 10, borderRadius: 8, border: '1px solid #ddd' };
  const buttonStyle = { background: '#FFD600', color: '#1A2A4F', fontWeight: 700, border: 'none', borderRadius: 8, padding: 12, marginTop: 8, cursor: 'pointer', fontSize: 16 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: form.name,
      lesson_number: form.lesson_number,
    });
    setLoading(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setSuccess(true);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: 'auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', display: 'flex', flexDirection: 'column', gap: 16 }} aria-label="Profile setup form">
      <h2 style={{ textAlign: 'center', color: '#1A2A4F', marginBottom: 8 }}>Complete Your Profile</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required style={inputStyle} aria-label="Name" />
      <input name="lesson_number" placeholder="Lesson Number" value={form.lesson_number} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required style={inputStyle} aria-label="Lesson Number" />
      <div aria-live="polite" style={{ minHeight: 32, margin: '8px 0' }}>
        {loading && <div className="loader" style={{ margin: '0 auto', display: 'block' }} aria-label="Saving..." />}
        {success && (
          <div style={{ color: 'green', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span aria-hidden="true">✅</span> <span>Profile saved!</span>
          </div>
        )}
        {error && (
          <div style={{ color: 'red', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span aria-hidden="true">❌</span> <span>{error}</span>
          </div>
        )}
      </div>
      <button type="submit" style={buttonStyle}>Save</button>
    </form>
  );
} 