"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Logo with proper sizing */}
              <div className="flex items-center justify-center w-8 h-8">
                <Image 
                  src="/polario-icon.svg" 
                  alt="Polario" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 text-primary"
                />
              </div>
              {/* Brand text */}
              <span className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                Polario
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground",
                  "px-3 py-2 rounded-md",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/create"
                className={cn(
                  "text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground",
                  "px-3 py-2 rounded-md",
                )}
              >
                Create
              </Link>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/waitlist">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="py-4 space-y-4">
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary hover:text-secondary-foreground rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary hover:text-secondary-foreground rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create
                </Link>
              </nav>
              <div className="px-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/waitlist" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </nav>
  )
}
