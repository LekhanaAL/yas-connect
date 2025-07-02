import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { AttachmentIcon, DeleteIcon } from '@chakra-ui/icons';
import { supabase, uploadMedia, sendMessage } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { sendNotification } from '@/utils/sendNotification';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'media';
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  read: boolean;
}

interface ChatProps {
  currentUser: User;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export const Chat: React.FC<ChatProps> = ({
  currentUser,
  recipientId,
  recipientName,
  recipientAvatar,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    markMessagesAsRead();
    return unsubscribe;
  }, [recipientId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user_id.eq.${currentUser.id},to_user_id.eq.${recipientId}),and(from_user_id.eq.${recipientId},to_user_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    scrollToBottom();
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          if (
            (newMessage.from_user_id === currentUser.id && newMessage.to_user_id === recipientId) ||
            (newMessage.from_user_id === recipientId && newMessage.to_user_id === currentUser.id)
          ) {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
            if (newMessage.from_user_id === recipientId) {
              markMessageAsRead(newMessage.id);
              toast({
                title: `New message from ${recipientName}`,
                description: newMessage.content.length > 60 ? newMessage.content.slice(0, 60) + '...' : newMessage.content,
                status: 'info',
                duration: 4000,
                isClosable: true,
                position: 'top-right',
              });
            }
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async () => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('to_user_id', currentUser.id)
      .eq('from_user_id', recipientId)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage(currentUser.id, recipientId, newMessage.trim(), 'text');
      setNewMessage('');

      // Fetch recipient email for notification
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', recipientId)
        .single();

      if (recipientProfile?.email) {
        await sendNotification({
          to: recipientProfile.email,
          type: 'new_message',
          data: {
            senderName: currentUser.user_metadata?.name || 'Someone',
            message: newMessage.trim(),
          },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadData = await uploadMedia(file, 'chat');
      if (!uploadData?.path) throw new Error('Upload failed');

      const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chat/${uploadData.path}`;
      await sendMessage(currentUser.id, recipientId, mediaUrl, 'media');
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Error uploading media',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box h="full" display="flex" flexDirection="column">
      {/* Chat Header */}
      <Flex
        p={4}
        bg="gray.100"
        alignItems="center"
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Avatar size="sm" name={recipientName} src={recipientAvatar} />
        <Text ml={3} fontWeight="bold">
          {recipientName}
        </Text>
      </Flex>

      {/* Messages Area */}
      <VStack
        flex={1}
        overflowY="auto"
        p={4}
        spacing={4}
        alignItems="stretch"
      >
        {messages.map((message) => (
          <Flex
            key={message.id}
            justifyContent={message.from_user_id === currentUser.id ? 'flex-end' : 'flex-start'}
          >
            <Box
              maxW="70%"
              bg={message.from_user_id === currentUser.id ? 'blue.500' : 'gray.100'}
              color={message.from_user_id === currentUser.id ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
            >
              {message.type === 'media' ? (
                <Box maxW="300px">
                  {message.content.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={message.content}
                      alt="Shared media"
                      style={{ maxWidth: '100%', borderRadius: '4px' }}
                    />
                  ) : (
                    <video
                      src={message.content}
                      controls
                      style={{ maxWidth: '100%', borderRadius: '4px' }}
                    />
                  )}
                </Box>
              ) : (
                <Text>{message.content}</Text>
              )}
            </Box>
          </Flex>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Message Input */}
      <HStack p={4} bg="white" borderTop="1px" borderColor="gray.200">
        <Input
          flex={1}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <IconButton
          aria-label="Upload media"
          icon={<AttachmentIcon />}
          isLoading={isUploading}
          onClick={() => document.getElementById('file-upload')?.click()}
        />
        <input
          id="file-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <Button
          colorScheme="blue"
          onClick={handleSendMessage}
          isDisabled={!newMessage.trim()}
        >
          Send
        </Button>
      </HStack>
    </Box>
  );
}; 