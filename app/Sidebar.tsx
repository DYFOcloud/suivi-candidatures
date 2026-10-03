"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/candidatures", label: "Candidatures" },
  { href: "/agenda", label: "Agenda" },
  { href: "/statistiques", label: "Statistiques" },
  { href: "/documents", label: "Mes documents" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r bg-gray-50 p-4">
      <div className="px-3 py-4">
        <Link href="/" className="text-lg font-bold">
          Joply
        </Link>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {ONGLETS.map((onglet) => {
          const actif =
            onglet.href === "/" ? pathname === "/" : pathname.startsWith(onglet.href);

          return (
            <Link
              key={onglet.href}
              href={onglet.href}
              className={`rounded px-3 py-2 text-sm ${
                actif ? "bg-black font-medium text-white" : "text-gray-700 hover:bg-gray-200"
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
