import Link from "next/link";

import { auth, signOut } from "@/lib/auth";
import { getDashboardPathForRole, isAdminRole } from "@/lib/access";

export async function Header() {
  const session = await auth();
  const dashboardPath = getDashboardPathForRole(session?.user?.role);
  const showAdminLink = isAdminRole(session?.user?.role);

  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-2xl tracking-[0.25em] text-stone-900">
          MERIDIAN
        </Link>
        <nav className="flex items-center gap-5 text-sm uppercase tracking-[0.18em] text-stone-700">
          <Link href="/products">Shop</Link>
          <Link href="/cart">Cart</Link>
          {showAdminLink ? <Link href="/admin">Admin</Link> : null}
          {session?.user ? <Link href={dashboardPath}>{showAdminLink ? "Dashboard" : "Account"}</Link> : <Link href="/login">Login</Link>}
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit">Sign out</button>
            </form>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
