'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message, Profile, NgoEvent } from '@/types/database';
import { Send, MessageSquare, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ChatConversation {
  eventId: string;
  eventTitle: string;
  otherUser: Profile;
}

interface ChatWindowProps {
  currentUser: Profile;
  conversations: ChatConversation[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, conversations }) => {
  const supabase = createClient();
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(
    conversations.length > 0 ? conversations[0] : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async () => {
    if (!activeConv) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('event_id', activeConv.eventId)
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeConv.otherUser.id}),and(sender_id.eq.${activeConv.otherUser.id},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    }
  }, [activeConv, currentUser.id, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Supabase Realtime Subscription for new messages
  useEffect(() => {
    if (!activeConv) return;

    const channel = supabase
      .channel(`chat_${activeConv.eventId}_${currentUser.id}_${activeConv.otherUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `event_id=eq.${activeConv.eventId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Check if message belongs to this conversation
          if (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeConv.otherUser.id) ||
            (newMsg.sender_id === activeConv.otherUser.id && newMsg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, currentUser.id, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConv || sending) return;

    setSending(true);
    const textToSend = newMessageText.trim();
    setNewMessageText('');

    try {
      const { error } = await supabase.from('messages').insert({
        event_id: activeConv.eventId,
        sender_id: currentUser.id,
        receiver_id: activeConv.otherUser.id,
        message: textToSend,
      });

      if (error) {
        console.error('Error sending message:', error);
        setNewMessageText(textToSend); // Restore text on failure
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/60 my-4 min-h-[400px]">
        <div className="p-4 rounded-full bg-slate-800 text-slate-400 mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">No Active Chat Conversations</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1">
          Chat is unlocked when a Volunteer applies to an event and the NGO Representative selects them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-800 rounded-2xl bg-slate-900/80 overflow-hidden h-[650px] shadow-2xl">
      {/* Sidebar - Conversations */}
      <div className="border-r border-slate-800 flex flex-col h-full bg-slate-950/40">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white text-sm">Active Conversations</h3>
          <p className="text-xs text-slate-400">Selected Event Connections</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {conversations.map((conv) => {
            const isSelected = activeConv?.eventId === conv.eventId && activeConv?.otherUser.id === conv.otherUser.id;
            return (
              <button
                key={`${conv.eventId}_${conv.otherUser.id}`}
                onClick={() => setActiveConv(conv)}
                className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                  isSelected ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 shrink-0">
                  {conv.otherUser.role === 'ngo' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-bold text-white text-sm truncate">{conv.otherUser.full_name}</div>
                  <div className="text-xs text-emerald-400 font-medium truncate">{conv.eventTitle}</div>
                  <span className="text-[10px] text-slate-500 capitalize">{conv.otherUser.role}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-2 flex flex-col h-full bg-slate-900/40">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
              <div>
                <h3 className="font-bold text-white text-base">{activeConv.otherUser.full_name}</h3>
                <p className="text-xs text-emerald-400">Event: {activeConv.eventTitle}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium capitalize">
                {activeConv.otherUser.role}
              </span>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No messages yet. Send a greeting to start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed ${
                          isMine
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                        }`}
                      >
                        <p>{msg.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/80 flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={`Type a message to ${activeConv.otherUser.full_name}...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={sending}
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            Select a conversation from the sidebar.
          </div>
        )}
      </div>
    </div>
  );
};
