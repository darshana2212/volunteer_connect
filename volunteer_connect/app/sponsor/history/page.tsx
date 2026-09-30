'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Donation } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { History, Calendar, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';

export default function SponsorHistoryPage() {
  const supabase = createClient();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          event:event_id (
            title,
            date,
            location,
            ngo:ngo_id (full_name)
          )
        `)
        .eq('sponsor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations((data as any) || []);
    } catch (err) {
      console.error('Error fetching donation history:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalDonated = donations.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Donation History</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete record of your financial grants and contributions to NGO events
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Donated:</span>
          <span className="text-xl font-bold text-emerald-400">${totalDonated.toLocaleString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading donation history...</div>
      ) : donations.length === 0 ? (
        <EmptyState
          title="No History Recorded"
          description="You have not submitted any mock donations yet."
          icon={<History className="w-8 h-8 text-slate-500" />}
          action={
            <Link href="/sponsor/events">
              <Button variant="primary">Explore Campaign Directory</Button>
            </Link>
          }
        />
      ) : (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <tr>
                  <th className="px-6 py-4">Supported Event</th>
                  <th className="px-6 py-4">NGO Partner</th>
                  <th className="px-6 py-4">Donation Date</th>
                  <th className="px-6 py-4 text-right">Contribution Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white text-base">
                      {don.event?.title}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">
                      {don.event?.ngo?.full_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(don.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-base">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        +${Number(don.amount).toLocaleString()}
                      </span>
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
