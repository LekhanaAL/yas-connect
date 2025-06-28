"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

interface ProfileSetupProps {
  user: User;
  onComplete: () => void;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [form, setForm] = useState({ name: '', lesson_number: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputStyle = { padding: 10, borderRadius: 8, border: '1px solid #ddd' };
  const buttonStyle = { background: '#FFD600', color: '#1A2A4F', fontWeight: 700, border: 'none', borderRadius: 8, padding: 12, marginTop: 8, cursor: 'pointer', fontSize: 16 };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    if (!avatarFile || !(avatarFile instanceof File)) {
      setError('Please select a valid image file.');
      setLoading(false);
      return;
    }
    console.log('Uploading avatar file:', avatarFile, avatarFile instanceof File);
    let uploadedAvatarUrl = avatarUrl;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      const uploadResponse = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
      if (uploadResponse.error) {
        setError('Failed to upload avatar: ' + uploadResponse.error.message);
        setLoading(false);
        console.error('Supabase upload error:', uploadResponse.error, uploadResponse);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      uploadedAvatarUrl = publicUrlData.publicUrl;
      setAvatarUrl(uploadedAvatarUrl);
    }
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: form.name,
      lesson_number: form.lesson_number,
      avatar_url: uploadedAvatarUrl,
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
      <label style={{ fontWeight: 500 }}>
        Profile Picture:
        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ marginTop: 8 }} />
      </label>
      {avatarFile && (
        <Image
          src={URL.createObjectURL(avatarFile)}
          alt="Preview"
          width={64}
          height={64}
          style={{ borderRadius: '50%', objectFit: 'cover', margin: '8px auto' }}
          unoptimized
        />
      )}
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