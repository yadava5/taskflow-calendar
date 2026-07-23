import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useSettingsStore, type DateDisplayMode } from '@/stores/settingsStore';

/**
 * Preferences — real, persisted display preferences that apply across the app.
 * Currently surfaces the global Date Display mode, which drives how due dates
 * render on tasks and in the event dialog (relative vs. absolute).
 */
export function PreferencesSettings() {
  const dateDisplayMode = useSettingsStore((s) => s.dateDisplayMode);
  const setDateDisplayMode = useSettingsStore((s) => s.setDateDisplayMode);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>
            Control how dates are presented across tasks and the calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label htmlFor="date-display-mode">Date Display</Label>
              <p className="text-sm text-muted-foreground">
                Show due dates relative to now (e.g. “yesterday”, “tomorrow at
                1&nbsp;PM”) or as an absolute calendar date (e.g. “07/24/2026”).
              </p>
            </div>
            <div className="min-w-40 shrink-0">
              <Select
                value={dateDisplayMode}
                onValueChange={(v) => setDateDisplayMode(v as DateDisplayMode)}
              >
                <SelectTrigger id="date-display-mode" className="w-full">
                  <SelectValue placeholder="Select date display" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relative">Relative</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
