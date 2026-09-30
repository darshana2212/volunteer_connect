'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Donation } from '@/types/database';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/Button';
import { DollarSign, Calendar, Heart, ArrowRight, TrendingUp } from 'lucide-react';

export default function SponsorDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    activeCampaignsCount: 0,
  });
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSponsorOverview = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [donationsRes, campaignsRes] = await Promise.all([
        supabase
          .from('donations')
          .select(`
            *,
            event:event_id (
              title,
              ngo:ngo_id (full_name)
            )
          `)
          .eq('sponsor_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('ngo_events').select('id', { count: 'exact' }).eq('funding_active', true),
      ]);

      const list = (donationsRes.data as any) || [];
      const total = list.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

      setStats({
        totalDonated: total,
        donationCount: list.length,
        activeCampaignsCount: campaignsRes.count || 0,
      });

      setRecentDonations(list.slice(0, 4));
    } catch (err) {
      console.error('Error fetching sponsor dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSponsorOverview();
  }, [fetchSponsorOverview]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sponsor Impact Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Fund community initiatives and empower NGO events across the platform
          </p>
        </div>
        <Link href="/sponsor/events">
          <Button variant="primary" icon={<DollarSign className="w-4 h-4" />}>
            Explore Funding Directory
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Contribution"
          value={loading ? '...' : `$${stats.totalDonated.toLocaleString()}`}
          color="emerald"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        />
        <DashboardCard
          title="Donations Made"
          value={loading ? '...' : stats.donationCount}
          color="amber"
          icon={<Heart className="w-5 h-5 text-amber-400" />}
        />
        <DashboardCard
          title="Active Funding Campaigns"
          value={loading ? '...' : stats.activeCampaignsCount}
          color="cyan"
          icon={<Calendar className="w-5 h-5 text-cyan-400" />}
        />
      </div>

      {/* Recent Contribution Activity */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Contributions</h2>
            <p className="text-xs text-slate-400">History of events you supported</p>
          </div>
          <Link href="/sponsor/history" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
            View Full Donation History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDonations.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            You have not made any donations yet.{' '}
            <Link href="/sponsor/events" className="text-emerald-400 underline">
              Browse campaign directory here
            </Link>.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentDonations.map((don) => (
              <div key={don.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-base">{don.event?.title}</h4>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    NGO: {don.event?.ngo?.full_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Date: {new Date(don.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400">
                    +${Number(don.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
