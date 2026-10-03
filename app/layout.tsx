import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Sidebar from "./Sidebar";
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
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <header className="flex items-center justify-end gap-4 border-b px-8 py-3">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Link
                  href="/profil"
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Profil
                </Link>
                <LogoutButton />
              </header>
              <main className="flex-1 p-8">{children}</main>
              <Footer />
            </div>
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
