import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Sidebar from "./Sidebar";
import NavMobile from "./NavMobile";
import LogoutButton from "./LogoutButton";
import Footer from "./Footer";
import { createClient } from "./supabase-server";

export const metadata: Metadata = {
  title: "Joply",
  description: "Suivez vos candidatures, préparez vos entretiens",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="fr">
      <body className="antialiased">
        {user ? (
          <div className="flex min-h-screen">
            <div className="hidden md:block">
              <Sidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between gap-3 border-b px-4 py-3 md:justify-end md:px-8">
                <Link href="/" className="font-bold md:hidden">
                  Joply
                </Link>
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-gray-600 md:inline">
                    {user.email}
                  </span>
                  <Link
                    href="/profil"
                    className="hidden rounded border px-3 py-1.5 text-sm hover:bg-gray-50 md:inline-block"
                  >
                    Profil
                  </Link>
                  <LogoutButton />
                </div>
              </header>

              <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>

              <div className="hidden md:block">
                <Footer />
              </div>
            </div>

            <NavMobile />
          </div>
        ) : (
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        )}
      </body>
    </html>
  );
}
