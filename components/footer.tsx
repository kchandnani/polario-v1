import Link from "next/link"
import Image from "next/image"
import { Container } from "@/components/container"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <Container className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
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
              <span className="text-lg font-bold text-primary">Polario</span>
            </div>
            <p className="text-sm text-muted-foreground">AI-powered brochure generation for modern businesses.</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-muted-foreground hover:text-foreground">
                  Create Brochure
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2024 Polario. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}
