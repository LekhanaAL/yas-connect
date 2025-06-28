import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="sticky top-0 left-0 w-full flex items-center bg-[#142850]/90 text-yellow-400 px-8 py-4 shadow-lg h-20 z-50 backdrop-blur-md">
      <div className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform">
        <Image src="/Lotus-Blue-Circular-2-_medium.fw_.png" alt="Lotus Logo" width={48} height={48} className="rounded-xl bg-white" />
        <span className="text-2xl md:text-3xl font-bold tracking-wide font-sans">YAS Connect</span>
      </div>
    </nav>
  );
} 