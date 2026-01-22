'use client';

import Link from 'next/link';
import React from 'react';
import { Layout } from 'lucide-react';

export function Navbar() {
  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold text-lg">
          <Layout className="h-6 w-6" />
          <span>LINE Rich Menu Maker</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/templates" className="hover:underline">Templates</Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </nav>

        {/* Mobile menu placeholder */}
        <div className="md:hidden text-sm">Menu</div>
      </div>
    </header>
  );
}
