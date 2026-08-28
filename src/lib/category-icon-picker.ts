// Import the plain data module directly rather than "lucide-react/dynamic" —
// that entry point also bundles the client-only DynamicIcon component, and
// pulling it into this server-only file (imported from a "use server"
// action) makes Next's server/client boundary handling mangle the iconNames
// export into something without a working .includes at runtime.
import dynamicIconImports from "lucide-react/dynamicIconImports";

const ICON_NAMES = new Set(Object.keys(dynamicIconImports));

// Server-side only (uses the full 2000+ icon dynamic-import registry).
// Auto-assigns a Lucide icon to a category at creation time, so admins never
// have to hand-pick one — the "automation" mentioned when the admin tooling
// was scoped. Matches on keywords in the category name/slug against a
// curated dictionary of local-service terms, falling back to a generic
// storefront icon when nothing matches.
//
// Stored value is the icon's kebab-case Lucide name (e.g. "wrench"), valid
// input to <DynamicIcon name=.../> from "lucide-react/dynamic". Any name
// picked here is verified against the real icon set before being returned,
// so a bad keyword mapping can never produce a broken icon.

const KEYWORD_ICONS: [pattern: RegExp, icon: string][] = [
  [/tiffin|catering|caterer|meal|food\s*delivery|lunch/, "utensils-crossed"],
  [/restaurant|cafe|dhaba|eatery/, "utensils"],
  [/bakery|baker|cake/, "cake"],
  [/clean(ing|er)?|maid|housekeep/, "sparkles"],
  [/laundry|dry\s*clean|iron(ing)?/, "shirt"],
  [/tailor|stitch|boutique|garment/, "scissors"],
  [/electric(ian)?|wiring/, "zap"],
  [/plumb(er|ing)?|pipe|tap\s*repair/, "wrench"],
  [/carpenter|furniture|woodwork/, "hammer"],
  [/paint(er|ing)?/, "paintbrush"],
  [/welder|welding|metal\s*work/, "flame"],
  [/mason|construction|contractor|builder/, "hard-hat"],
  [/roof/, "home"],
  [/pest\s*control|termite|fumigation/, "bug"],
  [/lock\s*smith|key\s*maker/, "key-round"],
  [/tuition|coaching|tutor|classes/, "graduation-cap"],
  [/school|academy|education/, "book-open"],
  [/music|singing|instrument/, "music"],
  [/dance/, "drama"],
  [/driving\s*school|driving\s*instructor/, "car-front"],
  [/car\s*(repair|service|wash|detailing)|auto\s*(repair|garage)|mechanic/, "car"],
  [/bike\s*(repair|service)|two\s*wheeler|scooter\s*repair/, "bike"],
  [/salon|barber|hair(dresser|cut|stylist)?/, "scissors"],
  [/spa|massage/, "flower-2"],
  [/beauty|makeup|mehendi|henna|nail/, "sparkles"],
  [/gym|fitness|workout|trainer/, "dumbbell"],
  [/yoga/, "flower"],
  [/doctor|clinic|physician|medical/, "stethoscope"],
  [/dentist|dental/, "smile"],
  [/pharmacy|chemist|medicine|pill/, "pill"],
  [/vet(erinary)?|pet\s*(groom|care|shop)|animal/, "dog"],
  [/photograph(er|y)|videograph/, "camera"],
  [/event|wedding\s*plann|decorat/, "party-popper"],
  [/florist|flower\s*shop|nursery|garden(er|ing)?|landscap/, "flower-2"],
  [/computer\s*repair|laptop\s*repair|it\s*support/, "laptop"],
  [/mobile\s*repair|phone\s*repair/, "smartphone"],
  [/appliance\s*repair|ac\s*repair|air\s*condition|refrigerator\s*repair/, "wrench"],
  [/grocery|kirana|general\s*store|supermarket/, "shopping-cart"],
  [/courier|packers?\s*(and|&)?\s*movers?|logistics|delivery/, "truck"],
  [/security\s*(guard|service)/, "shield"],
  [/law(yer)?|legal|advocate/, "scale"],
  [/account(ant|ing)|tax|ca\b/, "calculator"],
  [/real\s*estate|property|broker/, "building-2"],
  [/printing|print\s*shop|xerox/, "printer"],
  [/photo\s*studio|studio/, "camera"],
  [/insurance|agent/, "shield-check"],
  [/travel|tour|agency/, "plane"],
  [/tattoo|piercing/, "syringe"],
];

const DEFAULT_ICON = "store";

export function pickCategoryIcon(name: string): string {
  const norm = name.toLowerCase();
  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(norm) && ICON_NAMES.has(icon)) {
      return icon;
    }
  }
  return DEFAULT_ICON;
}
