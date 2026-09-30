'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EventApplication } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileCheck, Calendar, MapPin, MessageSquare } from 'lucide-react';

export default function VolunteerApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          event:event_id (
            title,
            description,
            date,
            time,
            location,
            required_skills,
            ngo:ngo_id (full_name, email)
          )
        `)
        .eq('volunteer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data as any) || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review the status of event applications you have submitted to NGOs
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading applications...</div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Applications Submitted"
          description="You have not submitted any event applications yet."
          icon={<FileCheck className="w-8 h-8 text-slate-500" />}
          action={
            <Link href="/volunteer/events">
              <Button variant="primary">Browse Events to Apply</Button>
            </Link>
          }
        />
      ) : (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <tr>
                  <th className="px-6 py-4">Event & NGO</th>
                  <th className="px-6 py-4">Event Date & Time</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{app.event?.title}</div>
                      <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                        NGO: {app.event?.ngo?.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{app.event?.date} at {app.event?.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{app.event?.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={app.status}>{app.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'selected' ? (
                        <Link href="/volunteer/chat">
                          <Button size="sm" variant="success" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                            Chat
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
