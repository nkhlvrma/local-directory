"use client";

import Script from "next/script";

// Renders the Cloudflare Turnstile widget. On success, Turnstile injects a
// hidden input named `cf-turnstile-response` into this div — since the parent
// form calls `new FormData(e.currentTarget)`, the token gets picked up
// automatically without any extra wiring.

export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-size="flexible" />
    </>
  );
}
