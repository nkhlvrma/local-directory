// BounceCards renders <img src>, so a listing without a photo needs an
// actual image URL, not a React icon component (that's how ListingGridCard
// handles it). This generates a small inline SVG data URI — the business's
// first letter on a warm gradient — so the card never looks broken.
export function placeholderCardImage(name: string): string {
  const letter = (name.trim()[0] ?? "?").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c2410c" />
        <stop offset="100%" stop-color="#7c2d12" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)" />
    <text x="200" y="230" font-family="sans-serif" font-size="180" font-weight="700"
      fill="#fff7ed" text-anchor="middle">${letter}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
