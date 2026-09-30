'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types/database';
import {
  LayoutDashboard,
  Calendar,
  FileCheck,
  Award,
  User,
  MessageSquare,
  Building2,
  Users,
  Search,
  DollarSign,
  History,
  ShieldAlert,
  BarChart3,
  X,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen = true, onClose }) => {
  const pathname = usePathname();

  const navItemsByRole: Record<UserRole, NavItem[]> = {
    volunteer: [
      { label: 'Overview', href: '/volunteer/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Browse Events', href: '/volunteer/events', icon: <Calendar className="w-4 h-4" /> },
      { label: 'My Applications', href: '/volunteer/applications', icon: <FileCheck className="w-4 h-4" /> },
      { label: 'My Events', href: '/volunteer/my-events', icon: <Award className="w-4 h-4" /> },
      { label: 'Profile', href: '/volunteer/profile', icon: <User className="w-4 h-4" /> },
      { label: 'Chat', href: '/volunteer/chat', icon: <MessageSquare className="w-4 h-4" /> },
    ],
    ngo: [
      { label: 'Overview', href: '/ngo/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'NGO Profile', href: '/ngo/profile', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Events', href: '/ngo/events', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Applications', href: '/ngo/applications', icon: <FileCheck className="w-4 h-4" /> },
      { label: 'Volunteer Search', href: '/ngo/volunteers', icon: <Search className="w-4 h-4" /> },
      { label: 'Chat', href: '/ngo/chat', icon: <MessageSquare className="w-4 h-4" /> },
    ],
    sponsor: [
      { label: 'Overview', href: '/sponsor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Event Directory', href: '/sponsor/events', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Donation History', href: '/sponsor/history', icon: <History className="w-4 h-4" /> },
    ],
    admin: [
      { label: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Pending Approvals', href: '/admin/profiles', icon: <ShieldAlert className="w-4 h-4" /> },
      { label: 'User Management', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Event Management', href: '/admin/events', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Reports & Stats', href: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  };

  const items = navItemsByRole[role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900/95 transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2 pt-2 lg:hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Volunteer Connect v1.0</p>
            <p className="mt-0.5">CS College Project Platform</p>
          </div>
        </div>
      </aside>
    </>
  );
};
