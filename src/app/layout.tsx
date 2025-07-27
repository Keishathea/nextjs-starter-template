import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgriScan - Rice Disease Detection',
  description: 'Mobile application for detecting rice diseases through real-time image scanning',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-md mx-auto px-4 py-3">
              <h1 className="text-xl font-bold text-center text-gray-900">
                AgriScan
              </h1>
            </div>
          </header>
          <main className="flex-1 max-w-md mx-auto w-full">
            {children}
          </main>
          <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="max-w-md mx-auto px-4 py-3">
              <p className="text-xs text-center text-gray-500">
                © 2024 AgriScan. Helping farmers detect rice diseases.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
