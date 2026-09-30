'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { Search, UserCheck, Phone, Mail, Clock, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NgoVolunteerSearchPage() {
  const supabase = createClient();
  const [volunteers, setVolunteers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'volunteer')
        .eq('status', 'approved')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setVolunteers(data || []);
    } catch (err) {
      console.error('Error fetching approved volunteers:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.skills && v.skills.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.availability && v.availability.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Volunteer Search Directory</h1>
        <p className="text-sm text-slate-400 mt-1">
          Find verified and approved volunteers by skills, name, or availability schedule
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by volunteer name, skills, or schedule..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading approved volunteers...</div>
      ) : filteredVolunteers.length === 0 ? (
        <EmptyState
          title="No Volunteers Found"
          description="No approved volunteers match your search filter."
          icon={<UserCheck className="w-8 h-8 text-slate-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVolunteers.map((vol) => (
            <div
              key={vol.id}
              className="border border-slate-800 rounded-2xl bg-slate-900/60 p-5 space-y-3 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{vol.full_name}</h3>
                    <p className="text-xs text-slate-400">{vol.email}</p>
                  </div>
                </div>

                {vol.bio && (
                  <p className="text-xs text-slate-300 line-clamp-2 my-2 leading-relaxed">
                    {vol.bio}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mt-3">
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Skills: <strong className="text-slate-200">{vol.skills || 'General Support'}</strong></span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Schedule: <strong className="text-slate-200">{vol.availability || 'Flexible'}</strong></span>
                  </div>
                  {vol.phone && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{vol.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
