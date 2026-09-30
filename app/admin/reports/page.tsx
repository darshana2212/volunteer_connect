'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Users, Calendar, FileCheck, DollarSign, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';

export default function AdminReportsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalApplications: 0,
    selectedApplications: 0,
    totalDonations: 0,
    totalDonatedAmount: 0,
  });

  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        usersRes,
        apprRes,
        pendRes,
        eventsRes,
        actEvRes,
        appsRes,
        selAppRes,
        donRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('ngo_events').select('id', { count: 'exact' }),
        supabase.from('ngo_events').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('event_applications').select('id', { count: 'exact' }),
        supabase.from('event_applications').select('id', { count: 'exact' }).eq('status', 'selected'),
        supabase.from('donations').select('amount'),
      ]);

      const totalDonated = donRes.data ? donRes.data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) : 0;

      setMetrics({
        totalUsers: usersRes.count || 0,
        approvedUsers: apprRes.count || 0,
        pendingUsers: pendRes.count || 0,
        totalEvents: eventsRes.count || 0,
        activeEvents: actEvRes.count || 0,
        totalApplications: appsRes.count || 0,
        selectedApplications: selAppRes.count || 0,
        totalDonations: donRes.data?.length || 0,
        totalDonatedAmount: totalDonated,
      });
    } catch (err) {
      console.error('Error loading analytics reports:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const approvalRate = metrics.totalUsers > 0 ? Math.round((metrics.approvedUsers / metrics.totalUsers) * 100) : 0;
  const matchRate = metrics.totalApplications > 0 ? Math.round((metrics.selectedApplications / metrics.totalApplications) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Reports & Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Detailed metrics breakdown of platform engagement, user approvals, and sponsor funding
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Platform Users"
          value={loading ? '...' : metrics.totalUsers}
          description={`${approvalRate}% approval rate`}
          color="emerald"
          icon={<Users className="w-5 h-5 text-emerald-400" />}
        />
        <DashboardCard
          title="Active Events"
          value={loading ? '...' : metrics.activeEvents}
          description={`out of ${metrics.totalEvents} total events`}
          color="indigo"
          icon={<Calendar className="w-5 h-5 text-indigo-400" />}
        />
        <DashboardCard
          title="Volunteer Match Rate"
          value={loading ? '...' : `${matchRate}%`}
          description={`${metrics.selectedApplications} selected applicants`}
          color="cyan"
          icon={<FileCheck className="w-5 h-5 text-cyan-400" />}
        />
        <DashboardCard
          title="Total Funds Raised"
          value={loading ? '...' : `$${metrics.totalDonatedAmount.toLocaleString()}`}
          description={`Across ${metrics.totalDonations} sponsor donations`}
          color="amber"
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">User Approval Metrics</h3>
              <p className="text-xs text-slate-400">Account status distribution</p>
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Approved Accounts:</span>
              <span className="font-bold text-emerald-400">{metrics.approvedUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pending Review Accounts:</span>
              <span className="font-bold text-amber-400">{metrics.pendingUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Account Approval Ratio:</span>
              <span className="font-bold text-white">{approvalRate}%</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Community & Sponsor Impact</h3>
              <p className="text-xs text-slate-400">Platform activity highlights</p>
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Volunteer Applications:</span>
              <span className="font-bold text-white">{metrics.totalApplications}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Selected Applications:</span>
              <span className="font-bold text-cyan-400">{metrics.selectedApplications}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Average Donation per Event:</span>
              <span className="font-bold text-amber-400">
                ${metrics.totalEvents > 0 ? Math.round(metrics.totalDonatedAmount / metrics.totalEvents) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
