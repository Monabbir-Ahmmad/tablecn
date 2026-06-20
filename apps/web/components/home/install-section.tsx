"use client"

import * as React from "react"
import Link from "next/link"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const INSTALL_COMMAND =
  "pnpm dlx shadcn@latest add https://monabbir-ahmmad.github.io/shadcn-react-table/r/data-table.json"

const SNIPPET = `import { DataTable, useDataTable } from "@/components/ui/data-table"

function Users({ data, columns }) {
  const table = useDataTable({ data, columns })
  return <DataTable table={table} />
}`

/**
 * The "start in seconds" section: a copyable registry command plus the minimal
 * useDataTable + DataTable snippet.
 */
export function InstallSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Drop it in with the shadcn CLI
        </h2>
        <p className="mt-4 text-muted-foreground text-pretty">
          One command installs the table source, the primitives it uses in your
          style, and its dependencies.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 lg:grid-cols-2">
        <CommandBlock />
        <pre className="overflow-x-auto border bg-card p-4 text-[13px] leading-relaxed">
          <code className="font-mono">{SNIPPET}</code>
        </pre>
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/docs/installation">Read the installation guide →</Link>
        </Button>
      </div>
    </section>
  )
}

function CommandBlock() {
  const [copied, setCopied] = React.useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(INSTALL_COMMAND).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex flex-col border bg-card">
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Terminal
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={copied ? "Copied" : "Copy install command"}
          onClick={copy}
        >
          {copied ? (
            <RiCheckLine className={cn("text-primary")} />
          ) : (
            <RiFileCopyLine />
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        <code className="font-mono text-[13px] leading-relaxed whitespace-pre">
          <span className="text-muted-foreground select-none">$ </span>
          {INSTALL_COMMAND}
        </code>
      </div>
    </div>
  )
}
