'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Heart, LogOut, Menu, User } from 'lucide-react';
import { Profile } from '@/types/database';

interface NavbarProps {
  profile: Profile | null;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ profile, onToggleSidebar }) => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const roleLabels: Record<string, string> = {
    volunteer: 'Volunteer',
    ngo: 'NGO Rep',
    sponsor: 'Sponsor',
    admin: 'Admin',
  };

  const roleColors: Record<string, string> = {
    volunteer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ngo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    sponsor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-900/40">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Volunteer <span className="text-emerald-400">Connect</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleColors[profile.role]}`}
            >
              {roleLabels[profile.role] || profile.role}
            </span>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-white leading-tight">
                {profile.full_name}
              </span>
              <span className="text-xs text-slate-400">{profile.email}</span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <User className="h-4 w-4" />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 hover:bg-rose-950/30 hover:border-rose-800/50 text-slate-300 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
