'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { EventApplication, NgoEvent } from '@/types/database';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Users, FileCheck, DollarSign, Plus, ArrowRight } from 'lucide-react';

export default function NgoDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    eventsCount: 0,
    applicationsCount: 0,
    selectedCount: 0,
    totalFunds: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNgoOverview = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch NGO events
      const { data: events } = await supabase
        .from('ngo_events')
        .select('id, accumulated_funds')
        .eq('ngo_id', user.id);

      const eventIds = (events || []).map((e) => e.id);
      const totalFunds = (events || []).reduce((acc, curr) => acc + Number(curr.accumulated_funds || 0), 0);

      let appsCount = 0;
      let selCount = 0;
      let recentApps: EventApplication[] = [];

      if (eventIds.length > 0) {
        const [appsRes, selRes, recentRes] = await Promise.all([
          supabase.from('event_applications').select('id', { count: 'exact' }).in('event_id', eventIds),
          supabase.from('event_applications').select('id', { count: 'exact' }).in('event_id', eventIds).eq('status', 'selected'),
          supabase
            .from('event_applications')
            .select(`
              *,
              event:event_id (title),
              volunteer:volunteer_id (full_name, email, skills, availability)
            `)
            .in('event_id', eventIds)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        appsCount = appsRes.count || 0;
        selCount = selRes.count || 0;
        recentApps = (recentRes.data as any) || [];
      }

      setStats({
        eventsCount: events?.length || 0,
        applicationsCount: appsCount,
        selectedCount: selCount,
        totalFunds,
      });

      setRecentApplicants(recentApps);
    } catch (err) {
      console.error('Error fetching NGO overview:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNgoOverview();
  }, [fetchNgoOverview]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NGO Portal Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your organization events, evaluate volunteer applications, and track campaign funding
          </p>
        </div>
        <Link href="/ngo/events">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Events"
          value={loading ? '...' : stats.eventsCount}
          color="indigo"
          icon={<Calendar className="w-5 h-5 text-indigo-400" />}
        />
        <DashboardCard
          title="Total Applications"
          value={loading ? '...' : stats.applicationsCount}
          color="purple"
          icon={<FileCheck className="w-5 h-5 text-purple-400" />}
        />
        <DashboardCard
          title="Selected Volunteers"
          value={loading ? '...' : stats.selectedCount}
          color="emerald"
          icon={<Users className="w-5 h-5 text-emerald-400" />}
        />
        <DashboardCard
          title="Campaign Funds Raised"
          value={loading ? '...' : `$${stats.totalFunds.toLocaleString()}`}
          color="amber"
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Recent Applications Section */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Event Applicants</h2>
            <p className="text-xs text-slate-400">Review volunteers who requested to join your events</p>
          </div>
          <Link href="/ngo/applications" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
            Manage All Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplicants.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No event applications received yet.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentApplicants.map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-base">{app.volunteer?.full_name}</h4>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Event: {app.event?.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Skills: {app.volunteer?.skills || 'Not specified'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
