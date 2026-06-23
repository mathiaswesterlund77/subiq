"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-yellow-400/80",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-checked:translate-x-[18px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
