# WhatsApp Message Templates

Draft templates in English, Hindi, and Hinglish. Tone reference: this project's own earlier work in `src/lib/outreach.ts` (removed from the live app but recovered from git history, commit `fe9f9a3`), which established a clear set of rules worth restating and following here:

- Keep messages **short** — WhatsApp previews cut off around 100 characters, so the hook has to land before that.
- **Hinglish (Roman script, mixed Hindi/English) is the default register** for tier-2 Indian cities on WhatsApp — pure Devanagari can read as spam/political, pure English can read as corporate/distant.
- Always ask a **low-friction yes/no question**. Never ask the recipient to fill out a form.
- Never say "opportunity" or "grow your business" — confirmed spam tells.

All templates below follow these rules. `[SITE_NAME]` stands in for whichever name is finalized (Karib, per the recommendation in `01-naming.md`); `[SITE_URL]`, `[CITY]`, and `[CATEGORY]` are template variables.

---

## 1. Business outreach / recruitment message

Sent by the founder to a shop/service owner, ideally as a follow-up to an in-person or phone introduction (see `10-business-outreach-scripts.md`) rather than cold.

**English:**
> Hi, I'm building a small directory of good [category] in [city] — free listing, no spam calls. People just tap to chat with you on WhatsApp directly. Want me to add you? Reply "yes" and I'll list you today. — [Site Name], [site URL]

**Hindi:**
> नमस्ते! मैं [city] के अच्छे [category] की एक छोटी directory बना रहा हूँ — बिल्कुल मुफ़्त, कोई spam call नहीं। लोग सीधे WhatsApp पर आपसे बात करेंगे। Listing चाहिए? "हाँ" reply कीजिए, आज ही add कर दूँगा। — [Site Name], [site URL]

**Hinglish (default/recommended):**
> Namaste! Main [city] ke acche [category] ki ek chhoti directory bana raha hoon — bilkul free, koi spam call nahi. Log seedha WhatsApp pe aapse baat karenge. Listing chahiye? "Haan" reply kar dijiye, aaj hi add kar dunga. — [Site Name], [site URL]

**Follow-up nudge, for a business that hasn't replied after ~1 week** (keep it even shorter — a second message needs to cost the reader almost nothing to read):

- English: "Hi again — still happy to add [business name] to [Site Name], free, whenever you're ready. Just reply 'yes.'"
- Hinglish: "Namaste dobara — [business name] ko [Site Name] pe add karne ka offer abhi bhi khula hai, bilkul free. Jab ready ho 'haan' bol dena."

---

## 2. Resident-facing share template

What a resident forwards into their own building/society WhatsApp group after using Karib themselves — written to sound like a person sharing something useful, not a company's marketing copy (this is the single most important template to get right, since it's the one residents, not the founder, will actually send).

**English:**
> Found this useful — [Site Name] is a small directory of [city] local businesses that actually reply on WhatsApp. No forms, just search and tap to message: [site URL]

**Hindi:**
> ये काम की चीज़ मिली — [Site Name] एक छोटी directory है [city] के local businesses की, जो WhatsApp पर reply करते हैं। कोई form नहीं, बस search करो और message करो: [site URL]

**Hinglish (default/recommended):**
> Ye kaam ki cheez mili — [Site Name] [city] ke local businesses ki ek chhoti directory hai, jo WhatsApp pe reply karte hain. Koi form nahi, bas search karo aur tap karke message karo: [site URL]

**Shorter variant** (for a resident sharing a single listing they found useful, rather than the whole directory):
- Hinglish: "Ye [business name] mila [Site Name] pe — WhatsApp pe verified hai, seedha message kar sakte ho: [listing URL]"
- English: "Found [business name] on [Site Name] — verified on WhatsApp, you can message them directly: [listing URL]"

---

## 3. "Verified local businesses" share card copy

For posting into local community groups as a standalone resource (not a reply to a specific question — see week-by-week placement in `08-90-day-content-calendar.md`).

**English:**
> A small directory of local [neighborhood] businesses that actually reply on WhatsApp. No forms, just tap and message them directly: [site URL]
> Might be handy if you're looking for [example category] nearby.

**Hindi:**
> [neighborhood] के local businesses की एक छोटी directory, जो WhatsApp पर reply करते हैं। कोई form नहीं, बस tap करके सीधा message करो: [site URL]
> अगर आस-पास [example category] चाहिए हो तो काम आ सकता है।

**Hinglish (default/recommended):**
> [neighborhood] ke local businesses ki ek chhoti directory — WhatsApp pe reply karte hain. Koi form nahi, bas tap karke seedha message karo: [site URL]
> Agar aas-paas [example category] chahiye ho toh kaam aa sakta hai.

---

## Notes on adapting these

- Always fill `[category]` and `[neighborhood]` with something real and specific — a generic message with no local detail reads as a template (because it is one), which undercuts the neighborly, locally observant voice principle from `03-voice-guidelines.md`.
- Keep the sign-off (`— [Site Name], [site URL]`) only on outreach messages, not on resident share templates — a resident forwarding a message to their own group shouldn't sound like it's signed by "the company," since the whole value of that forward is that it reads as one neighbor telling another.
- Do not translate "Verified" or "would recommend" into Hindi/Hinglish inconsistently across templates — pick one rendering (English loanword, in Roman script, e.g. "Verified hai" rather than "सत्यापित है") and keep it fixed everywhere, since these are becoming product terms, not just descriptive words, and consistency matters for recognition.
