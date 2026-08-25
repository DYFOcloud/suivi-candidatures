"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/candidatures", label: "Candidatures" },
  { href: "/agenda", label: "Agenda" },
  { href: "/documents", label: "Mes documents" },
  { href: "/profil", label: "Profil" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r bg-gray-50 p-4">
      <div className="px-3 py-4">
        <span className="text-lg font-bold">Suivi</span>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {ONGLETS.map((onglet) => {
          const actif =
            onglet.href === "/"
              ? pathname === "/"
              : pathname.startsWith(onglet.href);

          return (
            <Link
              key={onglet.href}
              href={onglet.href}
              className={`rounded px-3 py-2 text-sm ${
                actif
                  ? "bg-black font-medium text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {onglet.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
