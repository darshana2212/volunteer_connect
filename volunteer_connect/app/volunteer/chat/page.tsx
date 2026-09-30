'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { ChatWindow, ChatConversation } from '@/components/chat/ChatWindow';

export default function VolunteerChatPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const initVolunteerChat = useCallback(async () => {
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

      // Fetch applications where status = 'selected'
      const { data: selectedApps, error } = await supabase
        .from('event_applications')
        .select(`
          event:event_id (
            id,
            title,
            ngo:ngo_id (*)
          )
        `)
        .eq('volunteer_id', user.id)
        .eq('status', 'selected');

      if (error) throw error;

      const convs: ChatConversation[] = (selectedApps || [])
        .filter((app: any) => app.event && app.event.ngo)
        .map((app: any) => ({
          eventId: app.event.id,
          eventTitle: app.event.title,
          otherUser: app.event.ngo as Profile,
        }));

      setConversations(convs);
    } catch (err) {
      console.error('Error initializing volunteer chat:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    initVolunteerChat();
  }, [initVolunteerChat]);

  if (loading || !currentUser) {
    return <div className="p-12 text-center text-slate-500">Loading chat conversations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Direct Messaging</h1>
        <p className="text-sm text-slate-400 mt-1">
          Chat with NGO Representatives for events where your volunteer application has been selected
        </p>
      </div>

      <ChatWindow currentUser={currentUser} conversations={conversations} />
    </div>
  );
}
