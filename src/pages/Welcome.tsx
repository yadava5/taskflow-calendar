import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Flag,
  MousePointer2,
  Wand2,
} from 'lucide-react';

/**
 * Public landing — the front door before the app. Shares the dark house
 * identity of the auth surface (near-black, mono labels, hairline rules)
 * so landing → login → app reads as one product.
 *
 * The hero doesn't describe the parser — it runs one sentence through it,
 * in three beats: you type → it reads → it files. Both examples are the
 * real smart-input behavior, verbatim.
 */

type Example = {
  text: string;
  chips: [string, string][];
  filed: {
    kind: 'event' | 'task';
    day: number; // 0-4, MON–FRI
    top: string; // vertical position in the mini week
    label: string;
    detail: string;
  };
};

const EXAMPLES: Example[] = [
  {
    text: 'Lunch with Sam tomorrow 1pm at Patterson’s',
    chips: [
      ['event', 'Lunch with Sam'],
      ['when', 'tomorrow · 1:00 PM'],
      ['where', 'Patterson’s'],
    ],
    filed: {
      kind: 'event',
      day: 3,
      top: '34%',
      label: 'Lunch with Sam',
      detail: '1:00 PM · Patterson’s',
    },
  },
  {
    text: 'Ship the report by Friday !high #work',
    chips: [
      ['task', 'Ship the report'],
      ['due', 'Friday'],
      ['priority', 'high'],
      ['list', 'work'],
    ],
    filed: {
      kind: 'task',
      day: 4,
      top: '12%',
      label: 'Ship the report',
      detail: 'due · !high · #work',
    },
  },
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;

/** The hero artifact: one sentence, three beats. Cycles both examples. */
function ParseShowcase() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % EXAMPLES.length);
        setVisible(true);
      }, 260);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  const ex = EXAMPLES[index];

  return (
    <div className="relative mx-auto mt-14 w-full max-w-2xl text-left">
      {/* one signature glow — emerald, soft, never a gradient wash */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-emerald-400/[0.06] blur-3xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0f1011]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#63666c]">
            one sentence, three beats
          </span>
          <span className="font-mono text-[0.62rem] text-[#63666c]">
            live logic · the real parser
          </span>
        </div>

        <div
          className={`px-5 py-5 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Beat 1 — you type */}
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#63666c]">
            you type
          </p>
          <p className="mt-2 rounded-lg border border-white/[0.06] bg-[#0a0a0b] px-4 py-3 font-mono text-sm text-[#d6d8db]">
            <span className="mr-2 text-emerald-500/70">›</span>
            {ex.text}
            <span className="ml-0.5 animate-pulse text-emerald-400">▍</span>
          </p>

          {/* Beat 2 — it reads */}
          <p className="mt-5 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#63666c]">
            it reads
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ex.chips.map(([kind, value]) => (
              <span
                key={kind + value}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[0.65rem] text-emerald-300"
              >
                <span className="text-emerald-500/70">{kind}</span> {value}
              </span>
            ))}
          </div>

          {/* Beat 3 — it files */}
          <p className="mt-5 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#63666c]">
            it files
          </p>
          <div className="mt-2 grid grid-cols-5 overflow-hidden rounded-lg border border-white/[0.06]">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="relative h-28 border-r border-white/[0.05] last:border-r-0"
              >
                <p className="border-b border-white/[0.05] py-1.5 text-center font-mono text-[0.6rem] tracking-widest text-[#63666c]">
                  {day}
                </p>
                {ex.filed.day === i && (
                  <div
                    className={`absolute inset-x-1 rounded-md px-1.5 py-1 ${
                      ex.filed.kind === 'event'
                        ? 'border border-emerald-400/40 bg-emerald-400/15'
                        : 'border border-dashed border-emerald-400/40 bg-emerald-400/[0.07]'
                    }`}
                    style={{ top: ex.filed.top }}
                  >
                    <p className="flex items-center gap-1 truncate text-[0.65rem] font-medium text-emerald-200">
                      {ex.filed.kind === 'task' && (
                        <Flag className="h-2.5 w-2.5 shrink-0" />
                      )}
                      {ex.filed.label}
                    </p>
                    <p className="truncate font-mono text-[0.55rem] text-emerald-400/70">
                      {ex.filed.detail}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-widest text-[#63666c]">
        no forms were opened in the making of that {ex.filed.kind}
      </p>
    </div>
  );
}

const FEATURES = [
  {
    icon: Wand2,
    title: 'Reads before it writes',
    body: 'Three parsing stages — chrono for time, compromise for language, rules for priority — and the input shows you its reading before anything is saved.',
  },
  {
    icon: CalendarDays,
    title: 'Every calendar, one week',
    body: 'Color-coded calendars, month/week/day/agenda views, recurrence — and a mobile view that stacks the week instead of cramming seven columns.',
  },
  {
    icon: MousePointer2,
    title: 'Drag a thought onto time',
    body: 'Pull tasks straight onto the grid to schedule them; drag, resize and reflow events without ever opening a dialog.',
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
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <p className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#8a8f98]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            aria-hidden
          />
          calendar + tasks + NLP · 1,145 tests passing
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-[#f7f8f8] sm:text-6xl">
          Type it the way you’d say it.
          <span className="block text-[#8a8f98]">
            It lands where it belongs.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#8a8f98]">
          One plain sentence becomes an event on the calendar, a task in its
          list, a priority set, a conflict caught — filed by a parser that shows
          its work.
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

        <ParseShowcase />
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#63666c]">
          01 · built like a product, not a demo
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
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#63666c]">
          02 · the receipts
        </p>
        <div className="grid gap-x-6 gap-y-3 rounded-xl border border-white/10 bg-[#0f1011] p-6 sm:grid-cols-2">
          {[
            'Full-stack: React 19 SPA + 32 serverless handlers behind one dispatcher',
            'Postgres via CA-pinned TLS · JWT auth with rotation + strict rate limits',
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
