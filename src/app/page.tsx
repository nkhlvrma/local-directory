import Image from "next/image";
import { Container } from "@/components/ui/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CITY_SLUG } from "@/lib/site";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { LocationBar } from "@/components/LocationBar";
import { SearchBar } from "@/components/SearchBar";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import Typewriter from "@/components/fancy/text/typewriter";

// Matches the header's rendered height (Container py-3 + the size="icon"
// theme toggle button, 36px) so the hero image tucks in behind the
// transparent header instead of leaving a gap.
const HEADER_HEIGHT = 60;

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
      <div className="relative" style={{ marginTop: -HEADER_HEIGHT }}>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/hero-street.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover blur-[2px] scale-105"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <Container
          className="pt-12 pb-10"
          style={{ paddingTop: HEADER_HEIGHT + 48 }}
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-5 hero-in" style={{ animationDelay: "0ms" }}>
            <LocationBar />
          </div>
          <h1
            className="hero-in text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] font-heading text-balance text-white"
            style={{ animationDelay: "60ms" }}
          >
            Find trusted<br />
            <Typewriter
              as="span"
              text={["locals", "businesses", "services"]}
              speed={65}
              deleteSpeed={35}
              waitTime={1800}
              className="text-primary"
              cursorClassName="text-white/50"
            />
            .
          </h1>
          <p
            className="hero-in mt-4 text-lg text-white/80 max-w-xl leading-relaxed text-pretty"
            style={{ animationDelay: "120ms" }}
          >
            Find community-verified local services and chat with them directly on WhatsApp.
          </p>
          <div className="hero-in mt-8 w-full max-w-xl" style={{ animationDelay: "180ms" }}>
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
