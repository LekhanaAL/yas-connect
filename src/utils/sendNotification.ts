export async function sendNotification({
  to,
  type,
  data,
}: {
  to: string;
  type: string;
  data: any;
}) {
  const res = await fetch('https://zxtdemwfayfbeljechie.functions.supabase.co/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, type, data }),
  });
  if (!res.ok) {
    throw new Error('Failed to send notification');
  }
} 