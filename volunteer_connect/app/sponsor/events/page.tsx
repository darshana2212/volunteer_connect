'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NgoEvent } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Toast';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { DollarSign, Calendar, MapPin, Heart, CheckCircle2, Search } from 'lucide-react';

export default function SponsorEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<NgoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<NgoEvent | null>(null);
  const [donationAmount, setDonationAmount] = useState<number | ''>('');
  const [donating, setDonating] = useState(false);

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFundedEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ngo_events')
        .select(`
          *,
          ngo:ngo_id (full_name, email, location)
        `)
        .eq('funding_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching funded events:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFundedEvents();
  }, [fetchFundedEvents]);

  const handleOpenDonateModal = (event: NgoEvent) => {
    setSelectedEvent(event);
    setDonationAmount(50);
    setAlert(null);
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !donationAmount || Number(donationAmount) <= 0) {
      setAlert({
        type: 'error',
        msg: 'Please enter a valid donation amount greater than $0.',
      });
      return;
    }

    setDonating(true);
    setAlert(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication session lost.');

      const amountNum = Number(donationAmount);

      // 1. Create donation record
      const { error: donError } = await supabase.from('donations').insert({
        event_id: selectedEvent.id,
        sponsor_id: user.id,
        amount: amountNum,
      });

      if (donError) throw donError;

      // 2. Update accumulated funds on the event
      const newAccumulated = Number(selectedEvent.accumulated_funds || 0) + amountNum;
      const { error: eventUpdateError } = await supabase
        .from('ngo_events')
        .update({ accumulated_funds: newAccumulated })
        .eq('id', selectedEvent.id);

      if (eventUpdateError) throw eventUpdateError;

      // 3. Show success message
      setAlert({
        type: 'success',
        msg: 'Donation Successful! Thank you for supporting this event.',
      });

      setSelectedEvent(null);
      fetchFundedEvents();
    } catch (err: any) {
      setAlert({
        type: 'error',
        msg: err.message || 'Donation submission failed.',
      });
    } finally {
      setDonating(false);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.ngo?.full_name && e.ngo.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Active Campaign Directory</h1>
        <p className="text-sm text-slate-400 mt-1">
          Support verified NGO events by contributing financial grants
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campaigns by event or NGO title..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading campaign directory...</div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No Active Campaigns"
          description="There are currently no NGO events seeking funding support."
          icon={<DollarSign className="w-8 h-8 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const goal = Number(event.funding_goal || 0);
            const current = Number(event.accumulated_funds || 0);
            const remaining = Math.max(0, goal - current);
            const percentage = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

            return (
              <div
                key={event.id}
                className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 flex flex-col justify-between space-y-5 shadow-xl backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
                  </div>

                  <p className="text-xs font-semibold text-emerald-400 mb-3">
                    Organized by: {event.ngo?.full_name}
                  </p>

                  <p className="text-sm text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <ProgressBar current={current} total={goal} />
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Remaining Need: <strong className="text-emerald-400">${remaining.toLocaleString()}</strong></span>
                      <span>Target: <strong>${goal.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full mt-2"
                  icon={<Heart className="w-4 h-4 fill-current" />}
                  onClick={() => handleOpenDonateModal(event)}
                >
                  Make a Donation
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Mock Donation Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Mock Event Donation Form"
        maxWidth="md"
      >
        {selectedEvent && (
          <form onSubmit={handleDonateSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Supporting Event</span>
              <h4 className="font-bold text-white text-base">{selectedEvent.title}</h4>
              <p className="text-xs text-emerald-400">Organized by {selectedEvent.ngo?.full_name}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Donation Amount ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  required
                  min={1}
                  step={10}
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300">
              💡 This is a mock donation system for the college project. No actual monetary payment gateway processing will be requested.
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setSelectedEvent(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={donating} icon={<CheckCircle2 className="w-4 h-4" />}>
                Submit Mock Donation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
