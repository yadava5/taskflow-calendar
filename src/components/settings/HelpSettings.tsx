import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Bug, Github, BookOpen } from 'lucide-react';

// The project's real, public destinations. Keep these in sync with the repo.
const REPO_URL = 'https://github.com/yadava5/cadence';

export function HelpSettings() {
  const helpItems = [
    {
      title: 'System Card',
      description:
        'How Cadence works, end to end — the parser, the stack, the guarantees',
      icon: BookOpen,
      action: 'Open',
      href: '/system-card',
    },
    {
      title: 'Source Code',
      description: 'Browse the full source on GitHub',
      icon: Github,
      action: 'View Repo',
      href: REPO_URL,
    },
    {
      title: 'Report an Issue',
      description: 'Found a bug or have a request? Open an issue',
      icon: Bug,
      action: 'Open Issues',
      href: `${REPO_URL}/issues`,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>
            Learn how Cadence works, read the source, or report an issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {helpItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="p-2 bg-muted rounded-md shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      window.open(item.href, '_blank', 'noopener,noreferrer')
                    }
                  >
                    {item.action}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
          <CardDescription>Version and system information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <span>{import.meta.env.DEV ? 'Development' : 'Production'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
