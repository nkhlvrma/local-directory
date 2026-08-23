// Outreach message templates. Keep them SHORT (WhatsApp preview cuts off
// around 100 chars), warm, and non-salesy. Language notes:
//
// - Hinglish (Roman script, mixed Hindi + English) is the default for tier-2
//   Indian cities on WhatsApp. Pure Devanagari can read as spam/political;
//   pure English can read as corporate/distant.
// - Always ask a low-friction yes/no question. Never ask them to fill a form.
// - Never say "opportunity" or "grow your business" — those are spam tells.

import { SITE_NAME, SITE_URL, CITY_SLUG } from "@/lib/site";

export type MessageLang = "hinglish" | "en" | "hi";

const CITY_LABEL: Record<string, string> = {
  lucknow: "Lucknow",
  bangalore: "Bangalore",
};

function cityLabel(): string {
  return CITY_LABEL[CITY_SLUG] ?? CITY_SLUG.replace(/-/g, " ");
}

function categoryLabel(categoryName: string, lang: MessageLang): string {
  // Simple lowercasing for English/Hinglish; keep as-is for Hindi.
  if (lang === "hi") return categoryName;
  return categoryName.toLowerCase();
}

export function outreachMessage(
  lang: MessageLang,
  categoryName: string,
): string {
  const city = cityLabel();
  const cat = categoryLabel(categoryName, lang);

  if (lang === "en") {
    return (
      `Hi, I'm building a small directory of good ${cat} in ${city} — free listing, no spam calls. ` +
      `People will just tap to chat with you on WhatsApp directly. ` +
      `Want me to add you? Reply "yes" and I'll list you today. — ${SITE_NAME}, ${SITE_URL}`
    );
  }

  if (lang === "hi") {
    return (
      `नमस्ते! मैं ${city} के अच्छे ${cat} की एक छोटी directory बना रहा हूँ — बिल्कुल मुफ़्त, कोई spam call नहीं। ` +
      `लोग सीधे WhatsApp पर आपसे बात करेंगे। ` +
      `Listing चाहिए? "हाँ" reply कीजिए, आज ही add कर दूँगा। — ${SITE_NAME}, ${SITE_URL}`
    );
  }

  // Default: Hinglish — most natural for WhatsApp in tier-2 India.
  return (
    `Namaste! Main ${city} ke acche ${cat} ki ek chhoti directory bana raha hoon — bilkul free, koi spam call nahi. ` +
    `Log seedha WhatsApp pe aapse baat karenge. ` +
    `Listing chahiye? "Haan" reply kar dijiye, aaj hi add kar dunga. — ${SITE_NAME}, ${SITE_URL}`
  );
}

export function outreachWaLink(
  e164: string,
  lang: MessageLang,
  categoryName: string,
): string {
  const digits = e164.replace(/[^\d]/g, "");
  const text = encodeURIComponent(outreachMessage(lang, categoryName));
  return `https://wa.me/${digits}?text=${text}`;
}
