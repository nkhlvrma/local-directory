# Voice Guidelines

Five principles, each grounded in real examples rather than left abstract. Every "don't" below is a realistic mistake — most are patterns an AI-assisted or fast-moving small team actually writes under deadline pressure, not strawmen.

---

## The five principles

### Useful
Say the thing the reader needs to act on. Cut anything that doesn't change what they do next.

### Neighborly
Write like a helpful person who lives two streets over, not a company. Warm, specific, a little informal — never corporate, never cutesy-startup.

### Clear
One idea per sentence. No jargon the reader has to translate ("curated," "ecosystem," "seamless").

### Humble
Never claim quality Karib hasn't earned evidence for ("best," "top-rated," "guaranteed"). Say only what's checkable.

### Locally observant
Reference real, specific things about Lucknow and its neighborhoods where it's true and helpful — not generic "local flavor" filler.

---

## Do / don't pairs

### 1. Describing a listing

**Don't:**
> Rajesh Electricals is a top-rated electrical services provider offering premium solutions to the Lucknow community.

*Why it fails:* "top-rated" is an unearned claim (no rating system exists), "premium solutions" is jargon that says nothing, "the Lucknow community" is generic filler.

**Do:**
> Rajesh Electricals — wiring, fan and switchboard repairs, in Aminabad. 12 neighbors would recommend them.

*Grounds: Useful (says what they actually do), Clear (short, concrete), Humble (a recommendation count, not a superlative), Locally observant (names the actual neighborhood).*

---

### 2. Writing an empty state (no search results)

**Don't:**
> No results found. Please try modifying your search parameters or explore other categories.

*Why it fails:* "search parameters" is software jargon nobody says out loud; the tone is a form-validation error, not a person talking.

**Do:**
> Nothing here yet for "AC repair" in Indira Nagar. Try a wider area, or check nearby neighborhoods below.

*Grounds: Clear (plain words), Neighborly (talks like a person redirecting you, not a system rejecting input), Useful (offers the actual next step instead of a vague suggestion).*

---

### 3. Explaining verification

**Don't:**
> This business has been fully verified and approved by our quality team.

*Why it fails:* "fully verified" overclaims — implies background checks, licensing, quality review, none of which happened. "Our quality team" implies a team that (per the plan) doesn't exist yet for a solo founder.

**Do:**
> Verified means we messaged this number on WhatsApp ourselves and got a reply. That's the one thing we check.

*Grounds: Humble (states exactly and only what was checked), Clear (no ambiguity about what "Verified" means), Useful (sets correct expectations before the resident messages them).*

---

### 4. Writing an error message

**Don't:**
> An error occurred while processing your submission. Please try again later.

*Why it fails:* passive voice hides what happened and who's responsible; "later" gives no real guidance; reads like a stack trace apologizing for itself.

**Do:**
> That didn't go through — might be a slow connection. Give it another tap?

*Grounds: Neighborly (a person noticing something didn't work, not a system logging a failure), Clear (one likely cause, one clear action), Useful (an actual next step: try again).*

---

### 5. Writing a WhatsApp message on the business's behalf (outreach/recruitment)

**Don't:**
> Greetings! We are excited to offer you an incredible opportunity to grow your business online with our innovative platform. Join thousands of businesses already benefiting from increased visibility!

*Why it fails:* "opportunity," "grow your business," "innovative platform" are exactly the spam tells this project's own earlier outreach-copy work (see `src/lib/outreach.ts` history) identified and deliberately avoided. Also almost certainly too long for a WhatsApp preview, which cuts off around 100 characters.

**Do:**
> Hi, I'm building a small directory of good electricians in Lucknow — free listing, no spam calls. People just tap to chat with you on WhatsApp. Want me to add you? Reply "yes."

*Grounds: Neighborly (a person building something small, not a company pitching), Clear (says exactly what happens if they say yes), Humble ("a small directory," not "the leading platform"), Useful (a single yes/no action, not a form).*

---

### 6. Prompting for a community recommendation

**Don't:**
> Rate your experience with this business to help other users make informed decisions.

*Why it fails:* "rate" implies a star system Karib deliberately doesn't use; "other users" is cold, corporate framing of neighbors.

**Do:**
> Would you recommend Rajesh Electricals to a neighbor? A quick yes helps others nearby.

*Grounds: Clear (matches the actual UI mechanic — a would-recommend count, not stars), Neighborly ("a neighbor," not "other users"), Useful (explains why the tap matters).*

---

### 7. Writing a submission-confirmation message (business listing)

**Don't:**
> Your submission has been received and is pending review by our team. You will be notified of the outcome in due course.

*Why it fails:* "pending review by our team" and "in due course" are vague and bureaucratic — no sense of timeframe or what happens next, and imply a team where there may be one founder.

**Do:**
> Got it. We'll WhatsApp you in the next day or two to confirm your number, then you're live.

*Grounds: Useful (concrete next step and rough timing), Neighborly (first-person, direct), Clear (no hedging language).*

---

### 8. Writing a report-listing confirmation

**Don't:**
> Thank you for your feedback. Our team will investigate this matter and take appropriate action if necessary.

*Why it fails:* "investigate this matter," "appropriate action if necessary" — legalistic hedge language that sounds like it's protecting the company, not helping the neighborhood.

**Do:**
> Thanks — we'll check this out and fix it if something's wrong.

*Grounds: Humble (doesn't promise a specific outcome it can't guarantee), Clear (short, direct), Neighborly (reads like a person who cares, not a compliance process).*

---

## Quick reference: words to avoid and why

| Avoid | Why | Use instead |
|---|---|---|
| Best, top-rated, #1 | No evidence exists for a quality ranking — only reachability is checked | "Verified," a recommendation count, or nothing |
| Fully verified, 100% verified | Overclaims what the check actually covers | "Verified — we messaged them and got a reply" |
| Curated, ecosystem, seamless, leverage | Corporate jargon, doesn't help the reader act | Say the plain thing directly |
| Our team / pending review | Implies staff/process that may not exist for a solo founder; sounds bureaucratic | First person ("I'll," "we'll") with a concrete next step |
| Opportunity, grow your business, increased visibility | Confirmed spam tells in this exact outreach context (see git history of `src/lib/outreach.ts`) | State the specific, concrete thing that happens ("free listing," "neighbors message you directly") |
| Please try again later / an error occurred | Passive, vague, unhelpful | Name the likely cause, give one clear next action |
| Users | Cold; this product's whole positioning is about neighbors, not users | "Neighbors," "residents," or just "people nearby" |
