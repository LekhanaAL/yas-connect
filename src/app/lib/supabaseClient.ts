import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for real-time features
export const subscribeToUserPresence = (userId: string, callback: (online: boolean) => void) => {
  return supabase
    .channel(`presence:${userId}`)
    .on('presence', { event: 'sync' }, () => {
      // Handle presence sync
    })
    .subscribe();
};

// Media upload helper
export const uploadMedia = async (file: File, bucket: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;
  return data;
};

// Story management
export const createStory = async (userId: string, mediaUrl: string, type: 'image' | 'video') => {
  const { data, error } = await supabase
    .from('stories')
    .insert([
      {
        user_id: userId,
        media_url: mediaUrl,
        type,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      },
    ]);

  if (error) throw error;
  return data;
};

// Friend management
export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
  const { data, error } = await supabase
    .from('friend_requests')
    .insert([
      {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending',
      },
    ]);

  if (error) throw error;
  return data;
};

// Message management
export const sendMessage = async (fromUserId: string, toUserId: string, content: string, type: 'text' | 'media') => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        content,
        type,
        read: false,
      },
    ]);

  if (error) throw error;
  return data;
}; 