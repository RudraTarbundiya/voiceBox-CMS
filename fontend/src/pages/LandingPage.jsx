import React from "react";
import { Hero } from "../components/ui/Hero";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function LandingPage() {
    const { user, loading } = useAuth();

    // If already logged in, redirect to dashboard based on role
    if (!loading && user) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'coordinator') return <Navigate to="/coordinator" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    // The Top Navbar is managed by RootLayout.
    return (
        <div className="min-h-screen bg-background text-foreground -mt-16">
            <Hero />
        </div>
    );
}
