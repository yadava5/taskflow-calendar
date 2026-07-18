import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MousePointer2,
  Sparkles,
  Wand2,
} from 'lucide-react';

/**
 * Public landing — the front door before the app. Deliberately shares the
 * dark house identity of the auth surface (near-black, mono labels,
 * hairline rules) so landing → login → app reads as one product.
 */

const PARSE_DEMO: { text: string; chips: [string, string][] }[] = [
  {
    text: '“Lunch with Sam tomorrow 1pm at Patterson’s”',
    chips: [
      ['event', 'Lunch with Sam'],
      ['when', 'tomorrow · 1:00 PM'],
      ['where', 'Patterson’s'],
    ],
  },
  {
    text: '“Ship the report by Friday !high #work”',
    chips: [
      ['task', 'Ship the report'],
      ['due', 'Friday'],
      ['priority', 'high'],
      ['list', 'work'],
    ],
  },
];

const FEATURES = [
  {
    icon: Wand2,
    title: 'Type it like you’d say it',
    body: 'A three-stage NLP pipeline (chrono + compromise + priority rules) turns plain sentences into scheduled tasks — dates, times, priorities, lists.',
  },
  {
    icon: CalendarDays,
    title: 'Every calendar, one week',
    body: 'Multiple color-coded calendars, month/week/day/agenda views, recurrence, and a mobile view that never crams seven columns.',
  },
  {
    icon: MousePointer2,
    title: 'Drag a thought onto time',
    body: 'Pull tasks straight onto the grid to schedule them; drag, resize and reflow events without opening a dialog.',
  },
];

export default function WelcomePage() {
  return (
    <div className="dark min-h-screen bg-[#0a0a0b] text-[#d6d8db]">
      {/* Nav */}
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <p className="font-mono text-sm font-semibold text-[#f7f8f8]">
          task<span className="text-[#63666c]">_</span>flow
        </p>
        <Link
          to="/login"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#d6d8db] transition-colors hover:border-white/25 hover:text-white"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <p className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#8a8f98]">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          calendar + tasks + NLP · 1,145 tests passing
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-[#f7f8f8] sm:text-6xl">
          Your week, already sorted.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#8a8f98]">
          TaskFlow reads plain English and files it where it belongs — events on
          the calendar, tasks in their lists, priorities set, conflicts caught.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#f7f8f8] px-6 py-3 font-medium text-[#0a0a0b] transition-transform hover:-translate-y-px"
          >
            Try the live demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-widest text-[#63666c]">
          demo account · john@example.com / password123 · seeded with a real
          week
        </p>
      </section>

      {/* NLP showcase */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#63666c]">
          01 · the smart input, verbatim
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PARSE_DEMO.map((demo) => (
            <div
              key={demo.text}
              className="rounded-xl border border-white/10 bg-[#0f1011] p-5"
            >
              <p className="font-mono text-sm text-[#d6d8db]">{demo.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {demo.chips.map(([kind, value]) => (
                  <span
                    key={kind + value}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[0.65rem] text-emerald-300"
                  >
                    <span className="text-emerald-500/70">{kind}</span> {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#63666c]">
          02 · built like a product, not a demo
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-[#0f1011] p-6 transition-colors hover:border-white/20"
            >
              <f.icon className="h-5 w-5 text-emerald-400" />
              <h3 className="mt-4 font-semibold text-[#f7f8f8]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#8a8f98]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof strip */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-x-6 gap-y-3 rounded-xl border border-white/10 bg-[#0f1011] p-6 sm:grid-cols-2">
          {[
            'Full-stack: React 19 SPA + 32 serverless handlers behind one dispatcher',
            'Postgres via CA-pinned TLS · JWT auth with rotation + blacklist',
            '1,145 tests green · strict security headers · zero third-party calls',
            'Real accounts persist — the demo user keeps its week between visits',
          ].map((line) => (
            <p
              key={line}
              className="flex items-start gap-2.5 text-sm text-[#8a8f98]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              {line}
            </p>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl border-t border-white/10 px-6 py-8 text-center font-mono text-[0.65rem] uppercase tracking-widest text-[#63666c]">
        task_flow · calendar &amp; tasks, in plain English · by Ayush Yadav
      </footer>
    </div>
  );
}
