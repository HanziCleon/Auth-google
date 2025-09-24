"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Anime Streaming 🎥</h1>
      <p className="text-lg text-gray-700 mb-8">
        Pilih halaman yang ingin kamu buka dari menu navbar atau klik langsung di bawah ini:
      </p>
      <div className="flex gap-4">
        <Link href="/anime" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Anime
        </Link>
        <Link href="/premium" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Premium
        </Link>
        <Link href="/admin" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Admin
        </Link>
      </div>
    </div>
  );
}
