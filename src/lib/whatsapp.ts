// Build a wa.me deep link. Number must be E.164 without the leading `+`.
// e.g. +919812345678 -> https://wa.me/919812345678?text=...
export function whatsappLink(e164: string, message: string): string {
  const digits = e164.replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export function defaultOpener(listingName: string, siteName = "the directory") {
  return `Hi ${listingName}, I found you on ${siteName}. `;
}
