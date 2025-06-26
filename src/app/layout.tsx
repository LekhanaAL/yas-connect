import Navbar from './components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/srf-logo.png" />
        <title>YAS Connect</title>
        <meta name="theme-color" content="#FFD600" />
      </head>
      <body style={{ background: '#fff', color: '#1A2A4F', fontFamily: 'sans-serif' }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
} 