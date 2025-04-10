import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { FeaturedCakes } from "@/components/featured-cakes"
import { HeroSection } from "@/components/hero-section"
import { Promotions } from "@/components/promotions"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCakes />
        <Promotions />
      </main>
      <Footer />
    </div>
  )
}
