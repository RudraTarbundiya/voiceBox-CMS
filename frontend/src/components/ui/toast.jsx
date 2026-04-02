import { Toaster } from 'react-hot-toast';

export function AppToaster() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    padding: '12px 16px',
                    fontSize: '0.875rem',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.4)',
                },
                success: {
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #22c55e',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #ef4444',
                    },
                },
            }}
        />
    );
}
