import React, { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children, className }) {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setIsRendered(true);
    }, [isOpen]);

    if (!isRendered) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div
                className={cn(
                    "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-300 sm:rounded-lg",
                    isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95",
                    className
                )}
                onTransitionEnd={() => {
                    if (!isOpen) setIsRendered(false);
                }}
            >
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-between">
                        {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
                        <button
                            onClick={onClose}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </div>
                <div className="max-h-[80vh] overflow-y-auto pr-2">
                    {children}
                </div>
            </div>
        </div>
    );
}
