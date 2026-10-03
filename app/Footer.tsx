import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t px-8 py-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span>Joply</span>
        <Link href="/mentions-legales" className="hover:underline">
          Mentions légales
        </Link>
        <Link href="/confidentialite" className="hover:underline">
          Confidentialité
        </Link>
        <a href="mailto:contact@joply.fr" className="hover:underline">
          contact@joply.fr
        </a>
      </div>
    </footer>
  );
}
