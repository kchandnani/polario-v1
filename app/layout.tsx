import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from './ConvexClientProvider'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Polario - AI Brochure Generator",
  description:
    "Transform your business ideas into professional brochures with AI-powered design and content generation.",
  generator: "Polario",
  icons: {
    icon: [
      { url: "/polario-icon.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/polario-icon.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [{ url: "/polario-icon.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
        <body className="font-sans antialiased min-h-screen flex flex-col">
          <ConvexClientProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </Suspense>
          </ConvexClientProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
