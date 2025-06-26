import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      background: '#1A2A4F',
      color: '#FFD600',
      padding: '8px 24px',
      boxShadow: '0 2px 8px #0001',
      height: 64,
    }}>
      <Image src="/srf-logo.png" alt="SRF Logo" width={44} height={44} style={{ marginRight: 16, borderRadius: 12, background: '#fff' }} />
      <span style={{ fontWeight: 700, fontSize: 24, letterSpacing: 1 }}>YAS Connect</span>
    </nav>
  );
} 