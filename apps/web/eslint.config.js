import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config[]} */
export default [
  // Never lint build output (the static export bundles its own minified JS).
  { ignores: ["out/**", ".next/**"] },
  ...(Array.isArray(nextJsConfig) ? nextJsConfig : [nextJsConfig]),
]
