import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const CustomSpinner = ({ className,width=80,height=80 }) => {
  return (
    <Image
      src="/loading.svg" 
      alt="Loading..."
      width={width}
      height={height}
      className={cn("",className)} 
    />
  );
};
