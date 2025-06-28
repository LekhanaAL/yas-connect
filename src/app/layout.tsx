import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from './components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/srf-logo.png" />
        <title>YAS Connect</title>
        <meta name="theme-color" content="#FFD600" />
      </head>
      <body style={{ background: '#f7fafc', color: '#1A2A4F', fontFamily: 'Inter, Arial, sans-serif' }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
} 