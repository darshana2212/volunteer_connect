'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PendingPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleRefresh = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

      if (profile && profile.status === 'approved') {
        router.push(`/${profile.role}/dashboard`);
        router.refresh();
        return;
      }
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
          <Clock className="w-10 h-10 animate-spin-slow" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Account Pending Approval</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Your account registration has been submitted and is currently being reviewed by an Administrator.
          Once approved, you will get full access to Volunteer Connect.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="w-full"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Check Status Again
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-slate-400 hover:text-rose-400"
            icon={<LogOut className="w-4 h-4" />}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
