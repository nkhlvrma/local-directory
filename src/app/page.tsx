import { Container } from "@/components/ui/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { LocationBar } from "@/components/LocationBar";
import { SearchBar } from "@/components/SearchBar";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import Typewriter from "@/components/fancy/text/typewriter";

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
