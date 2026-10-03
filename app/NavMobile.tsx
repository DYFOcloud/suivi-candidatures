"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", label: "Accueil" },
  { href: "/candidatures", label: "Candidatures" },
  { href: "/agenda", label: "Agenda" },
  { href: "/statistiques", label: "Stats" },
  { href: "/profil", label: "Profil" },
];

export default function NavMobile() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t bg-white md:hidden">
      {ONGLETS.map((onglet) => {
        const actif =
          onglet.href === "/" ? pathname === "/" : pathname.startsWith(onglet.href);

        return (
          <Link
            key={onglet.href}
            href={onglet.href}
            className={`flex-1 py-3 text-center text-xs ${
              actif ? "font-semibold text-black" : "text-gray-500"
            }`}
          >
            {onglet.label}
          </Link>
        );
      })}
    </nav>
  );
}
