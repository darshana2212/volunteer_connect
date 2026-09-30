'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NgoEvent } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

export default function AdminEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<NgoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ngo_events')
        .select(`
          *,
          ngo:ngo_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching admin events:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Event Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor all events created by registered NGOs on Volunteer Connect
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading events...</div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No Events Created Yet"
          description="There are currently no events registered by NGOs in the system."
          icon={<Calendar className="w-8 h-8 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-slate-800 rounded-2xl bg-slate-900/60 p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
                  <Badge variant={event.status}>{event.status}</Badge>
                </div>

                <p className="text-xs font-semibold text-emerald-400 mb-2">
                  Organized by: {event.ngo?.full_name || 'NGO Partner'}
                </p>

                <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Req. Skills: {event.required_skills} ({event.volunteer_limit} needed)</span>
                  </div>
                </div>
              </div>

              {event.funding_active && (
                <div className="pt-3 border-t border-slate-800/60">
                  <ProgressBar
                    current={Number(event.accumulated_funds || 0)}
                    total={Number(event.funding_goal || 0)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
