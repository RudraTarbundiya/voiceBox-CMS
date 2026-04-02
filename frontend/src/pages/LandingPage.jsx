import React from "react";
import { Hero } from "../components/ui/Hero";

export default function LandingPage() {
    // The Top Navbar is managed by RootLayout.
    return (
        <div className="min-h-screen bg-background text-foreground -mt-16">
            <Hero />
        </div>
    );
}
