import { Container } from "@/components/ui/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { LocationBar } from "@/components/LocationBar";
import { SearchBar } from "@/components/SearchBar";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ListingGridCard } from "@/components/ListingGridCard";
import Typewriter from "@/components/fancy/text/typewriter";
import type { WeekHours } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("slug", CITY_SLUG)
    .maybeSingle();

  if (!city) {
    return (
      <Container className="py-16">
        <h1 className="text-2xl font-semibold font-heading">Setup incomplete</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No active city found for slug <code>{CITY_SLUG}</code>. Run the
          Supabase schema and set <code>NEXT_PUBLIC_CITY_SLUG</code>.
        </p>
      </Container>
    );
  }

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
      supabase.from("categories").select("name, slug, icon").order("name"),
      supabase
        .from("neighborhoods")
        .select("name, slug")
        .eq("city_id", (city as { id: string }).id)
        .order("name"),
    ]);
  const cats = (categories ?? []) as { slug: string; name: string; icon: string | null }[];
  const hoods = (neighborhoods ?? []) as { slug: string; name: string }[];

  const { data: popularRaw } = await supabase
    .from("listings")
    .select(
      `id, name, slug, description, verified, pin_code, photo_url, hours_json,
       neighborhoods!inner ( name, slug, city_id ),
       categories!inner ( name, slug )`,
    )
    .eq("status", "approved")
    .eq("neighborhoods.city_id", (city as { id: string }).id)
    .order("whatsapp_clicks", { ascending: false })
    .limit(6);
  type PopularRow = {
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
  const popular = (popularRaw ?? []) as unknown as PopularRow[];

  return (
    <>
      {/* Hero */}
      <div>
        <Container className="pt-12 pb-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-5">
            <LocationBar />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] font-heading text-balance">
            Find trusted<br />
            <Typewriter
              as="span"
              text={["locals", "businesses", "services"]}
              speed={65}
              deleteSpeed={35}
              waitTime={1800}
              className="text-primary"
              cursorClassName="text-foreground/50"
            />
            .
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed text-pretty">
            Find community-verified local services and chat with them directly on WhatsApp.
          </p>
          <div className="mt-8 w-full max-w-xl">
            <SearchBar size="lg" />
          </div>
          </div>
        </Container>
      </div>

      <Container className="py-10 space-y-12">
        <RecentlyViewed />

        {/* Popular */}
        {popular.length > 0 ? (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Popular in {(city as { name: string }).name}
            </h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {popular.map((l) => (
                <ListingGridCard
                  key={l.id}
                  id={l.id}
                  href={`/${(city as { slug: string }).slug}/${l.neighborhoods.slug}/${l.categories.slug}/${l.slug}`}
                  name={l.name}
                  categorySlug={l.categories.slug}
                  subtitle={l.categories.name}
                  description={l.description}
                  verified={l.verified}
                  pin={l.pin_code}
                  photo_url={l.photo_url}
                  hours={l.hours_json}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Categories */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Browse by category
          </h2>
          <CategoryCarousel
            categories={cats.map((c) => ({
              ...c,
              href: `/${(city as { slug: string }).slug}/c/${c.slug}`,
            }))}
          />
        </section>

        <NeighborhoodMap
          citySlug={(city as { slug: string }).slug}
          cityName={(city as { name: string }).name}
          neighborhoods={hoods}
        />

      </Container>
    </>
  );
}
