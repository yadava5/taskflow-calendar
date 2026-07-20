import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  BarChart3,
} from 'lucide-react';
import { useInsightsStore } from '@/stores/insightsStore';
import { format } from 'date-fns';
import type FullCalendar from '@fullcalendar/react';
import { Button } from '@/components/ui/Button';
import { SmoothSidebarTrigger } from '@/components/layout/SmoothSidebarTrigger';
import { ViewSwitcher } from '@/components/ui/ViewSwitcher';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { useCalendars } from '@/hooks/useCalendars';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { toLocal, parseLocalDate } from '@/utils/date';
import {
  type CalendarFilterState,
  EMPTY_CALENDAR_FILTERS,
  activeFilterCount,
} from './calendarFilters';

/**
 * Calendar view types
 */
export type CalendarViewType =
  | 'dayGridMonth'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek';

export type { CalendarFilterState } from './calendarFilters';

export interface ConsolidatedCalendarHeaderProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  onCreateEvent: () => void;
  className?: string;
  calendarRef?: React.RefObject<FullCalendar | null>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: CalendarFilterState;
  onFiltersChange?: (filters: CalendarFilterState) => void;
}

// Define view options outside component to avoid recreating on every render
const VIEW_OPTIONS = [
  { value: 'dayGridMonth' as const, label: 'Month', shortLabel: 'M' },
  { value: 'timeGridWeek' as const, label: 'Week', shortLabel: 'W' },
  { value: 'timeGridDay' as const, label: 'Day', shortLabel: 'D' },
  { value: 'listWeek' as const, label: 'List', shortLabel: 'L' },
];

/**
 * CalendarViewSwitcher - Uses shared ViewSwitcher component
 */
interface CalendarViewSwitcherProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

const CalendarViewSwitcher: React.FC<CalendarViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <ViewSwitcher
      value={currentView}
      onChange={onViewChange}
      options={VIEW_OPTIONS}
    />
  );
};

/**
 * Animated Search Component for Calendar with Keyboard Shortcuts
 */
interface AnimatedSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const AnimatedSearch: React.FC<AnimatedSearchProps> = ({ value, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcutsEnabled = useSettingsStore((s) => s.keyboardShortcutsEnabled);

  // Cmd/Ctrl+F to focus search — governed by the keyboard-shortcuts setting.
  useEffect(() => {
    if (!shortcutsEnabled) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        handleSearchClick();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [shortcutsEnabled]);

  const handleSearchClick = () => {
    setIsExpanded(true);
    // Focus input after animation completes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
  };

  const handleClose = () => {
    setIsExpanded(false);
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Plain CSS width/opacity transition on an always-mounted wrapper, rather
  // than an AnimatePresence-driven mount/exit. The input needs to stay
  // interactive (typed value, focus) for the whole time it's open, and a
  // Framer Motion enter/exit pair re-evaluating on every keystroke (each
  // change re-renders this component) proved unreliable — the wrapper could
  // get stuck rendered at its `initial`/`exit` keyframe (width 0, opacity 0)
  // while the input itself stayed mounted and focused, making the box
  // disappear the moment the user started typing. A CSS transition on
  // static width classes has no such state machine to desync.
  return (
    <div className="relative">
      <div className="flex items-center">
        {/* Search Icon/Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0"
          onClick={isExpanded ? undefined : handleSearchClick}
          title={isExpanded ? undefined : 'Search events (Ctrl+F)'}
          aria-label={isExpanded ? undefined : 'Open search input'}
          aria-expanded={isExpanded}
        >
          <Search className="w-3.5 h-3.5" />
        </Button>

        {/* Expandable Search Input */}
        <div
          className={cn(
            'relative overflow-hidden transition-[width,opacity] duration-[250ms] ease-out',
            isExpanded
              ? 'w-[200px] opacity-100'
              : 'w-0 opacity-0 pointer-events-none'
          )}
          role="search"
          aria-label="Event search"
          aria-hidden={!isExpanded}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search events..."
            tabIndex={isExpanded ? 0 : -1}
            className="w-[200px] h-7 px-3 pr-8 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-0 focus:border-border focus-visible:ring-0 focus-visible:outline-none"
            aria-label="Search events by title or content"
            aria-describedby="search-help"
          />
          {/* Screen reader helper text */}
          <div id="search-help" className="sr-only">
            Press Escape to close search, or use Ctrl+F to open
          </div>
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-0.5 h-6 w-6 p-0"
            onClick={handleClose}
            title="Close search (Escape)"
            aria-label="Close search input"
            tabIndex={isExpanded ? 0 : -1}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * CalendarToolbar component with navigation and action buttons
 */
interface CalendarToolbarProps {
  onPrevClick: () => void;
  onNextClick: () => void;
  onCreateEvent: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: CalendarFilterState;
  onFiltersChange?: (filters: CalendarFilterState) => void;
}

/**
 * Real filter popover: narrow the calendar by calendar name(s), all-day-only,
 * and an optional date range. Shows an active-filter count badge and a
 * "Clear filters" action. Replaces the old permanently-disabled button.
 */
const CalendarFilterPopover: React.FC<{
  filters: CalendarFilterState;
  onFiltersChange: (filters: CalendarFilterState) => void;
}> = ({ filters, onFiltersChange }) => {
  const count = activeFilterCount(filters);

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-auto min-w-7 gap-1 px-1.5"
              aria-label="Filter events"
            >
              <Filter className="w-3.5 h-3.5" />
              {count > 0 && (
                <span
                  className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
                  aria-label={`${count} active filters`}
                >
                  {count}
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Filter events</p>
        </TooltipContent>
      </Tooltip>
      {/* Radix only mounts PopoverContent (and its useCalendars query) when
          open, so the header itself needs no QueryClient just to render. */}
      <PopoverContent align="end" className="w-72 space-y-4">
        <CalendarFilterBody
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </PopoverContent>
    </Popover>
  );
};

const CalendarFilterBody: React.FC<{
  filters: CalendarFilterState;
  onFiltersChange: (filters: CalendarFilterState) => void;
}> = ({ filters, onFiltersChange }) => {
  const { data: calendars = [] } = useCalendars();
  const allNames = React.useMemo(
    () => calendars.filter((c) => c.visible).map((c) => c.name),
    [calendars]
  );
  // The effective selection: `undefined` means every visible calendar.
  const selected = filters.calendarNames ?? allNames;
  const count = activeFilterCount(filters);

  const toggleCalendar = (name: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selected, name]))
      : selected.filter((n) => n !== name);
    // Collapse "everything selected" back to `undefined` (no narrowing).
    const isAll =
      next.length === allNames.length &&
      allNames.every((n) => next.includes(n));
    onFiltersChange({ ...filters, calendarNames: isAll ? undefined : next });
  };

  const setStart = (value: string) =>
    onFiltersChange({
      ...filters,
      startDate: value ? parseLocalDate(value) : undefined,
    });
  const setEnd = (value: string) =>
    onFiltersChange({
      ...filters,
      endDate: value ? parseLocalDate(value) : undefined,
    });

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Filter events</span>
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onFiltersChange(EMPTY_CALENDAR_FILTERS)}
          >
            Clear filters
          </Button>
        )}
      </div>

      {allNames.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Calendars</p>
          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {allNames.map((name) => {
              const cal = calendars.find((c) => c.name === name);
              return (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={selected.includes(name)}
                    onCheckedChange={(v) => toggleCalendar(name, v === true)}
                    aria-label={name}
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cal?.color || 'var(--primary)' }}
                  />
                  <span className="truncate">{name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="filter-all-day" className="text-sm">
          All-day events only
        </Label>
        <Switch
          id="filter-all-day"
          checked={filters.allDayOnly}
          onCheckedChange={(on) =>
            onFiltersChange({ ...filters, allDayOnly: on })
          }
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Date range</p>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Filter start date"
            value={
              filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''
            }
            max={
              filters.endDate
                ? format(filters.endDate, 'yyyy-MM-dd')
                : undefined
            }
            onChange={(e) => setStart(e.target.value)}
            className="h-8 text-xs"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="date"
            aria-label="Filter end date"
            value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
            min={
              filters.startDate
                ? format(filters.startDate, 'yyyy-MM-dd')
                : undefined
            }
            onChange={(e) => setEnd(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </>
  );
};

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  onPrevClick,
  onNextClick,
  onCreateEvent,
  searchValue = '',
  onSearchChange,
  filters = EMPTY_CALENDAR_FILTERS,
  onFiltersChange,
}) => {
  const openInsights = useInsightsStore((s) => s.setOpen);
  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-md p-1">
      {/* Animated Search */}
      <AnimatedSearch
        value={searchValue}
        onChange={onSearchChange || (() => {})}
      />

      {/* Insights — "Where your week goes" */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => openInsights(true)}
            aria-label="Where your week goes"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Where your week goes</p>
        </TooltipContent>
      </Tooltip>

      {/* Filter popover — calendar names, all-day, and date range */}
      <CalendarFilterPopover
        filters={filters}
        onFiltersChange={onFiltersChange || (() => {})}
      />

      {/* Back Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevClick}
            aria-label="Previous period"
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Previous period</p>
        </TooltipContent>
      </Tooltip>

      {/* Forward Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNextClick}
            aria-label="Next period"
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Next period</p>
        </TooltipContent>
      </Tooltip>

      {/* New Event Plus Button with glisten effect */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onCreateEvent}
            size="sm"
            className={cn(
              'h-7 w-7 p-0 relative overflow-hidden transition-all duration-300 ease-out',
              // Base secondary color with subtle diagonal gradient
              'bg-gradient-to-br from-secondary/98 via-secondary to-secondary/95',
              'text-secondary-foreground shadow-xs border border-border/20',
              // Hover effects - subtle scaling and enhanced gradient
              'hover:scale-105 hover:shadow-lg hover:shadow-secondary/20',
              'hover:from-secondary/95 hover:via-secondary/98 hover:to-secondary/90',
              // Enhanced shimmer effect for visibility
              'before:absolute before:inset-0 before:bg-gradient-to-r',
              'before:from-transparent before:via-black/15 before:to-transparent',
              'dark:before:via-white/15',
              'before:translate-x-[-150%] before:skew-x-12 before:transition-transform before:duration-[480ms]',
              'hover:before:translate-x-[150%]',
              // Active state
              'active:scale-[1.02] active:shadow-md'
            )}
            aria-label="New Event"
          >
            <Plus className="h-3.5 w-3.5 relative z-10" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New Event</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

/**
 * Get the calendar title based on current view and date
 */
const getCalendarTitle = (
  currentView: CalendarViewType,
  calendarRef?: React.RefObject<FullCalendar | null>,
  fallbackDate?: Date
): string => {
  let currentDate = fallbackDate || new Date();

  // Try to get the current date from the calendar API
  if (calendarRef?.current) {
    try {
      const calendarApi = calendarRef.current.getApi();
      if (calendarApi) {
        currentDate = calendarApi.getDate();
      }
    } catch {
      // Fallback to current date
      currentDate = new Date();
    }
  }

  const localDate = toLocal(currentDate);

  switch (currentView) {
    case 'dayGridMonth':
      return format(localDate, 'MMMM yyyy');
    case 'timeGridWeek':
      return format(localDate, 'MMMM yyyy');
    case 'timeGridDay':
      return format(localDate, 'MMMM d, yyyy');
    case 'listWeek':
      return format(localDate, 'MMMM d, yyyy');
    default:
      return format(localDate, 'MMMM yyyy');
  }
};

/**
 * Check if today button should be disabled/grayed
 */
const isTodayDisabled = (
  currentView: CalendarViewType,
  calendarRef?: React.RefObject<FullCalendar | null>
): boolean => {
  if (!calendarRef?.current) return false;

  try {
    const calendarApi = calendarRef.current.getApi();
    if (!calendarApi) return false;

    const currentDate = calendarApi.getDate();
    const today = new Date();

    switch (currentView) {
      case 'dayGridMonth': {
        return format(currentDate, 'yyyy-MM') === format(today, 'yyyy-MM');
      }
      case 'timeGridWeek': {
        // Check if today is in the current week view
        const weekStart = calendarApi.view.activeStart;
        const weekEnd = calendarApi.view.activeEnd;
        return today >= weekStart && today < weekEnd;
      }
      case 'timeGridDay': {
        return (
          format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        );
      }
      case 'listWeek': {
        const weekStart = calendarApi.view.activeStart;
        const weekEnd = calendarApi.view.activeEnd;
        return today >= weekStart && today < weekEnd;
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
};

/**
 * ConsolidatedCalendarHeader component that combines sidebar toggle, title, navigation, view switcher, and new event button
 */
export const ConsolidatedCalendarHeader: React.FC<
  ConsolidatedCalendarHeaderProps
> = ({
  currentView,
  onViewChange,
  onTodayClick,
  onPrevClick,
  onNextClick,
  onCreateEvent,
  className,
  calendarRef,
  searchValue = '',
  onSearchChange,
  filters,
  onFiltersChange,
}) => {
  const [calendarTitle, setCalendarTitle] = useState(() =>
    getCalendarTitle(currentView, calendarRef)
  );
  const [todayDisabled, setTodayDisabled] = useState(() =>
    isTodayDisabled(currentView, calendarRef)
  );

  // Update title and today button state when view or calendar changes
  useEffect(() => {
    const updateTitle = () => {
      setCalendarTitle(getCalendarTitle(currentView, calendarRef));
      setTodayDisabled(isTodayDisabled(currentView, calendarRef));
    };

    updateTitle();

    // Listen for calendar date changes via FullCalendar API
    const calendarApi = calendarRef?.current?.getApi();
    if (calendarApi) {
      const handleDateChange = () => {
        // Use a small timeout to ensure FullCalendar has updated
        setTimeout(updateTitle, 10);
      };

      // Listen for view changes and date navigation
      calendarApi.on('datesSet', handleDateChange);

      return () => {
        calendarApi.off('datesSet', handleDateChange);
      };
    }
  }, [currentView, calendarRef]);

  return (
    <div
      className={cn(
        'flex-shrink-0 p-4 border-b border-border bg-background',
        'transition-all duration-200 ease-out',
        className
      )}
    >
      {/* Three-section layout: Left, Center, Right. Below `sm` the three
          sections stack instead of sharing one grid row — at 375px the
          right section alone (Today + the six toolbar icons) needs ~280px,
          which left no room for the title or view switcher in a single
          `grid-cols-[1fr_auto_1fr]` row: the title wrapped onto three lines
          fighting for its slice, and the entire right section (search,
          insights, filter, prev/next, new-event) silently overflowed past
          the viewport with no scroll affordance — unreachable, not just
          ugly. Stacking gives every section the full row width it needs. */}
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
        {/* Left Section: Sidebar trigger and title */}
        <div className="flex items-center gap-3 flex-shrink-0 sm:justify-self-start">
          <SmoothSidebarTrigger position="rightPane" />
          <h2 className="text-lg font-semibold text-foreground">
            {calendarTitle.includes(' ') ? (
              <>
                <span className="font-bold">{calendarTitle.split(' ')[0]}</span>
                <span className="font-normal">
                  {' '}
                  {calendarTitle.split(' ').slice(1).join(' ')}
                </span>
              </>
            ) : (
              calendarTitle
            )}
          </h2>
        </div>

        {/* Center Section: View Switcher (dead center of header) */}
        <div className="sm:justify-self-center">
          <CalendarViewSwitcher
            currentView={currentView}
            onViewChange={onViewChange}
          />
        </div>

        {/* Right Section: Today Button and Toolbar */}
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:justify-self-end">
          {/* Today Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onTodayClick}
            disabled={todayDisabled}
            className={cn(
              'font-medium transition-all duration-200',
              todayDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            Today
          </Button>

          {/* Calendar Toolbar */}
          <CalendarToolbar
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            onCreateEvent={onCreateEvent}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      </div>
    </div>
  );
};
