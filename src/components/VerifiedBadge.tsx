export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } font-medium`}
      title="We messaged this WhatsApp and got a response."
    >
      <svg
        aria-hidden="true"
        width={compact ? 10 : 12}
        height={compact ? 10 : 12}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
      </svg>
      Verified
    </span>
  );
}
