'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Toast';
import {
  Users,
  Building2,
  DollarSign,
  ShieldAlert,
  Calendar,
  FileCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [stats, setStats] = useState({
    volunteers: 0,
    ngos: 0,
    sponsors: 0,
    pendingProfiles: 0,
    events: 0,
    applications: 0,
    donations: 0,
  });

  const [pendingList, setPendingList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch count stats
      const [volRes, ngoRes, sponRes, pendRes, evRes, appRes, donRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'volunteer'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'ngo'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'sponsor'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('ngo_events').select('id', { count: 'exact' }),
        supabase.from('event_applications').select('id', { count: 'exact' }),
        supabase.from('donations').select('id', { count: 'exact' }),
      ]);

      setStats({
        volunteers: volRes.count || 0,
        ngos: ngoRes.count || 0,
        sponsors: sponRes.count || 0,
        pendingProfiles: pendRes.count || 0,
        events: evRes.count || 0,
        applications: appRes.count || 0,
        donations: donRes.count || 0,
      });

      // Fetch top 5 pending profiles
      const { data: pendingData } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      setPendingList(pendingData || []);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setActionMessage({
        type: 'success',
        msg: `Profile status updated to ${newStatus}.`,
      });
      fetchDashboardData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        msg: err.message || 'Failed to update profile status.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor system metrics and manage platform registrations
        </p>
      </div>

      {actionMessage && (
        <Alert
          type={actionMessage.type}
          message={actionMessage.msg}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Volunteers"
          value={loading ? '...' : stats.volunteers}
          color="emerald"
          icon={<Users className="w-5 h-5 text-emerald-400" />}
        />
        <DashboardCard
          title="Total NGOs"
          value={loading ? '...' : stats.ngos}
          color="indigo"
          icon={<Building2 className="w-5 h-5 text-indigo-400" />}
        />
        <DashboardCard
          title="Total Sponsors"
          value={loading ? '...' : stats.sponsors}
          color="amber"
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
        />
        <DashboardCard
          title="Pending Profiles"
          value={loading ? '...' : stats.pendingProfiles}
          color="rose"
          icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Events"
          value={loading ? '...' : stats.events}
          color="cyan"
          icon={<Calendar className="w-5 h-5 text-cyan-400" />}
        />
        <DashboardCard
          title="Total Applications"
          value={loading ? '...' : stats.applications}
          color="purple"
          icon={<FileCheck className="w-5 h-5 text-purple-400" />}
        />
        <DashboardCard
          title="Total Donations"
          value={loading ? '...' : stats.donations}
          color="emerald"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Pending Approvals Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Pending Registrations</h2>
            <p className="text-xs text-slate-400">Review users waiting for platform approval</p>
          </div>
        </div>

        {pendingList.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No pending profile approvals right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Registered Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{item.full_name}</td>
                    <td className="px-4 py-3 text-slate-400">{item.email}</td>
                    <td className="px-4 py-3 capitalize text-slate-300">{item.role}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="pending">Pending</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(item.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(item.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
