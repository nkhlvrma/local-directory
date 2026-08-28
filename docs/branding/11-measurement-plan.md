# Measurement Plan

Translates the plan's event list into a concrete spec for what a launch dashboard should show. **This document specifies the dashboard; it does not build it** — a separate, concurrent effort is implementing the underlying analytics event logging in the codebase. This spec should be handed to whoever builds the dashboard once events are flowing.

Source event list: search submitted, category selected, neighborhood selected, listing viewed, WhatsApp clicked, call clicked, map/neighborhood interaction, business submission started/completed, recommendation submitted, listing reported, share link used.

---

## Funnel stages

Group the raw events into a funnel that mirrors the actual resident journey, not just a flat event list:

### Stage 1 — Discovery (how residents arrive and start looking)
- Search submitted
- Category selected
- Neighborhood selected
- Map/neighborhood interaction
- Share link used *(as an inbound signal — someone arrived via a shared link)*

### Stage 2 — Evaluation (residents looking at a specific business)
- Listing viewed

### Stage 3 — Conversion (residents taking the action the whole product exists for)
- WhatsApp clicked
- Call clicked

### Stage 4 — Trust & community loop (signals that build the directory's credibility over time)
- Recommendation submitted
- Listing reported

### Stage 5 — Supply growth (business-side funnel, separate from the resident funnel above but feeding it)
- Business submission started
- Business submission completed

---

## North-star metric

> **WhatsApp/call conversations started per approved listing view.**

Defined as: (WhatsApp clicked + Call clicked) ÷ (Listing viewed), measured over approved/live listings only.

**Why this is the right north star, not raw traffic or raw listing count:** it's the one number that directly reflects the core promise — "reachable, not just listed." A directory can have hundreds of listings and thousands of views and still fail its actual mission if views don't turn into real conversations. This metric also can't be gamed by adding more listings or driving more traffic alone — it only moves if the listings people actually look at are ones they're willing to act on, which is a decent proxy for whether the trust signals (Verified badge, would-recommend counts) are doing their job.

**Caveat to build into the dashboard, not just this document:** WhatsApp-click tracking (`whatsappLink` in `src/lib/whatsapp.ts`) fires when a resident taps the link, not when a conversation actually happens on WhatsApp itself — the product cannot see past the `wa.me` handoff. Label this metric internally as "conversations started (click-through)," not "conversations," so nobody mistakes it for confirmed engagement.

---

## Supporting metrics (5–6), grouped by funnel stage, with target-setting guidance

The plan is explicit that hard numeric targets shouldn't be invented without data — so each metric below includes *how* to set a target after 30 days of real data, not a guessed number.

### 1. Search-to-view rate (Discovery → Evaluation)
Defined as: Listing viewed ÷ (Search submitted + Category selected + Neighborhood selected), i.e. what fraction of discovery actions lead to at least one listing view.
**Target-setting guidance:** after 30 days, take the median search-to-view rate as the baseline. If it's low relative to how many listings exist per category, that points to a discoverability or empty-state problem (see `05-homepage-copy-system.md` empty-state copy) rather than a demand problem — investigate before assuming residents simply aren't interested.

### 2. View-to-contact rate (Evaluation → Conversion)
This is the per-listing version of the north-star metric, useful for identifying *which specific listings* underperform, not just the aggregate.
**Target-setting guidance:** after 30 days, rank listings by view-to-contact rate. Listings in the bottom quartile are worth a manual look — often a missing/blurry detail, an unclear category fit, or the Verified badge not showing (a technical or data issue) rather than the business itself being undesirable.

### 3. Verified-listing share of total listings
Defined as: Verified listings ÷ total live listings. Not from the resident-behavior event list, but a critical supporting metric since "reachable" is the entire brand promise — a dashboard that only tracks resident behavior and ignores whether the supply side is actually keeping up with verification would miss the thing most likely to break trust.
**Target-setting guidance:** this should trend toward 100% by definition (an unverified listing arguably shouldn't be live at all) — track it as a data-quality/process-health metric, flagging immediately if it drops, rather than setting a target below 100%.

### 4. Recommendation rate among contacted residents
Defined as: Recommendation submitted ÷ WhatsApp clicked (a rough proxy for "of the people who reached out, how many came back to say it went well").
**Target-setting guidance:** this will likely be a small fraction at first (most people don't return to leave a recommendation without a nudge) — after 30 days, use the observed rate as a baseline and treat any deliberate prompt/nudge added later (e.g. a follow-up WhatsApp Status reminder, an on-site prompt) as a testable intervention against that baseline, not against an assumed number.

### 5. Report rate
Defined as: Listing reported ÷ Listing viewed. A quality/trust health-check metric — should stay very low; a rising report rate is an early warning signal, not just a data point to log and forget.
**Target-setting guidance:** set the "concerning" threshold relative to the observed 30-day baseline rather than an absolute number — e.g. if the baseline settles around 0.1% of views, treat a sustained move to 0.5%+ as worth investigating, since the *change* matters more than the absolute figure this early.

### 6. Business submission completion rate (Supply growth)
Defined as: Business submission completed ÷ Business submission started.
**Target-setting guidance:** after 30 days, if this rate is low, that's a strong, actionable signal the submission flow itself (not outreach effort) is losing businesses — worth a direct look at where in the form people abandon, distinct from the outreach-conversion tracking described qualitatively in `07-acquisition-playbooks.md` (which covers in-person/WhatsApp recruitment, a different funnel from the self-serve submission form).

---

## What the launch dashboard should show, concretely

A single-screen view organized by the funnel stages above, not a flat list of eleven events:

1. **Top strip:** the north-star metric (conversations started per approved listing view), trended over the last 30/60/90 days, with a simple approved-listings count alongside it for context (the ratio alone can mislead if the listing count is tiny and volatile early on).
2. **Discovery panel:** search volume, top categories/neighborhoods selected, share-link-driven arrivals — this panel answers "are people looking, and for what."
3. **Evaluation → Conversion funnel visual:** a simple three-step funnel (viewed → WhatsApp/call clicked → [where trackable] recommendation submitted) — this is the one visual that should be checked most often, since it's the direct measure of the core promise.
4. **Trust health panel:** verified-listing share, report rate, recommendation rate — grouped together because they're all "is the directory staying trustworthy" signals, distinct from raw usage volume.
5. **Supply panel:** submission started/completed counts and completion rate — kept visually separate from the resident-facing panels above, since it answers a different question (is supply keeping pace) for a different audience (the founder managing outreach, not evaluating resident experience).

**Explicitly out of scope for this document:** the actual event-logging implementation, the specific analytics tool/backend, and dashboard engineering — those belong to the concurrent engineering effort. This document is the spec that effort (or whoever builds the dashboard on top of the logged events) should build against.
