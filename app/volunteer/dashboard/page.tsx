'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EventApplication, NgoEvent } from '@/types/database';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, FileCheck, Award, ArrowRight, MapPin, MessageSquare } from 'lucide-react';

export default function VolunteerDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    applicationsCount: 0,
    selectedCount: 0,
    activeEventsCount: 0,
  });
  const [recentApplications, setRecentApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteerOverview = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [appsRes, selRes, evRes, recentAppsRes] = await Promise.all([
        supabase.from('event_applications').select('id', { count: 'exact' }).eq('volunteer_id', user.id),
        supabase.from('event_applications').select('id', { count: 'exact' }).eq('volunteer_id', user.id).eq('status', 'selected'),
        supabase.from('ngo_events').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase
          .from('event_applications')
          .select(`
            *,
            event:event_id (title, date, time, location, ngo:ngo_id(full_name))
          `)
          .eq('volunteer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

      setStats({
        applicationsCount: appsRes.count || 0,
        selectedCount: selRes.count || 0,
        activeEventsCount: evRes.count || 0,
      });

      setRecentApplications((recentAppsRes.data as any) || []);
    } catch (err) {
      console.error('Error fetching volunteer dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchVolunteerOverview();
  }, [fetchVolunteerOverview]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Volunteer Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover NGO events, track your application status, and connect with community initiatives
          </p>
        </div>
        <Link href="/volunteer/events">
          <Button variant="primary" icon={<Calendar className="w-4 h-4" />}>
            Browse Active Events
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Submitted Applications"
          value={loading ? '...' : stats.applicationsCount}
          color="indigo"
          icon={<FileCheck className="w-5 h-5 text-indigo-400" />}
        />
        <DashboardCard
          title="Selected Events"
          value={loading ? '...' : stats.selectedCount}
          color="emerald"
          icon={<Award className="w-5 h-5 text-emerald-400" />}
        />
        <DashboardCard
          title="Active Opportunities"
          value={loading ? '...' : stats.activeEventsCount}
          color="cyan"
          icon={<Calendar className="w-5 h-5 text-cyan-400" />}
        />
      </div>

      {/* Recent Applications List */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Event Applications</h2>
            <p className="text-xs text-slate-400">Track your latest status updates</p>
          </div>
          <Link href="/volunteer/applications" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
            View All Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            You have not applied to any events yet.{' '}
            <Link href="/volunteer/events" className="text-emerald-400 underline">
              Browse events here
            </Link>.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentApplications.map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-base">{app.event?.title}</h4>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    NGO: {app.event?.ngo?.full_name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span>{app.event?.date} at {app.event?.time}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {app.event?.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={app.status}>{app.status}</Badge>
                  {app.status === 'selected' && (
                    <Link href="/volunteer/chat">
                      <Button size="sm" variant="outline" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                        Chat with NGO
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
