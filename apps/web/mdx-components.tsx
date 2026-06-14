import type { MDXComponents } from "mdx/types"
import Link from "next/link"

import { cn } from "@monabbir/tablecn/lib/utils"
import { ApiTable } from "@/components/docs/api-table"
import { Callout } from "@/components/docs/callout"
import { Example } from "@/components/docs/example"

// Provides element styling + custom components to every MDX page in the app.
// https://nextjs.org/docs/app/guides/mdx
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "mt-2 scroll-m-20 text-3xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0",
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }) => (
      <h4
        className={cn(
          "mt-6 scroll-m-20 text-lg font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn("leading-7 [&:not(:first-child)]:mt-5", className)}
        {...props}
      />
    ),
    a: ({ className, href = "", ...props }) => {
      const isInternal = href.startsWith("/") || href.startsWith("#")
      const cls = cn(
        "font-medium text-primary underline underline-offset-4",
        className
      )
      return isInternal ? (
        <Link href={href} className={cls} {...props} />
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cls}
          {...props}
        />
      )
    },
    ul: ({ className, ...props }) => (
      <ul className={cn("my-5 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn("my-5 ml-6 list-decimal [&>li]:mt-2", className)}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("leading-7", className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "mt-5 border-l-2 pl-4 text-muted-foreground italic",
          className
        )}
        {...props}
      />
    ),
    hr: ({ className, ...props }) => (
      <hr className={cn("my-10 border-border", className)} {...props} />
    ),
    table: ({ className, ...props }) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg border">
        <table className={cn("w-full border-collapse text-sm", className)} {...props} />
      </div>
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "border-b bg-muted/50 px-3 py-2 text-left font-medium",
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td className={cn("border-b px-3 py-2 align-top last:border-0", className)} {...props} />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "relative rounded bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm",
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "my-6 overflow-x-auto rounded-lg border bg-muted/40 p-4 text-sm [&>code]:bg-transparent [&>code]:p-0",
          className
        )}
        {...props}
      />
    ),
    // Custom doc components (usable in MDX without importing).
    ApiTable,
    Callout,
    Example,
    ...components,
  }
}
