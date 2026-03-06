import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Mic } from 'lucide-react';
import { Button } from '../ui/button';

export default function RootLayout() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Mic className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Voice<span className="text-primary">Box</span></span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-full p-2 transition-colors hover:bg-muted"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <div className="hidden space-x-2 sm:block">
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-16">
                <Outlet />
            </main>

            <footer className="border-t bg-muted/30 py-6 text-center text-sm text-muted-foreground">
                <div className="container mx-auto">
                    <p>© {new Date().getFullYear()} VoiceBox College Complaint Management System.</p>
                </div>
            </footer>
        </div>
    );
}
