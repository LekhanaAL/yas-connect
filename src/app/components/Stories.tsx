import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Flex, Image, Modal, ModalOverlay, ModalContent, useDisclosure } from '@chakra-ui/react';
import { supabase, uploadMedia, createStory } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { AddIcon } from '@chakra-ui/icons';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  views: string[];
}

interface StoriesProps {
  currentUser: User | null;
}

export const Stories: React.FC<StoriesProps> = ({ currentUser }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchStories();
    subscribeToStories();
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }

    setStories(data || []);
  };

  const subscribeToStories = () => {
    const subscription = supabase
      .channel('stories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, payload => {
        if (payload.eventType === 'INSERT') {
          setStories(prev => [payload.new as Story, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setStories(prev => prev.filter(story => story.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
      const uploadData = await uploadMedia(file, 'stories');
      if (!uploadData?.path) throw new Error('Upload failed');

      const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stories/${uploadData.path}`;
      await createStory(
        currentUser.id,
        mediaUrl,
        file.type.startsWith('image/') ? 'image' : 'video'
      );
    } catch (error) {
      console.error('Error uploading story:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const viewStory = async (story: Story) => {
    setActiveStory(story);
    onOpen();

    // Mark story as viewed if not already viewed
    if (currentUser && !story.views.includes(currentUser.id)) {
      const { error } = await supabase
        .from('stories')
        .update({
          views: [...story.views, currentUser.id],
        })
        .eq('id', story.id);

      if (error) {
        console.error('Error marking story as viewed:', error);
      }
    }
  };

  return (
    <Box p={4}>
      <Flex gap={4} overflowX="auto" pb={4}>
        {/* Add Story Button */}
        {currentUser && (
          <Box position="relative" minW="70px" h="70px">
            <label htmlFor="story-upload">
              <Button
                as="span"
                w="70px"
                h="70px"
                borderRadius="full"
                variant="outline"
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="center"
                disabled={isUploading}
              >
                {isUploading ? <CircularProgress isIndeterminate size="20px" /> : <AddIcon boxSize={5} />}
              </Button>
            </label>
            <input
              id="story-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </Box>
        )}

        {/* Story Circles */}
        {stories.map((story) => (
          <Box
            key={story.id}
            onClick={() => viewStory(story)}
            cursor="pointer"
            position="relative"
          >
            <Box
              w="70px"
              h="70px"
              borderRadius="full"
              borderWidth="2px"
              borderColor={story.views.includes(currentUser?.id || '') ? 'gray.300' : 'blue.500'}
              p="2px"
            >
              <Image
                src={story.media_url}
                alt="Story preview"
                w="full"
                h="full"
                objectFit="cover"
                borderRadius="full"
              />
            </Box>
          </Box>
        ))}
      </Flex>

      {/* Story Viewer Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent bg="black" m={0} p={0}>
          {activeStory?.type === 'video' ? (
            <video
              src={activeStory.media_url}
              autoPlay
              controls
              style={{ width: '100%', height: '100vh', objectFit: 'contain' }}
            />
          ) : (
            <Image
              src={activeStory?.media_url}
              alt="Story"
              w="full"
              h="100vh"
              objectFit="contain"
            />
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}; 