# Positioning & Messaging

Written against the recommended name **Karib** (see `01-naming.md`). If a different name is chosen, everything below still holds structurally — swap the name and re-check the tagline options, which are the only parts written to the specific word.

---

## Positioning statement

**Refined from the source plan's draft:**

> Karib is a trusted neighborhood guide for finding local people, businesses, and services in Lucknow you can actually reach — and messaging them directly on WhatsApp, without forms, hold music, or dead-end numbers.

Changes from the source draft and why:
- Named the product and the city explicitly — a positioning statement that could describe any city isn't yet a positioning statement for *this* one.
- Added "without forms, hold music, or dead-end numbers" — makes the abstract promise ("reachable") concrete by naming the specific frustrations it removes. Residents don't feel "unreachability" as a concept; they feel it as an unanswered call or a WhatsApp number that bounces.
- Kept "trusted" but did not upgrade it to "verified" or "best" in the statement itself — trust is earned through the verification mechanic (see below), not claimed as a blanket adjective.

## Resident-facing promise

> **We check that local businesses answer. You skip the guesswork.**

Supporting line (for use under the promise, not instead of it):
> Every listing on Karib has been messaged on WhatsApp by us and got a real reply — so when you reach out, someone's actually there.

Why this phrasing: it describes an action Karib took ("we messaged them and got a reply"), not a quality judgment ("verified," "trusted," "top-rated"). That action is true and checkable. A quality judgment isn't, yet.

## Business-facing value proposition

> **Get found by neighbors already looking for you — for free, with no listing fees and no forms to fill out for the customer.**

Supporting line:
> Karib sends you customers who already know what they want and message you directly on WhatsApp. No app to install, no dashboard to check — just chats, the way you already work.

This is deliberately written for a shopkeeper who does not think of themselves as running an "online business" — it avoids "grow your business," "digital presence," "opportunity," and "leads," all of which read as sales pitches (confirmed by the tone notes recovered from this project's own git history in `src/lib/outreach.ts`, which explicitly flag those words as spam tells).

## The four core messages

### 1. Resident message
> Find a local business or service near you, see if a real neighbor has recommended them, and message them on WhatsApp in one tap — no sign-up, no spam calls.

### 2. Business message
> List your shop or service for free. We'll message you once to confirm your WhatsApp number works, then neighbors can reach you directly — no fees, no forms, no app to manage.

### 3. Trust message
> Every listing is checked one way: we message the business on WhatsApp ourselves and confirm someone replies. That's what "Verified" means here — not a star rating, not a paid placement. Just: this number works.

### 4. Community message
> Karib runs on real recommendations from real neighbors — not star ratings from strangers. When someone in your area says "would recommend," that's a person, not an algorithm.

---

## Tagline options

Five options, tested for how they sound spoken aloud and typed into a WhatsApp bio or share message.

1. **"Your neighborhood, one chat away."**
   Leads with warmth and the WhatsApp mechanic without naming it. Strong default — works on the homepage hero and as a WhatsApp Business status line.

2. **"Find it nearby. Message it directly."**
   Two short imperative fragments — plain, functional, describes the exact user action (search, then WhatsApp). Best for a context where the product's mechanics need to be obvious fast (e.g. a first-time visitor from a shared link).

3. **"Reachable, not just listed."**
   Sharpest articulation of the core differentiator (reachability over comprehensiveness) but more abstract — better as a secondary line under a warmer primary tagline than as the only line on a page.

4. **"The local guide that actually picks up."**
   Personifies the product as a person who answers — playful, memorable, slightly cheeky. Strong for social/WhatsApp Status content; a touch informal for a formal trust-panel context.

5. **"Karib se, Lucknow tak."** *("From close by, to all of Lucknow.")*
   Hinglish/Hindi-forward option, plays on the name meaning "near." Only works if the name Karib is adopted — included to show what a name-integrated tagline can do. Best for print/street-level materials (flyers, shop stickers) rather than the English-first website.

**Recommended default: Option 1** ("Your neighborhood, one chat away.") for the site hero, paired with Option 3 ("Reachable, not just listed.") as supporting copy where more explanation is useful (About/trust pages). Option 5 is worth field-testing in Hindi/Hinglish contexts (WhatsApp groups, print) even if the English site uses Option 1.
