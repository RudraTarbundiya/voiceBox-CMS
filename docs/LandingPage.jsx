import React from "react";
import { Hero } from "../../components/ui/Hero";
import { useAuth } from "../frontend/src/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function LandingPage() {
    const { user, loading } = useAuth();

    // If already logged in, redirect to dashboard based on role
    if (!loading && user) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'coordinator') return <Navigate to="/coordinator" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Hero />
        </main>
    );
}
