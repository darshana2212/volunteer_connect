'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Search, Users, HeartHandshake, UserPlus, Link2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col relative overflow-x-hidden">
      {/* Subtle Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. Navbar */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 lg:px-12 backdrop-blur-md">
        <Link href="#" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Volunteer <span className="text-emerald-400">Connect</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <Link href="#about" className="hover:text-emerald-400 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="md">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="max-w-5xl mx-auto px-6 lg:px-12 pt-20 pb-24 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl">
            Connect. Volunteer.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Make a Difference.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Volunteer Connect brings volunteers, NGOs, and sponsors together to create meaningful community impact.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5" icon={<ArrowRight className="w-5 h-5" />}>
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* 3. Three Feature Cards & About Section */}
        <section id="about" className="max-w-6xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-800/60">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white tracking-tight">Our Core Mission</h2>
            <p className="text-slate-400 text-sm mt-2">Empowering communities through seamless coordination</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-8 flex flex-col items-start hover:border-emerald-500/40 transition-all backdrop-blur-sm shadow-xl">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Find Opportunities</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Discover volunteer events posted by NGOs.
              </p>
            </div>

            <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-8 flex flex-col items-start hover:border-indigo-500/40 transition-all backdrop-blur-sm shadow-xl">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect with NGOs</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Apply for opportunities and connect with organizations.
              </p>
            </div>

            <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-8 flex flex-col items-start hover:border-amber-500/40 transition-all backdrop-blur-sm shadow-xl">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Support Causes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sponsors can support active NGO events through funding.
              </p>
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section className="max-w-6xl mx-auto px-6 lg:px-12 py-20 border-t border-slate-800/60">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">How It Works</h2>
            <p className="text-slate-400 text-sm mt-2">Getting started is simple and straightforward</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative border border-slate-800/80 rounded-2xl bg-slate-900/30 p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-lg flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Create an Account</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Choose your role and create your profile.
              </p>
            </div>

            <div className="relative border border-slate-800/80 rounded-2xl bg-slate-900/30 p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-extrabold text-lg flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Get Connected</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Find opportunities, volunteers, or causes that match your goals.
              </p>
            </div>

            <div className="relative border border-slate-800/80 rounded-2xl bg-slate-900/30 p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-600/20 border border-teal-500/40 text-teal-400 font-extrabold text-lg flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Make an Impact</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Volunteer, organize events, or support community initiatives.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 lg:px-12 py-8 text-center text-sm text-slate-400">
        <p>Volunteer Connect — Connecting people with opportunities to make a difference.</p>
      </footer>
    </div>
  );
}
