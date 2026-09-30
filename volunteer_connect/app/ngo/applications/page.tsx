'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EventApplication } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckCircle2, XCircle, FileCheck, MessageSquare } from 'lucide-react';

export default function NgoApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch NGO events
      const { data: events } = await supabase
        .from('ngo_events')
        .select('id')
        .eq('ngo_id', user.id);

      const eventIds = (events || []).map((e) => e.id);

      if (eventIds.length > 0) {
        const { data, error } = await supabase
          .from('event_applications')
          .select(`
            *,
            event:event_id (title),
            volunteer:volunteer_id (full_name, email, phone, bio, skills, availability)
          `)
          .in('event_id', eventIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications((data as any) || []);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching event applicants:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (appId: string, newStatus: 'selected' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('event_applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;

      setAlert({
        type: 'success',
        msg: `Application status set to ${newStatus}.`,
      });
      fetchApplications();
    } catch (err: any) {
      setAlert({
        type: 'error',
        msg: err.message || 'Failed to update application status.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Applicant Review</h1>
        <p className="text-sm text-slate-400 mt-1">
          Evaluate volunteer requests for your NGO events and select team members
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading applicant requests...</div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Applicants Yet"
          description="There are currently no volunteer applications submitted for your events."
          icon={<FileCheck className="w-8 h-8 text-slate-500" />}
        />
      ) : (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <tr>
                  <th className="px-6 py-4">Volunteer</th>
                  <th className="px-6 py-4">Applied Event</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{app.volunteer?.full_name}</div>
                      <div className="text-xs text-slate-400">{app.volunteer?.email}</div>
                      {app.volunteer?.phone && (
                        <div className="text-[11px] text-slate-500">{app.volunteer.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-200 font-medium">
                      {app.event?.title}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {app.volunteer?.skills || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {app.volunteer?.availability || 'Flexible'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={app.status}>{app.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              onClick={() => handleUpdateStatus(app.id, 'selected')}
                            >
                              Select
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              icon={<XCircle className="w-3.5 h-3.5" />}
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === 'selected' && (
                          <Link href="/ngo/chat">
                            <Button size="sm" variant="outline" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                              Chat
                            </Button>
                          </Link>
                        )}
                        {app.status === 'rejected' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(app.id, 'selected')}
                          >
                            Re-select
                          </Button>
                        )}
                      </div>
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
