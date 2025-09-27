import React from "react";
import { Button } from "@/components/ui/button";
// import { Spinner } from "./Spinner";
import clsx from "clsx";
import { appColors } from "@/lib/theme";
import Spinner from "../loading";

export default function CustomButton({
    onClick,
    loading,
    disabled,
    title,
    // buttonColor = appColors.buttonColor,
    className,
    style,
    type,
    children
}) {
    return (
        <Button
            onClick={!loading && !disabled ? onClick : null}
            disabled={loading || disabled}
            style={{ ...style  }}
            type={type}
            className={clsx(
                "w-full bg-[#3a86ff] hover:bg-[#2f6fcb] !hover:cursor-pointer  text-white font-bold py-2 rounded-md transition mb-4 mt-4",
                className
            )}
        >
            {loading ? (
                <Spinner className="h-5" />
            ) : (
                <>
                    {title}
                    {children}
                </>
            )}
        </Button>
    );
}
