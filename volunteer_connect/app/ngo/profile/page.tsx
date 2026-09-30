'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Toast';
import { Building2, Phone, MapPin, Globe, Save } from 'lucide-react';

export default function NgoProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [ngoName, setNgoName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setNgoName(data.full_name || '');
      setPhone(data.phone || '');
      setBio(data.bio || '');
      setLocation(data.location || '');
      setWebsite(data.website || '');
    } catch (err) {
      console.error('Error fetching NGO profile:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setAlert(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: ngoName,
          phone: phone || null,
          bio: bio || null,
          location: location || null,
          website: website || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setAlert({
        type: 'success',
        msg: 'NGO Organization details updated successfully!',
      });
    } catch (err: any) {
      setAlert({
        type: 'error',
        msg: err.message || 'Failed to update NGO profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">NGO Profile Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your organization details, contact info, and web presence
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSave} className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Organization Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              HQ Location / Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New York, NY"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Website URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://organization.org"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Organization Description & Mission
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Provide a description of your NGO's mission and impact goals..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <Button
          type="submit"
          isLoading={saving}
          variant="primary"
          icon={<Save className="w-4 h-4" />}
        >
          Update NGO Details
        </Button>
      </form>
    </div>
  );
}
