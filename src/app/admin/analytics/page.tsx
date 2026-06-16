import { Activity, BarChart3, Clock, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_EVENT_TYPES, type AppEventType } from "@/lib/analytics/events";
import { fetchAppEventSummary } from "@/lib/analytics/queries";
import { requireViewer } from "@/lib/auth/require-viewer";
import { cn, toTitleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SUMMARY_DAYS = 14;

function eventLabel(eventType: AppEventType) {
  return toTitleCase(eventType.replaceAll("_", " ").toLowerCase());
}

function formatLatestEvent(value: string | null) {
  if (!value) {
    return "No events yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminAnalyticsPage() {
  const viewer = await requireViewer();

  if (viewer.profile?.role !== "ADMIN") {
    notFound();
  }

  const summary = await fetchAppEventSummary(SUMMARY_DAYS);
  const totalEvents = summary.reduce((total, row) => total + row.event_count, 0);
  const eventsByType = APP_EVENT_TYPES.map((eventType) => {
    const rows = summary.filter((row) => row.event_type === eventType);
    const eventCount = rows.reduce((total, row) => total + row.event_count, 0);
    const latestEventAt =
      rows
        .map((row) => row.latest_event_at)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null;

    return { eventCount, eventType, latestEventAt, rows };
  });

  return (
    <AppShell viewer={viewer}>
      <section className="space-y-2">
        <Badge variant="outline">Admin only</Badge>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BarChart3 className="size-6 text-primary" />
          Beta analytics
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Privacy-light counters for the last {SUMMARY_DAYS} days. These events
          do not store names, messages, question text, emails, IPs, Tokens, or
          payout data.
        </p>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Activity className="size-5" />
            </span>
            <CardTitle>{totalEvents}</CardTitle>
            <CardDescription>Total tracked beta events</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <CardTitle>Safe by design</CardTitle>
            <CardDescription>
              Only aggregate action counts are shown here. Gameplay content stays
              out of analytics.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-5 space-y-3">
        {eventsByType.map(({ eventCount, eventType, latestEventAt, rows }) => (
          <Card
            className={cn(eventCount === 0 && "border-dashed opacity-75")}
            key={eventType}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{eventLabel(eventType)}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Latest: {formatLatestEvent(latestEventAt)}
                  </CardDescription>
                </div>
                <Badge variant={eventCount > 0 ? "default" : "secondary"}>
                  {eventCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {rows.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {["ACCOUNT", "GUEST", "UNKNOWN"].map((actorKind) => {
                    const row = rows.find((item) => item.actor_kind === actorKind);

                    return (
                      <div className="rounded-xl bg-muted p-3" key={actorKind}>
                        <p className="font-semibold">{row?.event_count ?? 0}</p>
                        <p className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                          {actorKind.toLowerCase()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No events recorded for this action yet.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
