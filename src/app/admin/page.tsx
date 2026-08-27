import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Inbox,
  BarChart3,
  MessageSquareText,
  Upload,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", (user as { id: string }).id)
    .maybeSingle();

  if (!adminRow) {
    return (
      <Container size="sm" className="py-8">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your account is not in <code>admin_users</code>. Ask an existing admin
          to add you.
        </p>
      </Container>
    );
  }

  const [pendingRes, approvedRes, outreachRes, insightsRes] = await Promise.all([
    supabase.from("listings").select("id").eq("status", "pending"),
    supabase.from("listings").select("id, whatsapp_clicks").eq("status", "approved"),
    supabase.from("outreach_leads").select("id, status"),
    supabase.from("search_events").select("id").eq("matched_count", 0),
  ]);

  const pendingCount = (pendingRes.data ?? []).length;
  const approved = (approvedRes.data ?? []) as { whatsapp_clicks: number }[];
  const approvedCount = approved.length;
  const totalTaps = approved.reduce((s, r) => s + (r.whatsapp_clicks ?? 0), 0);
  const outreach = (outreachRes.data ?? []) as { status: string }[];
  const outreachYes = outreach.filter((r) => r.status === "yes").length;
  const outreachOpen = outreach.filter(
    (r) => r.status === "lead" || r.status === "contacted",
  ).length;
  const zeroSearches = (insightsRes.data ?? []).length;

  return (
    <Container className="py-6 sm:py-8 space-y-6 sm:space-y-8">
      <header>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {!process.env.NEXT_PUBLIC_SUPABASE_URL ? (
            <Badge variant="secondary">demo</Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Everything you do here changes what your public site shows.
        </p>
      </header>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <StatTile
          icon={Inbox}
          label="Awaiting review"
          value={pendingCount}
          hint={pendingCount > 0 ? "Needs your attention" : "All caught up"}
          href="/admin/pending"
        />
        <StatTile
          icon={CheckCircle2}
          label="Live listings"
          value={approvedCount}
          hint="Public on the site"
          href="/admin/leads"
        />
        <StatTile
          icon={BarChart3}
          label="WhatsApp taps"
          value={totalTaps}
          hint="Leads sent"
          href="/admin/leads"
        />
        <StatTile
          icon={MessageSquareText}
          label="Reach-out"
          value={outreachOpen}
          hint={`${outreachYes} said yes`}
          href="/admin/outreach"
        />
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          What next?
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <ActionCard
            icon={Sparkles}
            title="Add real businesses"
            body="Walk your target neighborhood, or scrape a few names from Google Maps. Then message them for permission using Reach out."
            cta="Open reach out"
            href="/admin/outreach"
          />
          <ActionCard
            icon={Upload}
            title="Paste in bulk"
            body="Got 20+ candidates already? Paste tab-separated rows from Google Sheets, review them one by one on Pending."
            cta="Bulk import"
            href="/admin/import"
          />
          {zeroSearches > 0 ? (
            <ActionCard
              icon={BarChart3}
              title={`${zeroSearches} search${zeroSearches === 1 ? "" : "es"} came up empty`}
              body="People are looking for things you don't list yet. Check Insights to see the top gaps."
              cta="See insights"
              href="/admin/insights"
            />
          ) : null}
          <ActionCard
            icon={CheckCircle2}
            title="Approve pending"
            body={
              pendingCount > 0
                ? `${pendingCount} submission${pendingCount === 1 ? "" : "s"} waiting.`
                : "Nothing pending right now."
            }
            cta="Open queue"
            href="/admin/pending"
            muted={pendingCount === 0}
          />
        </div>
      </section>
    </Container>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-3 sm:p-4 hover:bg-muted/50 transition-colors h-full">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" />
          <span className="text-xs truncate">{label}</span>
        </div>
        <div className="mt-1 text-2xl sm:text-3xl font-semibold tabular-nums">
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {hint}
        </div>
      </Card>
    </Link>
  );
}

function ActionCard({
  icon: Icon,
  title,
  body,
  cta,
  href,
  muted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  cta: string;
  href: string;
  muted?: boolean;
}) {
  return (
    <Card className={`p-4 ${muted ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-muted p-2 shrink-0">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium">{title}</div>
          <p className="text-sm text-muted-foreground mt-1">{body}</p>
          <Link href={href}>
            <Button variant="ghost" size="sm" className="mt-2 -ml-2">
              {cta}
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
