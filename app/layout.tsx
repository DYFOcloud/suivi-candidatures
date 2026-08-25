import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { createClient } from "./supabase-server";

export const metadata: Metadata = {
  title: "Suivi de candidatures",
  description: "Gérez toutes vos candidatures au même endroit",
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
            <div className="flex-1">
              <header className="flex items-center justify-end border-b px-8 py-3">
                <span className="mr-4 text-sm text-gray-600">{user.email}</span>
                <LogoutButton />
              </header>
              <main className="p-8">{children}</main>
            </div>
          </div>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
