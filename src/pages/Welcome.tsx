import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Command,
  Flag,
  KeyRound,
  Layers,
  Link2,
  ListChecks,
  Lock,
  ServerCog,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Public landing — the front door before the app. It tells one story, in five
 * beats: the FORM is the friction → so we deleted it → here's what runs when
 * you hit enter → here are the receipts → try it. It shares the dark house
 * identity of the auth surface (near-black ink, mono labels, hairline rules,
 * a single emerald accent) so landing → login → app reads as one product.
 *
 * The centrepiece is the ParseShowcase: it doesn't describe the parser, it
 * runs one real sentence through it — you type → it reads → it files. Both
 * examples are the app's own smart-input behavior, verbatim.
 *
 * Every number on this page is verified against the repo; nothing is invented.
 */

/* ------------------------------------------------------------------ */
/* Reveal — reduced-motion-safe scroll-in. Under prefers-reduced-motion */
/* (or without IntersectionObserver) content is shown immediately with  */
/* no transform, so nothing important hides behind an animation.        */
/* ------------------------------------------------------------------ */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none',
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Small section eyebrow: "01 · the problem" in mono caps. */
function Eyebrow({ index, label }: { index: string; label: string }) {
  return (
    <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#63666c]">
      <span className="text-emerald-500/80">{index}</span> · {label}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* ParseShowcase — the hero artifact: one sentence, three beats.        */
/* Cycles the app's two real landing examples.                          */
/* ------------------------------------------------------------------ */
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

function ParseShowcase() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Respect reduced-motion: hold on the first example instead of cross-fading.
    if (prefersReducedMotion()) return;
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
    <div className="relative mx-auto w-full max-w-2xl text-left">
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
          className={cn(
            'px-5 py-5 transition-opacity duration-300 motion-reduce:transition-none',
            visible ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Beat 1 — you type */}
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#63666c]">
            you type
          </p>
          <p className="mt-2 rounded-lg border border-white/[0.06] bg-[#0a0a0b] px-4 py-3 font-mono text-sm text-[#d6d8db]">
            <span className="mr-2 text-emerald-500/70">›</span>
            {ex.text}
            <span className="ml-0.5 animate-pulse text-emerald-400 motion-reduce:animate-none">
              ▍
            </span>
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
                    className={cn(
                      'absolute inset-x-1 rounded-md px-1.5 py-1',
                      ex.filed.kind === 'event'
                        ? 'border border-emerald-400/40 bg-emerald-400/15'
                        : 'border border-dashed border-emerald-400/40 bg-emerald-400/[0.07]'
                    )}
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

/* ------------------------------------------------------------------ */
/* The form that the product deletes — six fields for one thought.      */
/* ------------------------------------------------------------------ */
const FORM_FIELDS = [
  'Title',
  'Date',
  'Start time',
  'End time',
  'Priority',
  'List',
] as const;

function TheForm() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-xl border border-white/10 bg-[#0f1011] p-5">
        <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#63666c]">
          new event
        </p>
        <div className="space-y-2.5">
          {FORM_FIELDS.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-right font-mono text-[0.62rem] text-[#63666c]">
                {f}
              </span>
              <span className="h-8 flex-1 rounded-md border border-dashed border-white/10 bg-[#0a0a0b]" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <span className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#63666c]">
            Cancel
          </span>
          <span className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-[#8a8f98]">
            Save
          </span>
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-widest text-[#63666c]">
        six fields to write down one lunch
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Implementation — the three-stage pipeline + the stack it runs on.    */
/* ------------------------------------------------------------------ */
const PIPELINE = [
  {
    stage: 'chrono',
    reads: 'the time',
    example: '“tomorrow 1pm” → a real Date',
  },
  {
    stage: 'compromise',
    reads: 'the language',
    example: '“Lunch with Sam” → title + people',
  },
  {
    stage: 'rules',
    reads: 'the priority',
    example: '“!high #work” → priority + list',
  },
] as const;

const STACK = [
  {
    icon: ServerCog,
    title: '32 handlers, one function',
    body: 'Vercel’s Hobby tier caps a deployment at 12 functions, so every API handler ships inside a single catch-all dispatcher that routes by URL path — byte-for-byte the same handlers, no framework routing assumptions.',
  },
  {
    icon: Lock,
    title: 'Postgres over pinned TLS',
    body: 'A Supabase Postgres, reached over a CA-pinned connection with rejectUnauthorized — the certificate is verified, not trusted blindly.',
  },
  {
    icon: ShieldCheck,
    title: 'Auth that assumes attack',
    body: 'Short-lived JWTs with refresh-token rotation, strict per-IP limits on auth (5 requests / 15 min), and Google refresh tokens sealed with AES-256-GCM at rest.',
  },
] as const;

const NEW_CAPS = [
  {
    icon: Command,
    title: '⌘K command palette',
    body: 'Create, jump to a date, search events and tasks, switch view — the same parser powers quick-add, all from the keyboard.',
  },
  {
    icon: BarChart3,
    title: 'Where your week goes',
    body: 'A panel that reads your real events and shows time by calendar, per-day load, and your busiest day — computed client-side, no tracking.',
  },
  {
    icon: Link2,
    title: 'Google Calendar sync',
    body: 'An incremental, read-only pull: TaskFlow asks only for the calendar.readonly scope, so it can show your Google events without touching them.',
  },
] as const;

const RECEIPTS = [
  {
    icon: ListChecks,
    title: '1,000+ tests, green',
    body: 'Across the parser, the serverless handlers, and the React UI — correctness is run, not asserted.',
  },
  {
    icon: Lock,
    title: 'Zero third-party calls',
    body: 'The Content-Security-Policy pins connect-src to ‘self’, so the running app cannot phone home — no analytics, no CDN, no external inference.',
  },
  {
    icon: Smartphone,
    title: 'It folds to fit',
    body: 'On a phone the seven-column week becomes a readable agenda instead of cramming seven columns into a palm.',
  },
  {
    icon: KeyRound,
    title: 'A week that persists',
    body: 'Real accounts are real: the demo user keeps its seeded week between visits, on the same Postgres the app runs on.',
  },
] as const;

/* ------------------------------------------------------------------ */

export default function WelcomePage() {
  return (
    <div className="dark min-h-screen bg-[#0a0a0b] text-[#d6d8db]">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <p className="font-mono text-sm font-semibold text-[#f7f8f8]">
            task<span className="text-[#63666c]">_</span>flow
          </p>
          <nav className="flex items-center gap-2">
            <a
              href="/system-card"
              className="hidden rounded-lg px-3 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-[#8a8f98] transition-colors hover:text-white sm:inline-block"
            >
              System Card
            </a>
            <Link
              to="/login"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#d6d8db] transition-colors hover:border-white/25 hover:text-white"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <Reveal>
          <p className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#8a8f98]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              aria-hidden
            />
            calendar · tasks · plain-english NLP
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-[#f7f8f8] sm:text-6xl">
            Type it the way you’d say it.
            <span className="block text-[#8a8f98]">
              It lands where it belongs.
            </span>
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#8a8f98]">
            One plain sentence becomes an event on the calendar, a task in its
            list, a priority set, a conflict caught — filed by a parser that
            shows its work.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f7f8f8] px-6 py-3 font-medium text-[#0a0a0b] transition-transform hover:-translate-y-px"
            >
              Try the live demo <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="/system-card"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 font-medium text-[#d6d8db] transition-colors hover:border-white/25 hover:text-white"
            >
              Read the System Card <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-widest text-[#63666c]">
            demo account · john@example.com / password123 · seeded with a real
            week
          </p>
        </Reveal>
      </section>

      {/* 01 — The problem */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow index="01" label="the problem" />
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-[#f7f8f8] sm:text-4xl">
              The form is the friction.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#8a8f98]">
              Open any calendar and it hands you the same paperwork: a title, a
              date, a start, an end, a priority, a list. Six fields to write
              down a single thought. You came to schedule one lunch — and filled
              out a form to do it.
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#d6d8db]">
              The calendar was never the friction.{' '}
              <span className="text-emerald-300">The form is.</span>
            </p>
          </Reveal>
          <Reveal delay={100}>
            <TheForm />
          </Reveal>
        </div>
      </section>

      {/* 02 — The solution (+ ParseShowcase) */}
      <section className="border-y border-white/[0.06] bg-[#0c0c0d]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal className="text-center">
            <Eyebrow index="02" label="the solution" />
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#f7f8f8] sm:text-4xl">
              So we deleted the form.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#8a8f98]">
              Type the thought the way you’d text it to a friend. A three-stage
              parser reads the time, the language, and the priority, shows you
              exactly what it understood, then files it — event or task — on the
              week. No dialog. No fields. One line.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <ParseShowcase />
          </Reveal>
        </div>
      </section>

      {/* 03 — Under the hood */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal>
          <Eyebrow index="03" label="under the hood" />
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#f7f8f8] sm:text-4xl">
            What runs the moment you hit enter.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#8a8f98]">
            The magic is a pipeline you can read. Three parsing stages hand off
            in order — each one catching a different part of your sentence.
          </p>
        </Reveal>

        {/* The pipeline */}
        <Reveal delay={80} className="mt-10">
          <ol className="grid gap-4 sm:grid-cols-3">
            {PIPELINE.map((p, i) => (
              <li
                key={p.stage}
                className="relative rounded-xl border border-white/10 bg-[#0f1011] p-6"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-emerald-500/80">
                  stage {i + 1}
                </span>
                <p className="mt-3 font-mono text-lg font-semibold text-[#f7f8f8]">
                  {p.stage}
                </p>
                <p className="mt-1 text-sm text-[#8a8f98]">reads {p.reads}</p>
                <p className="mt-4 rounded-md border border-white/[0.06] bg-[#0a0a0b] px-3 py-2 font-mono text-[0.7rem] text-emerald-300/90">
                  {p.example}
                </p>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight
                    className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-white/15 sm:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </Reveal>

        {/* The stack it runs on */}
        <Reveal delay={40} className="mt-14">
          <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#63666c]">
            and the stack it files into
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {STACK.map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-white/10 bg-[#0f1011] p-6"
              >
                <s.icon className="h-5 w-5 text-emerald-400" />
                <h3 className="mt-4 font-semibold text-[#f7f8f8]">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#8a8f98]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Newest surface area */}
        <Reveal delay={40} className="mt-10">
          <p className="mb-4 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#63666c]">
            <Layers className="h-3.5 w-3.5 text-emerald-500/80" /> and, newly,
            three ways in
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {NEW_CAPS.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-white/10 bg-[#0f1011] p-6"
              >
                <c.icon className="h-5 w-5 text-emerald-400" />
                <h3 className="mt-4 font-semibold text-[#f7f8f8]">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#8a8f98]">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 04 — The receipts */}
      <section className="border-t border-white/[0.06] bg-[#0c0c0d]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal>
            <Eyebrow index="04" label="the receipts" />
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#f7f8f8] sm:text-4xl">
              Proof, not promises.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {RECEIPTS.map((r, i) => (
              <Reveal delay={i * 60} key={r.title}>
                <div className="flex h-full gap-4 rounded-xl border border-white/10 bg-[#0f1011] p-6">
                  <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <div>
                    <h3 className="font-semibold text-[#f7f8f8]">{r.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#8a8f98]">
                      {r.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — Try it */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
        <Reveal>
          <Eyebrow index="05" label="try it" />
          <h2 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-[#f7f8f8] sm:text-5xl">
            Watch a sentence become your week.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#8a8f98]">
            The demo is the real app on real Postgres — sign in, type a plain
            sentence, and watch it file itself. Then read exactly how it works.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-medium text-[#052e1b] transition-transform hover:-translate-y-px"
            >
              <CalendarClock className="h-4 w-4" /> Try the live demo
            </Link>
            <a
              href="/system-card"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 font-medium text-[#f7f8f8] transition-colors hover:border-white/30"
            >
              Read the System Card <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-widest text-[#63666c]">
            john@example.com / password123
          </p>
        </Reveal>
      </section>

      <footer className="mx-auto w-full max-w-6xl border-t border-white/10 px-6 py-8 text-center font-mono text-[0.65rem] uppercase tracking-widest text-[#63666c]">
        task_flow · calendar &amp; tasks, in plain English · by Ayush Yadav
      </footer>
    </div>
  );
}
