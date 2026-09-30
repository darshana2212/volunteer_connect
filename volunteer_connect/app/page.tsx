'use client';

import Link from 'next/link';
import { ArrowRight, Building2, DollarSign, Heart, Users } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Find Opportunities',
    description: 'Discover volunteer events posted by NGOs.',
  },
  {
    icon: Building2,
    title: 'Connect with NGOs',
    description: 'Apply for opportunities and connect with organizations.',
  },
  {
    icon: DollarSign,
    title: 'Support Causes',
    description: 'Sponsors can support active NGO events through funding.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Create an Account',
    description: 'Choose your role and create your profile.',
  },
  {
    number: '2',
    title: 'Get Connected',
    description: 'Find opportunities, volunteers, or causes that match your goals.',
  },
  {
    number: '3',
    title: 'Make an Impact',
    description: 'Volunteer, organize events, or support community initiatives.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-200">
              <Heart className="h-5 w-5 fill-current" />
            </span>
            <span className="text-xl font-bold text-slate-900">Volunteer Connect</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/" className="transition hover:text-emerald-600">
              Home
            </Link>
            <Link href="#about" className="transition hover:text-emerald-600">
              About
            </Link>
            <Link href="/login" className="transition hover:text-emerald-600">
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
            >
              Get Started
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link href="/login" className="text-sm font-medium text-slate-600">
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8 lg:py-28">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            Community impact starts here
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Connect. Volunteer. Make a Difference.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Volunteer Connect brings volunteers, NGOs, and sponsors together to create meaningful community impact.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-600"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section id="about" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
                  <p className="text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How It Works</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-left">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
                  {number}
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600">
        Volunteer Connect — Connecting people with opportunities to make a difference.
      </footer>
    </div>
  );
}
