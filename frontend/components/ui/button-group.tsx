import * as React from "react"
import { cn } from "@/lib/utils"

function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group"
      role="group"
      className={cn(
        "flex items-center",
        "[&>*]:relative",
        "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none",
        "[&>*:not(:last-child)]:rounded-r-none",
        "[&>*:hover]:z-10 [&>*:focus-visible]:z-10",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup }
