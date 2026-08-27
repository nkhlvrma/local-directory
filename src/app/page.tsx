import Link from "next/link";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { ListingCard } from "@/components/ListingCard";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { isValidPin } from "@/lib/pin";
import type { WeekHours } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const pin = (await cookies()).get("pin")?.value ?? "";
  const pinFilter = isValidPin(pin) ? pin : null;

  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  if (!city) {
    return (
      <Container className="py-16">
        <h1 className="text-2xl font-semibold">Setup incomplete</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No active city found for slug <code>{CITY_SLUG}</code>. Run the
          Supabase schema and set <code>NEXT_PUBLIC_CITY_SLUG</code>.
        </p>
      </Container>
    );
  }

  const [{ data: categories }, { data: neighborhoods }, nearbyRes] =
    await Promise.all([
      supabase.from("categories").select("name, slug, icon").order("name"),
      supabase
        .from("neighborhoods")
        .select("name, slug")
        .eq("city_id", (city as { id: string }).id)
        .order("name"),
      pinFilter
        ? supabase
            .from("listings")
            .select(
              `id, name, slug, description, verified, pin_code, photo_url, hours_json,
               neighborhoods!inner ( name, slug ),
               categories!inner ( name, slug )`,
            )
            .eq("status", "approved")
            .eq("pin_code", pinFilter)
            .order("name")
            .limit(20)
        : Promise.resolve({ data: null }),
    ]);

  type Nearby = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    verified: boolean;
    pin_code: string | null;
    photo_url: string | null;
    hours_json: WeekHours | null;
    neighborhoods: { name: string; slug: string };
    categories: { name: string; slug: string };
  };
  const nearby = (nearbyRes.data ?? []) as unknown as Nearby[];
  const cats = (categories ?? []) as { slug: string; name: string; icon: string | null }[];
  const hoods = (neighborhoods ?? []) as { slug: string; name: string }[];

  return (
    <Container className="py-8 space-y-10">
      <section>
        <h1 className="text-4xl font-bold tracking-tight">
          Find someone nearby.
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Every listing is verified. Tap to chat on WhatsApp — no forms, no
          call-backs.
        </p>
        <div className="mt-6">
          <SearchBar size="lg" />
        </div>
      </section>

      {pinFilter ? (
        nearby.length > 0 ? (
          <section>
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-lg font-semibold">Near PIN</h2>
              <Badge className="bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200">
                {pinFilter}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {nearby.map((l) => (
                <ListingCard
                  key={l.id}
                  href={`/${(city as { slug: string }).slug}/${l.neighborhoods.slug}/${l.categories.slug}/${l.slug}`}
                  name={l.name}
                  category={l.categories.name}
                  neighborhood={l.neighborhoods.name}
                  description={l.description}
                  verified={l.verified}
                  pin={l.pin_code}
                  photo_url={l.photo_url}
                  hours={l.hours_json}
                />
              ))}
            </div>
          </section>
        ) : (
          <Alert>
            <AlertDescription>
              No listings yet at PIN {pinFilter}. Browse by category below.
            </AlertDescription>
          </Alert>
        )
      ) : null}

      <RecentlyViewed />

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Browse by category
        </h2>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {cats.map((c) => (
            <CategoryCard
              key={c.slug}
              slug={c.slug}
              name={c.name}
              href={`/${(city as { slug: string }).slug}/c/${c.slug}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Browse by neighborhood
        </h2>
        <div className="flex gap-2 flex-wrap">
          {hoods.map((n) => (
            <Link
              key={n.slug}
              href={`/${(city as { slug: string }).slug}/n/${n.slug}`}
            >
              <Badge variant="secondary" className="cursor-pointer">
                {n.name}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
