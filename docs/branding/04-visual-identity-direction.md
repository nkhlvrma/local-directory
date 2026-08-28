# Visual Identity Direction

Written direction only — no logo files, images, or code. Builds on the existing foundation (warm olive/orange palette, Roboto Slab headings, card-based UI, no gradients/glow, community signal via "Would recommend" counts) rather than replacing it. Intended as a brief a designer (or the founder, working in Canva/Figma) could execute from.

The name is not approved. Use a neutral placeholder in explorations until trademark, domain, handle, and app-store checks are complete.

---

## Wordmark / logo concept directions

### Direction A — Typographic mark, no glyph
The chosen name set in Roboto Slab Bold, with a confident typographic treatment and no decorative dot or map-pin motif. This keeps the logo entirely typeset, scales perfectly, and avoids borrowing the most common visual shorthand in local search.
- Best fit if the founder wants something they can finalize themselves today, in a text editor, with zero design tooling.
- Risk: without the colored detail, a pure wordmark can feel undifferentiated next to other slab-serif local brands. The colored dot (or equivalent single accent) is doing real work — don't drop it for a "cleaner" all-black version.

### Direction B — Wordmark + simple neighborhood glyph
A small glyph sits to the left of the wordmark: not a map pin (every hyperlocal app uses a pin — it's the most overused symbol in this category and won't differentiate Karib from Nukkad Shops, Chauraha, or any Google Maps–adjacent product), but something more specific to *reachability* and *conversation* — for example, two small overlapping speech-bubble-like rounded shapes, or a simple abstracted doorway/threshold shape (a doorway reads as "a place you can actually walk up to and be let in," which maps directly to the reachability promise). Rendered as a simple single-color filled shape, no gradients, no 3D, consistent with the existing no-gradient rule.
- Best fit for app icon and favicon contexts, where a wordmark alone doesn't read at small sizes.
- Risk: a custom glyph needs actual design execution to look intentional rather than like clip art — don't ship a rough version; better to launch with Direction A and add a glyph later once there's budget for a designer to draw it properly.

### Direction C — Monogram badge
A single letter or two (e.g. "K" for Karib) inside a rounded-square or circular badge shape, filled in the primary olive, with the wordmark set separately alongside it for full-lockup contexts. This is the most "self-generatable" direction — closest to what shadcn/Radix-style products already do for their own default avatars — and pairs naturally with the badge-shaped verification UI described below (the brand mark and the "Verified" badge can share the same rounded-badge geometry, which reinforces "verified-ness" as a visual idea tied to the brand itself).
- Best fit if the visual identity should tie directly into the verification badge system (see below) rather than exist as a separate decorative logo.
- Risk: monograms are generic if the letterform isn't distinctive — needs a confident, slightly custom weight/spacing treatment, not just "K" in default Roboto Slab.

**Recommendation for a solo, low-budget founder right now: start with Direction A.** It's finishable without hiring anyone, it doesn't compete for attention with the map-pin cliché every competitor uses, and it leaves room to add Direction B's glyph later once there's a reason to invest (e.g. commissioning an app icon for app-store submission).

---

## Carrying the warm olive/orange palette into a distinct identity

The instruction from the plan is explicit: don't just keep shadcn defaults, but don't replace the palette either — give it a distinct identity of its own. Concretely:

1. **Name the palette internally.** Give the olive and orange their own names in design documentation (e.g. "Nukkad Olive," "Chowk Orange" — or names tied to real Lucknow references once a name is locked) rather than referring to them as "primary" and "accent." A palette with a name gets treated as brand equity; a palette that's just "the theme colors" gets swapped the next time someone redesigns.
2. **Establish a clear usage hierarchy, not just two colors used interchangeably.** Olive should be the dominant structural color — text accents, active states, category icons, and the Contact checked badge outline. Orange should be reserved for a smaller number of higher-energy moments — a highlighted "Neighbors are asking about" shelf, a subtle hover/focus state, or sparing use in illustration. WhatsApp green remains reserved for contact actions only.
3. **Keep WhatsApp green rigidly scoped.** The plan's rule — WhatsApp green only for contact actions — should extend visually too: it should be the *only* green anywhere in the product. If a designer ever reaches for a green accent, background tint, or icon color for anything other than an actual WhatsApp CTA, that's a violation to catch in review, because green immediately reads as "you can message this now" and using it decoratively would train users to distrust the signal.
4. **Warmth should come from tone, not saturation.** "Warm" doesn't have to mean bright or loud — it can mean slightly desaturated, slightly toward-orange neutrals in backgrounds and card surfaces (paper-like, not stark white or stark black), which is consistent with "no gradients or glow" and an editorial, confident typographic personality rather than a flashy consumer-app one.
5. **No gradients, ever, including in future marketing assets.** This rule should extend past the product UI into anything published under the brand — social graphics, WhatsApp share cards, printed flyers. A gradient sneaking into a Canva-made Instagram post is the most common way a "no gradients" rule quietly erodes.

---

## Typography pairing rationale

The product already uses Roboto Slab for headings (confirmed in `src/app/layout.tsx`) and Inter/Geist for body text. Recommended direction:

- **Keep Roboto Slab for headings.** A slab serif is a deliberate, good choice here: it reads as editorial and confident rather than "generic startup sans-serif," and its sturdiness fits a product whose promise is reliable contact information. It also differentiates Karib from the sea of sans-only competitor apps in this category.
- **Keep Inter (or Geist) for body text and UI.** Slab serifs at small sizes in dense UI (form labels, list rows, badges) get heavy and slow reading down — a clean grotesque sans for body copy is the right pairing, and it's already in place.
- **Give the pairing one more deliberate touch:** use Roboto Slab, not the sans, for the "Contact checked" label and for recommendation counts ("12 would recommend"), even inline in body text. This creates a subtle, consistent cue for trust information without needing a new color or icon.
- **Avoid adding a third typeface.** Two is already the right number for a brand this stage; a third face (e.g. a script or display face "for personality") would work against the "editorial/confident," not "quirky/playful," personality already established.

---

## Visual language for verification / community-signal UI

### Contact checked badge
- Shape: a small rounded-pill badge (already implemented in `src/components/VerifiedBadge.tsx`). This is the right shape to keep — pill badges read as status, not decoration, and it matches the no-gradients rule.
- Icon: keep a simple checkmark, not a shield, seal, or certificate icon. Shields and seals visually imply an authority/certification body that doesn't exist here (the plan is explicit that verification means only "we confirmed the WhatsApp number is reachable") — a checkmark stays honest to that scope. A shield or rosette icon would visually overclaim exactly what the copy guidelines say not to overclaim in words.
- Color: olive/primary, not green. Reserve green strictly for the WhatsApp CTA itself, as already established — the badge should look calm and structural, not urgent or "go"-coded.

### "Would recommend" community signal
- Avoid star-rating iconography entirely, including as a "just visually" shorthand (e.g. don't use a star shape even to represent something else) — stars are so strongly associated with numeric quality scores that any star shape near a business listing will be read as a rating, undermining the "not a star rating" positioning even if the surrounding copy says otherwise.
- Instead: a simple filled/outline "thumbs" or small people/silhouette icon paired with the count and the word "recommend" spelled out in text, in the same rounded-pill treatment used for Contact checked but in a neutral/muted tone (not olive, not orange, not green) so it doesn't compete visually with the factual contact signal — recommendations remain secondary and softer.
- Below a minimum count, don't show the pill at all (see `06-verification-community-copy.md` for the exact threshold and copy) — visually, an empty or near-empty count is worse than no badge.

### General iconography direction
- Continue with simple line icons (consistent with lucide-react icons already in use across `VerifiedBadge`, `ShareButton`, category icons) — no illustrated/mascot-style icons, no filled 3D-style icons, no emoji-as-UI.
- Category icons should stay literal and legible at small sizes (a wrench for repairs, a plate for food) rather than abstract or overly clever — this is a directory a busy person scans quickly, not a lifestyle app where icon cleverness earns its keep.
