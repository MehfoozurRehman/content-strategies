import React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef(({ title, className, multiple, required = false, ...props }, ref) => {
  return (
    <div className="w-full">
      {title && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-muted-foreground mb-2"
        >
          {title}
        </label>
      )}

      <select
        id={props.id}
        multiple={multiple} 
        className={cn(
          "flex h-auto w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          multiple ? "h-32 overflow-auto" : "", 
          className
        )}
        ref={ref}
        required={required}
        {...props}
      >
        {props.children}
      </select>
    </div>
  );
});

Select.displayName = "Select";

export { Select };
