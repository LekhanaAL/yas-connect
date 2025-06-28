import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(26, 42, 79, 0.7)',
      color: '#FFD600',
      padding: '12px 32px',
      boxShadow: '0 2px 16px #0002',
      height: 72,
      zIndex: 100
    }}>
      <Image src="/Lotus-Blue-Circular-2-_medium.fw_.png" alt="Lotus Logo" width={48} height={48} style={{ marginRight: 20, borderRadius: 14, background: '#fff' }} />
      <span style={{ fontFamily: 'Lora, serif', fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>YAS Connect</span>
    </nav>
  );
} 