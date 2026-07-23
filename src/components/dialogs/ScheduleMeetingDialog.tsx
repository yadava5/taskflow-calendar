import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addMinutes, format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Users,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';
import { parseLocalDate } from '@/utils/date';
import { cn } from '@/lib/utils';
import {
  googleCalendarApi,
  GoogleNotConnectedError,
  type CreatedMeeting,
} from '@/services/api/google';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Next top-of-the-hour from now, so the default slot is a clean time. */
function nextTopOfHour(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setSeconds(0, 0);
  if (d.getMinutes() > 0) {
    d.setMinutes(0);
    d.setHours(d.getHours() + 1);
  }
  return d;
}

interface FormState {
  title: string;
  date: string; // yyyy-MM-dd (local)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description: string;
  addMeet: boolean;
}

function makeDefaultForm(): FormState {
  const start = nextTopOfHour();
  const end = addMinutes(start, 30);
  return {
    title: '',
    date: format(start, 'yyyy-MM-dd'),
    startTime: format(start, 'HH:mm'),
    endTime: format(end, 'HH:mm'),
    description: '',
    addMeet: true,
  };
}

/** Combine a local yyyy-MM-dd + HH:mm into an ISO 8601 instant. */
function toISO(date: string, time: string): string {
  const base = parseLocalDate(date);
  const [h, m] = time.split(':').map(Number);
  base.setHours(h || 0, m || 0, 0, 0);
  return base.toISOString();
}

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings?: () => void;
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  onOpenSettings,
}: ScheduleMeetingDialogProps) {
  const [form, setForm] = useState<FormState>(makeDefaultForm);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeDraft, setAttendeeDraft] = useState('');
  const [attendeeError, setAttendeeError] = useState<string | null>(null);

  const [connection, setConnection] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking');
  const [phase, setPhase] = useState<'form' | 'submitting' | 'success'>('form');
  const [result, setResult] = useState<CreatedMeeting | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    []
  );

  // Reset + probe connection each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setForm(makeDefaultForm());
    setAttendees([]);
    setAttendeeDraft('');
    setAttendeeError(null);
    setPhase('form');
    setResult(null);
    setSubmitError(null);
    setCopied(false);
    setConnection('checking');

    let cancelled = false;
    googleCalendarApi
      .isConnected()
      .then((connected) => {
        if (!cancelled) setConnection(connected ? 'connected' : 'disconnected');
      })
      .catch(() => {
        if (!cancelled) setConnection('disconnected');
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Focus the title once connected and on the form.
  useEffect(() => {
    if (open && connection === 'connected' && phase === 'form') {
      const t = setTimeout(() => titleRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, connection, phase]);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const commitAttendees = useCallback((raw: string): boolean => {
    const candidates = raw
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (candidates.length === 0) return true;

    const invalid = candidates.filter((c) => !EMAIL_RE.test(c));
    const valid = candidates.filter((c) => EMAIL_RE.test(c));

    if (valid.length) {
      setAttendees((prev) => Array.from(new Set([...prev, ...valid])));
    }
    if (invalid.length) {
      setAttendeeError(`Not a valid email: ${invalid[0]}`);
      setAttendeeDraft(invalid.join(', '));
      return false;
    }
    setAttendeeError(null);
    setAttendeeDraft('');
    return true;
  }, []);

  const handleAttendeeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
        e.preventDefault();
        commitAttendees(attendeeDraft);
      } else if (
        e.key === 'Backspace' &&
        attendeeDraft.length === 0 &&
        attendees.length > 0
      ) {
        setAttendees((prev) => prev.slice(0, -1));
      }
    },
    [attendeeDraft, attendees.length, commitAttendees]
  );

  const removeAttendee = useCallback((email: string) => {
    setAttendees((prev) => prev.filter((a) => a !== email));
  }, []);

  const timesValid = form.startTime < form.endTime;
  const canSubmit =
    connection === 'connected' &&
    form.title.trim().length > 0 &&
    Boolean(form.date) &&
    timesValid &&
    phase === 'form';

  const handleConnect = useCallback(async () => {
    try {
      const url = await googleCalendarApi.getConnectUrl();
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not start Google connect'
      );
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    // Fold any un-committed text in the attendee box into the list first.
    if (attendeeDraft.trim() && !commitAttendees(attendeeDraft)) return;
    if (!canSubmit) return;

    setPhase('submitting');
    setSubmitError(null);
    try {
      const created = await googleCalendarApi.createMeeting({
        summary: form.title.trim(),
        description: form.description.trim() || undefined,
        start: toISO(form.date, form.startTime),
        end: toISO(form.date, form.endTime),
        timeZone,
        attendees,
        addMeet: form.addMeet,
      });
      setResult(created);
      setPhase('success');
      toast.success(
        created.invitesSent > 0
          ? `Invites sent to ${created.invitesSent} ${
              created.invitesSent === 1 ? 'person' : 'people'
            }`
          : 'Meeting created'
      );
    } catch (error) {
      setPhase('form');
      if (error instanceof GoogleNotConnectedError) {
        setConnection('disconnected');
        setSubmitError(error.message);
      } else {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Failed to create the meeting'
        );
      }
    }
  }, [attendeeDraft, attendees, canSubmit, commitAttendees, form, timeZone]);

  const copyMeetLink = useCallback(async () => {
    if (!result?.hangoutLink) return;
    try {
      await navigator.clipboard.writeText(result.hangoutLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Could not copy the link');
    }
  }, [result?.hangoutLink]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Video className="h-4 w-4" />
            </span>
            Schedule a meeting
          </DialogTitle>
          <DialogDescription>
            Create a Google Calendar event and invite people by email. Google
            sends each guest a calendar invite they can accept or decline.
          </DialogDescription>
        </DialogHeader>

        {connection === 'checking' && (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking your Google connection…
          </div>
        )}

        {connection === 'disconnected' && phase !== 'success' && (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Connect Google Calendar first</p>
                <p className="text-muted-foreground">
                  {submitError ??
                    'To schedule meetings and send invites, connect your Google account with calendar access.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {onOpenSettings && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenSettings();
                  }}
                >
                  Open Settings
                </Button>
              )}
              <Button onClick={handleConnect} className="gap-2">
                <CalendarClock className="h-4 w-4" />
                Connect Google
              </Button>
            </div>
          </div>
        )}

        {connection === 'connected' && phase !== 'success' && (
          <div className="space-y-5 py-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="meeting-title">Title</Label>
              <Input
                id="meeting-title"
                ref={titleRef}
                placeholder="e.g. Design review"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>

            {/* Date + time */}
            <div className="space-y-1.5">
              <Label>When</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  aria-label="Meeting date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  className="w-auto"
                />
                <CustomTimeInput
                  value={form.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                  className="w-auto"
                />
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <CustomTimeInput
                  value={form.endTime}
                  onChange={(e) => update('endTime', e.target.value)}
                  className="w-auto"
                />
              </div>
              {!timesValid && (
                <p className="text-xs text-destructive">
                  End time must be after the start time.
                </p>
              )}
            </div>

            {/* Attendees */}
            <div className="space-y-1.5">
              <Label
                htmlFor="meeting-attendees"
                className="flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Invite people
              </Label>
              <div
                className={cn(
                  'flex flex-wrap items-center gap-1.5 rounded-md border bg-transparent p-1.5 transition-colors focus-within:border-ring',
                  attendeeError && 'border-destructive'
                )}
              >
                <AnimatePresence initial={false}>
                  {attendees.map((email) => (
                    <motion.span
                      key={email}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.14 }}
                    >
                      <Badge
                        variant="secondary"
                        size="md"
                        className="gap-1 pr-1"
                      >
                        {email}
                        <button
                          type="button"
                          aria-label={`Remove ${email}`}
                          onClick={() => removeAttendee(email)}
                          className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </motion.span>
                  ))}
                </AnimatePresence>
                <input
                  id="meeting-attendees"
                  type="email"
                  value={attendeeDraft}
                  onChange={(e) => {
                    setAttendeeDraft(e.target.value);
                    if (attendeeError) setAttendeeError(null);
                  }}
                  onKeyDown={handleAttendeeKeyDown}
                  onBlur={() =>
                    attendeeDraft.trim() && commitAttendees(attendeeDraft)
                  }
                  placeholder={
                    attendees.length ? 'Add another…' : 'name@example.com'
                  }
                  className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              {attendeeError ? (
                <p className="text-xs text-destructive">{attendeeError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Press Enter or comma to add. Everyone gets an email invite.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                placeholder="Agenda, links, or anything guests should know"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="min-h-20"
              />
            </div>

            {/* Google Meet toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Video className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <Label htmlFor="meeting-add-meet" className="font-medium">
                    Add Google Meet
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Attach a video link to the invite.
                  </p>
                </div>
              </div>
              <Switch
                id="meeting-add-meet"
                checked={form.addMeet}
                onCheckedChange={(v) => update('addMeet', v)}
              />
            </div>

            {submitError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {submitError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={phase === 'submitting'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit && phase !== 'submitting'}
                className="gap-2"
              >
                {phase === 'submitting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {attendees.length > 0
                      ? 'Create & send invites'
                      : 'Create meeting'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {phase === 'success' && result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 py-2"
          >
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              >
                <Check className="h-6 w-6" />
              </motion.span>
              <p className="text-base font-semibold">
                {form.title.trim() || 'Meeting'} is scheduled
              </p>
              <p className="text-sm text-muted-foreground">
                {result.invitesSent > 0
                  ? `Invites sent to ${result.invitesSent} ${
                      result.invitesSent === 1 ? 'person' : 'people'
                    }.`
                  : 'The event was added to your Google Calendar.'}
              </p>
            </div>

            {result.hangoutLink && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" />
                  Google Meet link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={result.hangoutLink}
                    onFocus={(e) => e.currentTarget.select()}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyMeetLink}
                    className="shrink-0 gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              {result.htmlLink && (
                <Button variant="outline" asChild className="gap-1.5">
                  <a
                    href={result.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Google Calendar
                  </a>
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
