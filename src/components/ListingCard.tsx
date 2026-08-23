import Link from "next/link";
import { VerifiedBadge } from "./VerifiedBadge";

type Props = {
  href: string;
  name: string;
  category?: string | null;
  neighborhood?: string | null;
  description?: string | null;
  verified?: boolean;
};

export function ListingCard({
  href,
  name,
  category,
  neighborhood,
  description,
  verified,
}: Props) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-black/10 dark:border-white/10 p-4 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
    >
      <div className="flex items-center gap-2">
        <div className="font-medium">{name}</div>
        {verified ? <VerifiedBadge compact /> : null}
      </div>
      <div className="mt-0.5 text-xs text-black/60 dark:text-white/60">
        {[category, neighborhood].filter(Boolean).join(" · ")}
      </div>
      {description ? (
        <p className="mt-2 text-sm text-black/75 dark:text-white/75 line-clamp-2">
          {description}
        </p>
      ) : null}
    </Link>
  );
}
