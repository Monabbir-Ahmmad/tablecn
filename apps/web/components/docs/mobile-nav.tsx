"use client"

import { RiMenuLine } from "@remixicon/react"
import * as React from "react"

import { Button } from "@monabbir/tablecn/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@monabbir/tablecn/components/sheet"

import { DocsSidebar } from "@/components/docs/sidebar"

/**
 * Mobile-only docs navigation. A hamburger button opens the full sidebar in a
 * left drawer; following any nav link closes the drawer (delegated click).
 */
export function DocsMobileNav() {
  const [open, setOpen] = React.useState(false)

  // Close when a nav link is followed (the sidebar is all links + headings).
  const handleClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost"
          size="icon-sm">
          <RiMenuLine className="size-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 max-w-[80vw]">
        <SheetHeader className="border-b">
          <SheetTitle>Documentation</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-2 pb-6" onClick={handleClick}>
          <DocsSidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}
