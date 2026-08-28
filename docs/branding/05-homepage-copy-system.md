# Homepage Copy System

Multiple options per surface, at least 3 each, with a top recommendation marked. Written against the current homepage structure in `src/app/page.tsx` (hero with `LocationBar` + animated headline + `SearchBar`, then Recently Viewed, Browse by category, Neighborhood map) and the working name **Karib**. If a different name ships, only the name-specific lines need swapping.

---

## Hero headline

The current implementation uses an animated typewriter: "Find **[locals / businesses / services]**." These options work with or without that animation — noted where it matters.

1. **"Find locals, businesses, and services."** *(current structure — keep the typewriter cycling through these three words)*
   Plain and functional. Put the trust explanation below the headline rather than making an unearned quality claim in the headline.

2. **"Your neighborhood, one chat away."**
   Leads with the WhatsApp mechanic implicitly and the neighborly tone explicitly — doesn't animate as naturally as a word-swap headline, works better as a static line. ⭐ **Recommended** — matches the tagline recommendation in `02-positioning-and-messaging.md`, and tests well against the "humble, not salesy" voice principle since it makes no claim about quality at all.

3. **"Search Lucknow. Message directly."**
   Two blunt imperative fragments — most literal description of the actual user flow (search, then WhatsApp). Best if user-testing shows people don't understand the WhatsApp mechanic fast enough from headline alone.

4. **"Everything nearby, reachable in one tap."**
   Slightly more energetic/marketing register than the others — works well if paired with the typewriter animation on "nearby" categories, but sits closer to overclaiming ("everything") than the other options, so needs the subheadline to immediately ground it.

---

## Hero subheadline

Current copy: *"A neighborhood guide for useful local people and services. Search first, then reach out directly."*

1. **"A neighborhood guide for useful local people and services. Search first, then reach out directly."** *(current direction)*
   Clear and modest. It explains the job without claiming the directory can guarantee service quality.

2. **"We check that local businesses actually reply on WhatsApp — so you can skip the guesswork and just message them."**
   ⭐ **Recommended.** Precisely matches the resident-facing promise in `02-positioning-and-messaging.md`, names the mechanic (we messaged them, they replied) instead of a vaguer "verified" claim, and ends on the reader's action.

3. **"No forms, no listings that go nowhere — just local numbers that actually pick up."**
   More casual/colloquial register, leans into the "picks up" personification also used in tagline option 4. Good for A/B testing against option 2 if the team wants to see whether a warmer or a more literal subheadline converts better.

---

## Search empty-state message

Context: resident searches a category/neighborhood combination with zero results.

1. **"Nothing here yet for [category] in [neighborhood]. Try a wider area, or check nearby neighborhoods below."**
   ⭐ **Recommended.** Matches the exact example already established in `03-voice-guidelines.md` — reuse it verbatim here rather than drafting a new voice for the same moment.

2. **"We don't have [category] listed in [neighborhood] yet — but new listings go up every week. Try a nearby area for now."**
   Slightly more forward-looking/optimistic, useful if the team wants the empty state to also set an expectation that the directory is actively growing (true and useful during the 90-day launch period specifically).

3. **"No matches yet. Widen your search, or be the first to suggest a [category] business here."**
   Turns the empty state into a light supply-recruitment moment (an implicit "you can help us add one") — higher-risk option since it asks something of the resident at the exact moment they didn't get what they wanted; only use if there's a real lightweight way to act on "suggest a business" immediately, not a dead-end link.

---

## Trust-panel microcopy

Context: a small panel on the listing detail page explaining what "Contact checked" and the directory as a whole actually stand behind.

1. **"Contact checked means one thing here: we messaged this number on WhatsApp ourselves and got a reply. That's it — not a rating, background check, or endorsement."**
   ⭐ **Recommended.** Most explicit and honest option.

2. **"We don't rank businesses or claim to know who's 'the best.' We only check that they're reachable — recommendations from real neighbors tell you the rest."**
   Good alternative framing that explains the *absence* of ratings/rankings as a deliberate choice rather than a missing feature — useful if user feedback suggests people are asking "why isn't this sorted by rating?"

3. **"This directory runs on two simple signals: did we reach the contact on WhatsApp (Contact checked), and have neighbors said they'd recommend them (Would recommend). No paid placements, no star ratings."**
   Most complete/systemic explanation — best suited to a dedicated "How Karib works" page rather than an inline panel, since it's longer and covers both trust mechanics at once.

---

## Submission-confirmation message

Context: after a business (or resident, on behalf of a business) submits a new listing via `list-your-business`.

1. **"Got it. We'll WhatsApp you in the next day or two to confirm your number, then send you the listing link after review."**
   ⭐ **Recommended.** Gives a concrete next step without implying publication happens before consent and review.

2. **"Thanks! One quick step left — we'll message your WhatsApp to confirm it's the right number, usually within a couple of days."**
   Slightly warmer/more explanatory version, better if user testing shows people are confused about *why* they'll get a WhatsApp message from an unfamiliar number after submitting.

3. **"Submitted. Next: a message from us on WhatsApp to confirm you're reachable — reply and you're listed."**
   Terser, action-oriented version — best for a compact confirmation toast/banner rather than a full page or modal, where space is limited.

---

## "Popular in Lucknow" section header

1. **"Popular in Lucknow"**
   Plain, direct — but "popular" implies a ranking/popularity mechanic the plan explicitly wants to avoid claiming (nothing here is currently measuring or displaying "popularity" as a signal, per the trust rules).

2. **"Neighbors are asking about"**
   ⭐ **Recommended.** Frames the section as reflecting real resident search/interest without claiming a formal popularity ranking exists — matches the "community, not algorithm" trust message from `02-positioning-and-messaging.md`. Works well if the underlying data genuinely is "most-searched" or "most-viewed" categories/listings.

3. **"Around Lucknow right now"**
   Neutral, avoids any ranking claim entirely, reads more like a rotating/curated shelf than a data-driven "popular" list — safest option if there isn't yet real usage data behind the section and it's currently closer to editorially chosen.

**Caution:** whichever header ships, make sure the underlying section genuinely reflects what the header claims (real search/view data vs. editorial picks) — a "Popular in Lucknow" or "Neighbors are asking about" header sitting over content that's actually just "whatever we added first" is the same kind of unearned claim the plan says to avoid for ratings, just in a different spot.
