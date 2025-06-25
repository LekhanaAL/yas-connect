"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

interface ProfileSetupProps {
  user: User;
  onComplete: () => void;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [form, setForm] = useState({ name: '', lesson_number: '' });
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputStyle = { padding: 10, borderRadius: 8, border: '1px solid #ddd' };
  const buttonStyle = { background: '#FFD600', color: '#1A2A4F', fontWeight: 700, border: 'none', borderRadius: 8, padding: 12, marginTop: 8, cursor: 'pointer', fontSize: 16 };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    let avatar_url = '';
    let fileToUpload = avatarFile;
    if (avatarFile) {
      // Compress image before upload
      try {
        fileToUpload = await imageCompression(avatarFile, { maxSizeMB: 0.2, maxWidthOrHeight: 256 });
      } catch (err) {
        setError('Image compression failed');
        setLoading(false);
        return;
      }
      const filePath = `${user.id}/${fileToUpload.name}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, fileToUpload, { upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatar_url = publicUrlData?.publicUrl || '';
    }
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      name: form.name,
      lesson_number: form.lesson_number,
      avatar_url,
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
      <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} aria-label="Upload avatar" />
      {avatarPreview && (
        <img
          src={avatarPreview}
          alt="Avatar Preview"
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto', border: '2px solid #FFD600', boxShadow: '0 2px 8px #FFD60044' }}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-avatar.png'; }}
        />
      )}
      <div aria-live="polite" style={{ minHeight: 32, margin: '8px 0' }}>
        {loading && <div className="loader" style={{ margin: '0 auto', display: 'block' }} aria-label="Uploading..." />}
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