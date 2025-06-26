"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthFormProps {
  onAuth: (user: User) => void;
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', lesson_number: '' });
  const [error, setError] = useState('');

  const inputStyle = { padding: 10, borderRadius: 8, border: '1px solid #ddd' };
  const buttonStyle = { background: '#FFD600', color: '#1A2A4F', fontWeight: 700, border: 'none', borderRadius: 8, padding: 12, marginTop: 8, cursor: 'pointer', fontSize: 16 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name, lesson_number: form.lesson_number } }
      });
      if (signUpError) return setError(signUpError.message);
      if (data.user) {
        onAuth(data.user);
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });
      if (signInError) return setError(signInError.message);
      if (data.user) onAuth(data.user);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f7fafc' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', maxWidth: 340, width: '100%', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ textAlign: 'center', color: '#1A2A4F', marginBottom: 8 }}>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required style={inputStyle} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required style={inputStyle} />
        {isSignUp && (
          <>
            <input name="name" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required style={inputStyle} />
            <input name="lesson_number" placeholder="Lesson Number" value={form.lesson_number} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required style={inputStyle} />
          </>
        )}
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        <button type="submit" style={buttonStyle}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <span>
            {isSignUp ? 'Already have an account?' : 'No account?'}{' '}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#1A2A4F', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </span>
        </div>
      </form>
    </div>
  );
} 