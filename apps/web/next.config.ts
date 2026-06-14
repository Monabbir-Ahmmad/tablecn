import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const nextConfig: NextConfig = {
  transpilePackages: ["@monabbir/tablecn"],
  // Let `page.mdx` files act as routes alongside ts/tsx.
  pageExtensions: ["ts", "tsx", "mdx"],
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
