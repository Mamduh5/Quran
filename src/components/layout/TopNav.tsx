import Link from "next/link";

const navItems = [
  { href: "/quran", label: "Quran" },
  { href: "/search", label: "Search" },
  { href: "/sources", label: "Sources" },
  { href: "/admin/imports", label: "Admin" }
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link className="focus-ring text-xl font-bold text-ink" href="/">
          Quran Reader
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-2 text-sm text-muted sm:gap-4"
        >
          {navItems.map((item) => (
            <Link
              className="focus-ring rounded px-2 py-1 transition hover:bg-accent-soft hover:text-accent"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
