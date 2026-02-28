import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReduxProvider } from '@/components/ReduxProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LINE Rich Menu Maker',
  description: 'Create, edit, and manage your LINE rich menus with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
  {/* Structured Data for SEO */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Linerichmenu',
        url: 'https://bookchaowalit-linerichmenu.vercel.app',
        description: 'Linerichmenu by Bookchaowalit - A modern web application',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        author: {
          '@type': 'Person',
          name: 'Bookchaowalit',
          url: 'https://bookchaowalit.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Bookchaowalit',
          url: 'https://bookchaowalit.com'
        }
      })
    }}
  />

  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Linerichmenu',
        url: 'https://bookchaowalit-linerichmenu.vercel.app',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://bookchaowalit-linerichmenu.vercel.app/more-projects',
          'query-input': 'required name=search_term'
        }
      })
    }}
  />


        <ReduxProvider>
          <div className="min-h-screen flex flex-col">
            <div>
              <Navbar />
            </div>

            <main className="flex-1">
              {children}
            </main>

            <Footer />
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}

// SEO TODO: Add Open Graph tags for social sharing
