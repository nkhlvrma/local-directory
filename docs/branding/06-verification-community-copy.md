# Verification & Community Copy

Exact microcopy strings, ready to drop into the codebase (as content, not as an instruction to edit code in this task).

---

## Contact checked badge

**Label:**
> Contact checked

Keep this short enough for badge-scale UI. Do not expand it to "Fully verified" or "100% verified"; the explanation belongs in the tooltip/detail panel.

**Tooltip / explainer text:**

Recommended replacement, slightly more precise and slightly warmer:
> We messaged this number on WhatsApp ourselves and got a reply. That's what Contact checked means here.

Shorter variant, if tooltip space is constrained:
> We WhatsApped this number and got a reply.

**Trust-panel / detail-page expansion:**
> Contact checked means exactly one thing: we sent this number a WhatsApp message and got a reply. It is not a rating, background check, or endorsement — and it does not guarantee that the business is available now.

**What NOT to write**, and why each fails the humility principle:
- "Fully verified" / "100% Verified" — implies a more thorough check than exists.
- "Verified by our team" — implies staff/process beyond a founder sending one message.
- "Verified business" (as a noun phrase suggesting the business itself, not just its number, was vetted) — overclaims scope.

---

## "Would recommend" button and counter

**Button label (before tapping):**
> Would recommend

Not "Rate this business," not "Leave a review" — matches the plan's explicit instruction that this is a recommendation signal, not a star rating, and should read as a simple yes.

**Button label (after tapping — confirmation state):**
> Recommended ✓

**Prompt copy near the button** (if a short prompt is needed above/beside it):
> Would you recommend [Business Name] to a neighbor?

**Counter display logic — what to show at each count, and why:**

The core rule: **never show a raw count below a floor number, because a low count reads as evidence of low trust ("only 2 people ever recommended this"), which is worse for both the business and the product's credibility than showing nothing.** A missing count reads as "not enough data yet" (neutral); a visible "2" reads as "barely anyone" (negative) — even though 2 might just mean the listing is new.

Recommended floor: **N = 5.** Below 5 recommendations, don't display a count at all. This threshold is a judgment call, not a hard number pulled from data Karib doesn't have yet — see the note at the end of this section on how to re-tune it once real numbers exist.

| Recommendation count | What to show |
|---|---|
| 0 | No badge/count shown at all. Just the plain "Would recommend" button, unpressed, with no surrounding text implying a history either way. |
| 1–4 (below floor) | Still no visible count. Optionally, once a listing has *at least one* recommendation, a business owner (not a resident) view can show the real number privately — residents never see counts under the floor. |
| 5–9 | Show the exact count: **"5 would recommend"** through **"9 would recommend."** |
| 10–49 | Show the exact count: **"23 would recommend."** Exact numbers stay legible and meaningful at this range — no need to round yet. |
| 50–99 | Either exact ("67 would recommend") or rounded to nearest 5/10 ("~65 would recommend") — exact is preferable while numbers are still this checkable/trustworthy-feeling; round only if the counting mechanism becomes approximate (e.g. cached/estimated counts) for performance reasons. |
| 100+ | Round for readability: **"100+ would recommend."** At this scale, precision stops being useful information and starts being visual clutter. |

**Why 5, specifically:** it's high enough that "5 would recommend" doesn't read as "practically nobody," and low enough to be achievable for a new listing within its first few weeks without requiring the kind of scale a solo-founder, single-city launch won't have for months. Revisit after 30–60 days of real data — if most listings plateau at 6–8 recommendations, the floor may be too close to the median and worth lowering to 3; if most active listings blow past 20 quickly, 5 may be too low to feel meaningful and worth raising to 8–10. The point is not the specific number 5 — it's the principle: **set the floor from what "feels credibly non-empty" once real numbers exist, not from a guess frozen in this document.**

---

## Report-listing flow copy

**Entry point / link text** (already exists in the footer per `src/app/layout.tsx`: "Report a listing" — keep this, it's clear and correctly low-key).

**Form intro copy** (above the reason selector):
> Something wrong with this listing? Let us know and we'll take a look.

**Reason options** (current implementation in `src/app/report/ReportForm.tsx` uses: Closed / no longer operating, Wrong info, Spam, Other — these are good, keep them; below are the exact user-facing labels, unchanged from current code since they're already clear and correctly scoped):
- Closed / no longer operating
- Wrong info
- Spam
- Other

**Optional note field placeholder:**
> Anything else we should know? (optional)

**Submission confirmation** (current implementation: "Thanks — we'll take a look."):

Keep this — it's already correctly humble (doesn't promise a specific action or timeline it can't guarantee) and matches the voice guidelines' report-confirmation example almost exactly. One small strengthening option if more warmth is wanted:
> Thanks for flagging this — we'll check it out.

**What NOT to write:**
- "Your report has been submitted for review" — passive, bureaucratic.
- "We take all reports seriously and will investigate thoroughly" — a promise a solo founder can't operationally back up for every report; sets an expectation of formal process that doesn't exist.
- Any language implying an SLA or guaranteed timeframe ("within 24 hours," "we'll respond soon") unless that's an actual operational commitment the founder intends to keep.
