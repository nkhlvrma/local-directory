"use client";

import dynamic from "next/dynamic";

// The Agentation annotation toolbar is a development-only tool, but a plain
// top-level `import { Agentation } from "agentation"` pulls its ~428 KB
// chunk into the production client bundle even when the render is gated on
// NODE_ENV: the JSX is dead-code-eliminated, yet the module import itself
// survives tree-shaking, and the chunk was being served to every visitor.
//
// Importing it through next/dynamic instead keeps it in a separate async
// chunk that is only fetched when the component actually renders — which in
// production is never, because of the guard below. This wrapper is a Client
// Component because `ssr: false` is not allowed from a Server Component.
const Agentation = dynamic(
  () => import("agentation").then((m) => m.Agentation),
  { ssr: false },
);

export function DevToolbar() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation />;
}
