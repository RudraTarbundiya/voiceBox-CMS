import React from "react";
import { cn } from "../../utils/cn";

export function Badge({ className, variant = "default", ...props }) {
    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",

        // Status badges matching docs
        new: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        assigned: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        in_progress: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
        resolved: "border-transparent bg-green-500 text-white hover:bg-green-600",
        closed: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant.toLowerCase()],
                className
            )}
            {...props}
        />
    );
}
