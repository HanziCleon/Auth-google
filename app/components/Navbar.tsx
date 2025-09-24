"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-6 shadow-md">
      <Link href="/" className="hover:text-blue-400">Home</Link>
      <Link href="/anime" className="hover:text-blue-400">Anime</Link>
      <Link href="/premium" className="hover:text-blue-400">Premium</Link>
      <Link href="/admin" className="hover:text-blue-400">Admin</Link>
    </nav>
  );
}
