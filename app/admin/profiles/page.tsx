'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShieldCheck, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

export default function AdminProfilesPage() {
  const supabase = createClient();
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingProfiles(data || []);
    } catch (err: any) {
      console.error('Error fetching pending profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setAlert({
        type: 'success',
        msg: `Profile successfully marked as ${newStatus}.`,
      });
      fetchPending();
    } catch (err: any) {
      setAlert({
        type: 'error',
        msg: err.message || 'Failed to update profile status.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review and approve pending registration requests
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading pending requests...</div>
      ) : pendingProfiles.length === 0 ? (
        <EmptyState
          title="All Registrations Cleared"
          description="There are currently no pending profile registrations requiring approval."
          icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
        />
      ) : (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Phone / Details</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {profile.full_name}
                      {profile.bio && (
                        <p className="text-xs font-normal text-slate-400 mt-0.5 line-clamp-1">
                          {profile.bio}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{profile.email}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200">
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {profile.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="pending">Pending</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(profile.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(profile.id, 'rejected')}
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
        </div>
      )}
    </div>
  );
}
