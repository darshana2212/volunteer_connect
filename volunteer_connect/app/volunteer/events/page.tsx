'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NgoEvent } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Toast';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar, MapPin, Users, Send, Search, CheckCircle2 } from 'lucide-react';

export default function VolunteerEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<NgoEvent[]>([]);
  const [appliedEventIds, setAppliedEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEventsAndApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [eventsRes, appsRes] = await Promise.all([
        supabase
          .from('ngo_events')
          .select(`
            *,
            ngo:ngo_id (full_name, email, phone, location)
          `)
          .eq('status', 'active')
          .order('date', { ascending: true }),
        user
          ? supabase.from('event_applications').select('event_id').eq('volunteer_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);

      if (eventsRes.error) throw eventsRes.error;

      setEvents(eventsRes.data || []);
      if (appsRes.data) {
        setAppliedEventIds(new Set(appsRes.data.map((a: any) => a.event_id)));
      }
    } catch (err: any) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEventsAndApplications();
  }, [fetchEventsAndApplications]);

  const handleApply = async (eventId: string) => {
    setApplyingId(eventId);
    setAlert(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User authentication lost.');

      const { error } = await supabase.from('event_applications').insert({
        event_id: eventId,
        volunteer_id: user.id,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already applied to this event.');
        }
        throw error;
      }

      setAppliedEventIds((prev) => new Set(prev).add(eventId));
      setAlert({
        type: 'success',
        msg: 'Application sent successfully! Status set to pending.',
      });
    } catch (err: any) {
      setAlert({
        type: 'error',
        msg: err.message || 'Failed to submit event application.',
      });
    } finally {
      setApplyingId(null);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.required_skills.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Event Discovery</h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore opportunities from verified NGOs and request to volunteer
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, location, or skills..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading active events...</div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="There are currently no active NGO events matching your search."
          icon={<Calendar className="w-8 h-8 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const hasApplied = appliedEventIds.has(event.id);
            return (
              <div
                key={event.id}
                className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 flex flex-col justify-between space-y-5 backdrop-blur-sm hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
                  </div>

                  <p className="text-xs font-semibold text-emerald-400 mb-3">
                    Organized by: {event.ngo?.full_name || 'NGO Partner'}
                  </p>

                  <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-400 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Required Skills: <strong className="text-slate-200">{event.required_skills}</strong> ({event.volunteer_limit} needed)</span>
                    </div>
                  </div>

                  {event.funding_active && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-slate-400 mb-1">Funding Campaign:</p>
                      <ProgressBar
                        current={Number(event.accumulated_funds || 0)}
                        total={Number(event.funding_goal || 0)}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  {hasApplied ? (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full text-emerald-400 border-emerald-500/30 bg-emerald-500/10 cursor-default"
                      icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    >
                      Request Submitted (Pending)
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      isLoading={applyingId === event.id}
                      onClick={() => handleApply(event.id)}
                      className="w-full"
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send Request
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
