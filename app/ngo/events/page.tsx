'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NgoEvent } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Toast';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Calendar, MapPin, Users, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

export default function NgoEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<NgoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<NgoEvent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [volunteerLimit, setVolunteerLimit] = useState(5);
  const [fundingGoal, setFundingGoal] = useState(0);
  const [fundingActive, setFundingActive] = useState(false);

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchNgoEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ngo_events')
        .select('*')
        .eq('ngo_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching NGO events:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNgoEvents();
  }, [fetchNgoEvents]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setRequiredSkills('');
    setVolunteerLimit(5);
    setFundingGoal(0);
    setFundingActive(false);
    setIsModalOpen(true);
  };

  const openEditModal = (event: NgoEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setRequiredSkills(event.required_skills);
    setVolunteerLimit(event.volunteer_limit);
    setFundingGoal(event.funding_goal);
    setFundingActive(event.funding_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication user missing.');

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('ngo_events')
          .update({
            title,
            description,
            date,
            time,
            location,
            required_skills: requiredSkills,
            volunteer_limit: Number(volunteerLimit),
            funding_goal: Number(fundingGoal),
            funding_active: fundingActive,
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        setAlert({
          type: 'success',
          msg: 'Event updated successfully.',
        });
      } else {
        // Create new event
        const { error } = await supabase.from('ngo_events').insert({
          ngo_id: user.id,
          title,
          description,
          date,
          time,
          location,
          required_skills: requiredSkills,
          volunteer_limit: Number(volunteerLimit),
          funding_goal: Number(fundingGoal),
          funding_active: fundingActive,
          status: 'active',
        });

        if (error) throw error;
        setAlert({
          type: 'success',
          msg: 'Volunteer Event Created Successfully.',
        });
      }

      setIsModalOpen(false);
      fetchNgoEvents();
    } catch (err: any) {
      setAlert({
        type: 'error',
        msg: err.message || 'Failed to save event.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel/delete this event?')) return;
    try {
      const { error } = await supabase.from('ngo_events').delete().eq('id', id);
      if (error) throw error;
      setAlert({
        type: 'success',
        msg: 'Event deleted successfully.',
      });
      fetchNgoEvents();
    } catch (err: any) {
      setAlert({
        type: 'error',
        msg: err.message || 'Failed to delete event.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Created Events</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create new volunteering events and manage active initiatives
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create New Event
        </Button>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading your events...</div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No Events Created Yet"
          description="You haven't created any events. Click below to host your first community initiative!"
          icon={<Calendar className="w-8 h-8 text-slate-500" />}
          action={
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
              Create Event Now
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
                  <Badge variant={event.status}>{event.status}</Badge>
                </div>

                <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 text-xs text-slate-400 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Required Skills: <strong className="text-slate-200">{event.required_skills}</strong> ({event.volunteer_limit} needed)</span>
                  </div>
                </div>

                {event.funding_active && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Funding Campaign:</p>
                    <ProgressBar
                      current={Number(event.accumulated_funds || 0)}
                      total={Number(event.funding_goal || 0)}
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => openEditModal(event)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => handleDelete(event.id)}
                >
                  Cancel Event
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event Details' : 'Create New Volunteer Event'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Beach Cleanup & Ocean Conservation Drive"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose, schedule, and volunteer duties for this event..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Event Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Time
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 AM - 02:00 PM"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Community Center, Park St."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Required Volunteer Limit
              </label>
              <input
                type="number"
                min={1}
                required
                value={volunteerLimit}
                onChange={(e) => setVolunteerLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Required Skills
            </label>
            <input
              type="text"
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="Teaching, Event Management, Physical Labor, First Aid"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Funding Section */}
          <div className="p-4 border border-slate-800 rounded-xl bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">
                Enable Sponsor Funding Campaign
              </label>
              <input
                type="checkbox"
                checked={fundingActive}
                onChange={(e) => setFundingActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
              />
            </div>

            {fundingActive && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Funding Goal Target ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingEvent ? 'Save Event Updates' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
