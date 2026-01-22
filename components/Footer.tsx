'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-background border-t mt-12">
      <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground flex items-center justify-between">
        <div>© {new Date().getFullYear()} LINE Rich Menu Maker</div>
        <div>
          Built with ❤️ — <a className="underline" href="https://example.com" target="_blank" rel="noreferrer">Docs</a>
        </div>
      </div>
    </footer>
  );
}
