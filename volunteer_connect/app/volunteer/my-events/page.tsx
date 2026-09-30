'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EventApplication } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Award, Calendar, MapPin, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function VolunteerMyEventsPage() {
  const supabase = createClient();
  const [selectedApps, setSelectedApps] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSelectedEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          event:event_id (
            id,
            title,
            description,
            date,
            time,
            location,
            required_skills,
            ngo:ngo_id (full_name, email, phone)
          )
        `)
        .eq('volunteer_id', user.id)
        .eq('status', 'selected')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSelectedApps((data as any) || []);
    } catch (err) {
      console.error('Error fetching selected events:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSelectedEvents();
  }, [fetchSelectedEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Confirmed Events</h1>
        <p className="text-sm text-slate-400 mt-1">
          Events where you have been selected by the NGO representative as an active volunteer
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading your confirmed events...</div>
      ) : selectedApps.length === 0 ? (
        <EmptyState
          title="No Selected Events Yet"
          description="Once an NGO representative selects your application for an event, it will appear here."
          icon={<Award className="w-8 h-8 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedApps.map((app) => (
            <div
              key={app.id}
              className="border border-emerald-500/30 rounded-2xl bg-gradient-to-br from-emerald-950/20 to-slate-900/80 p-6 flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="selected">Selected Volunteer</Badge>
                  <span className="text-xs text-slate-400">
                    Confirmed on {new Date(app.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{app.event?.title}</h3>
                <p className="text-xs font-semibold text-emerald-400 mb-3">
                  Organized by: {app.event?.ngo?.full_name}
                </p>

                <p className="text-sm text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                  {app.event?.description}
                </p>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{app.event?.date} at {app.event?.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{app.event?.location}</span>
                  </div>
                  {app.event?.ngo?.phone && (
                    <div className="flex items-center gap-2 text-slate-400 pt-1 border-t border-slate-800">
                      <span>NGO Contact: {app.event?.ngo?.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Participation Confirmed
                </span>
                <Link href="/volunteer/chat">
                  <Button variant="primary" size="sm" icon={<MessageSquare className="w-4 h-4" />}>
                    Open Chat
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
