import type { CSSProperties } from "react"
import { Geist, Geist_Mono, Raleway, Noto_Serif } from "next/font/google"

import "@monabbir/tablecn/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { IconLibraryProvider } from "@/components/icon-library-provider"
import { cn } from "@monabbir/tablecn/lib/utils"

// Each font gets its own CSS variable so the theme customizer can switch
// --font-sans / --font-heading between them at runtime.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" })
const notoSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-noto-serif" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        geist.variable,
        raleway.variable,
        notoSerif.variable,
        geistMono.variable
      )}
      // Defaults the customizer can override on <html>.
      style={
        {
          "--font-sans": "var(--font-raleway)",
          "--font-heading": "var(--font-noto-serif)",
        } as CSSProperties
      }
    >
      <body>
        <ThemeProvider>
          <IconLibraryProvider>{children}</IconLibraryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
