'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { XCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RejectedPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
          <XCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Registration Not Approved</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          We regret to inform you that your registration request was not approved by the Administrator at this time.
        </p>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full"
          icon={<LogOut className="w-4 h-4" />}
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
}
