import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t px-4 py-4 md:px-8">
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span>Joply</span>
        <Link href="/mentions-legales" className="hover:text-gray-600">
          Mentions légales
        </Link>
        <Link href="/confidentialite" className="hover:text-gray-600">
          Confidentialité
        </Link>
      </div>
    </footer>
  );
}
