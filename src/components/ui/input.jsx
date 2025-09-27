import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type,  required = false, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        `w-full px-3 py-2 border rounded-md 
         focus:outline-none focus:ring-2 focus:ring-[#c7b740] 
         focus:border-[#c7b740] transition`,
        required && !props.value && 'border-red-500',
        className
      )}
      ref={ref}
      required={required}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
