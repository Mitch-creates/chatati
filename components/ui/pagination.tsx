import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export interface PaginationProps {
  page: number;
  pageCount: number;
  /**
   * Base path without locale, e.g. `/platform/invites`.
   */
  basePath: string;
  /**
   * Optional query params to preserve (e.g. { section: "received", view: "history" }).
   */
  query?: Record<string, string | number | undefined>;
  /**
   * Query param name for the page number. Use when multiple paginated sections share the same URL (e.g. receivedPage, sentPage).
   */
  pageParam?: string;
  className?: string;
}

function buildHref(
  basePath: string,
  page: number,
  query: Record<string, string | number | undefined> = {},
  pageParam: string = "page"
) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== pageParam) {
      params.set(key, String(value));
    }
  });
  if (page > 1) {
    params.set(pageParam, String(page));
  }
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

function getVisiblePages(page: number, pageCount: number): (number | "...")[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  pages.push(1);

  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) {
    pages.push("...");
  }

  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  if (end < pageCount - 1) {
    pages.push("...");
  }

  pages.push(pageCount);

  return pages;
}

export function Pagination({
  page,
  pageCount,
  basePath,
  query,
  pageParam = "page",
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const safePage = Math.min(Math.max(page, 1), pageCount);
  const pages = getVisiblePages(safePage, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className
      )}
    >
      {/* Previous */}
      <PaginationLink
        href={buildHref(basePath, Math.max(1, safePage - 1), query ?? {}, pageParam)}
        disabled={safePage === 1}
      >
        &lt; Previous
      </PaginationLink>

      {/* Numbered pages */}
      {pages.map((item, idx) =>
        item === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm">
            ...
          </span>
        ) : (
          <PaginationLink
            key={item}
            href={buildHref(basePath, item, query ?? {}, pageParam)}
            active={item === safePage}
          >
            {item}
          </PaginationLink>
        )
      )}

      {/* Next */}
      <PaginationLink
        href={buildHref(basePath, Math.min(pageCount, safePage + 1), query ?? {}, pageParam)}
        disabled={safePage === pageCount}
      >
        Next &gt;
      </PaginationLink>
    </nav>
  );
}

interface PaginationLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

function PaginationLink({
  href,
  children,
  active = false,
  disabled = false,
}: PaginationLinkProps) {
  const commonClasses =
    "inline-flex min-w-9 min-h-10 items-center justify-center rounded-md border-2 border-black px-3 py-2 text-sm font-semibold select-none";

  if (disabled) {
    return (
      <span
        className={cn(
          commonClasses,
          "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {children}
      </span>
    );
  }

  if (active) {
    return (
      <span
        className={cn(
          commonClasses,
          "bg-black text-white"
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        commonClasses,
        "bg-accent-color2 text-black"
      )}
    >
      {children}
    </Link>
  );
}

