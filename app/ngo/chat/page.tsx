'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { ChatWindow, ChatConversation } from '@/components/chat/ChatWindow';

export default function NgoChatPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const initNgoChat = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) return;
      setCurrentUser(profile);

      // Fetch NGO events
      const { data: events } = await supabase
        .from('ngo_events')
        .select('id, title')
        .eq('ngo_id', user.id);

      const eventMap = new Map((events || []).map((e) => [e.id, e.title]));
      const eventIds = Array.from(eventMap.keys());

      if (eventIds.length > 0) {
        const { data: selectedApps, error } = await supabase
          .from('event_applications')
          .select(`
            event_id,
            volunteer:volunteer_id (*)
          `)
          .in('event_id', eventIds)
          .eq('status', 'selected');

        if (error) throw error;

        const convs: ChatConversation[] = (selectedApps || [])
          .filter((app: any) => app.volunteer)
          .map((app: any) => ({
            eventId: app.event_id,
            eventTitle: eventMap.get(app.event_id) || 'Event',
            otherUser: app.volunteer as Profile,
          }));

        setConversations(convs);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Error initializing NGO chat:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    initNgoChat();
  }, [initNgoChat]);

  if (loading || !currentUser) {
    return <div className="p-12 text-center text-slate-500">Loading chat conversations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Volunteer Messaging</h1>
        <p className="text-sm text-slate-400 mt-1">
          Chat directly with selected volunteers for your NGO events
        </p>
      </div>

      <ChatWindow currentUser={currentUser} conversations={conversations} />
    </div>
  );
}
