import Link from "next/link";
import {
  Lightning,
  SquaresFour,
  ListBullets,
  Tray,
  SignOut,
} from "@phosphor-icons/react/ssr";
import { logoutAdmin } from "@/features/admin/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: SquaresFour },
  { href: "/admin#listings", label: "Listings", icon: ListBullets },
  { href: "/admin#submissions", label: "Submissions", icon: Tray },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-row items-center justify-between gap-4 border-b border-white/10 bg-sidebar px-4 py-3 lg:w-56 lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <Link href="/admin" className="flex items-center gap-2 px-1 text-sm font-semibold tracking-tight">
          <Lightning weight="fill" className="size-5 text-primary" />
          Free Plug
        </Link>

        <nav className="flex items-center gap-1 lg:mt-6 lg:flex-col lg:items-stretch lg:gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <item.icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        <form action={logoutAdmin} className="lg:mt-auto">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <SignOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
