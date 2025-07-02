# YAS Connect

YAS Connect is a modern, real-time community platform for devotees, built with Next.js, Supabase, Mapbox, and Chakra UI. It features live user maps, chat, stories, online meetings, and a robust admin dashboard.

---

## Features

- **Authentication:** Email/password and Google OAuth via Supabase
- **Profile Management:** User profiles with avatars and lesson numbers
- **Live Map:** Real-time user locations with avatars (Mapbox GL)
- **Chat:** 1:1 real-time chat with in-app and email notifications
- **Stories:** Image/video stories with expiration
- **Online Meetings:** Custom WebRTC video rooms with screen sharing
- **Admin Dashboard:** User management, analytics, and moderation tools
- **Notifications:** In-app (toast) and email (via Supabase Edge Functions)
- **Responsive UI:** Built with Chakra UI and Tailwind CSS

---

## Getting Started

### 1. **Clone the Repository**
```sh
git clone <your-repo-url>
cd YAS\ Connect
```

### 2. **Install Dependencies**
```sh
npm install
```

### 3. **Environment Variables**
Create a `.env.local` file with the following:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 4. **Run the Development Server**
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Supabase Setup
- Create a Supabase project at [supabase.com](https://supabase.com/)
- Set up tables: `profiles`, `locations`, `messages`, `stories`, `friend_requests`
- Add `is_admin` boolean to `profiles` for admin access
- Enable Google OAuth and configure redirect URIs
- Set up storage buckets for avatars, stories, and chat media
- Configure RLS (Row Level Security) for all tables

---

## Mapbox Setup
- Create a Mapbox account at [mapbox.com](https://mapbox.com/)
- Get your public access token and add it to `.env.local` as `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Email Notifications
- Set up a SendGrid account and API key
- Deploy the `send-email` Supabase Edge Function
- Add `SENDGRID_API_KEY` and `FROM_EMAIL` to your Supabase project environment variables

---

## Online Meetings (WebRTC)
- Peer-to-peer video rooms with screen sharing via PeerJS
- Visit `/meet` to create or join a room

---

## Admin Dashboard
- Visit `/admin` (admin users only)
- Manage users, toggle admin status, ban users, and view analytics

---

## Deployment
- Deploy to Vercel, Netlify, or your preferred platform
- Set all environment variables in your deployment dashboard

---

## Contributing
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## License
[MIT](LICENSE)

---

## Credits
- [Supabase](https://supabase.com/)
- [Mapbox](https://mapbox.com/)
- [Chakra UI](https://chakra-ui.com/)
- [PeerJS](https://peerjs.com/)
- [Next.js](https://nextjs.org/)