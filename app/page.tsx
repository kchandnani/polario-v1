import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/container"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2">
              AI-Powered Brochure Generation
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance leading-tight">
              Transform Ideas Into
              <span className="text-primary block lg:inline"> Professional Brochures</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Drop your images, add some text, and let AI create stunning professional brochures in minutes. Simple,
              fast, and powerful.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8 py-3">
                <Link href="/create">Create Brochure</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base px-8 py-3">
                <Link href="/dashboard">View Examples</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-background">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
              <p className="text-lg text-muted-foreground">Three simple steps to create professional brochures</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Add Your Info</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Enter your business name, description, and drop your images. That's it.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-4">AI Generation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our AI analyzes your input and generates professional copy, layout, and design elements.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Download & Share</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get your polished brochure in PDF format, ready for print or digital distribution.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Template Examples Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">AI-Generated Designs</h2>
              <p className="text-lg text-muted-foreground">
                Professional layouts created automatically for any business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Tech Startup", category: "SaaS", color: "from-blue-500/20 to-blue-600/20" },
                { title: "Restaurant", category: "Food & Beverage", color: "from-orange-500/20 to-orange-600/20" },
                { title: "Real Estate", category: "Property", color: "from-green-500/20 to-green-600/20" },
                { title: "Healthcare", category: "Medical", color: "from-red-500/20 to-red-600/20" },
                { title: "Consulting", category: "Professional Services", color: "from-purple-500/20 to-purple-600/20" },
                { title: "E-commerce", category: "Retail", color: "from-pink-500/20 to-pink-600/20" },
              ].map((template, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`aspect-[3/4] bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                    <div className="text-center space-y-3">
                      <div className="w-20 h-20 bg-primary/30 rounded-xl mx-auto flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{template.title.charAt(0)}</span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{template.title}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {template.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <Container>
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready to Create Your First Brochure?</h2>
            <p className="text-lg lg:text-xl opacity-90 leading-relaxed">
              Join thousands of businesses already using Polario to create professional marketing materials.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-base px-8 py-3">
              <Link href="/create">Create Now</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  )
}
