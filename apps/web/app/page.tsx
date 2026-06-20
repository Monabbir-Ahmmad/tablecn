import type { Metadata } from "next"

import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/home/hero"
import { FeatureGrid } from "@/components/home/feature-grid"
import { WhySection } from "@/components/home/why-section"
import { InstallSection } from "@/components/home/install-section"
import { SiteFooter } from "@/components/home/site-footer"

export const metadata: Metadata = {
  title: "Shadcn React Table — a data table with Material React Table parity",
  description:
    "A shadcn/ui data table with Material React Table (MRT V3) parity, built on TanStack Table v8 and installed as source you own via the shadcn registry.",
}

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <WhySection />
        <InstallSection />
      </main>
      <SiteFooter />
    </div>
  )
}
