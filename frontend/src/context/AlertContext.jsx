/**
 * Alert Context
 * Global toast/alert notification system
 */

import { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext(null);

/**
 * Alert Provider Component
 */
export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    /**
     * Show an alert
     * @param {string} type - 'success' | 'error' | 'warning' | 'info'
     * @param {string} message - Alert message
     * @param {number} duration - Auto-dismiss duration in ms (default 5000)
     */
    const showAlert = useCallback((type, message, duration = 5000) => {
        const id = Date.now();

        setAlerts(prev => [...prev, { id, type, message }]);

        // Auto-dismiss after duration
        setTimeout(() => {
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        }, duration);
    }, []);

    /**
     * Dismiss a specific alert
     */
    const dismissAlert = useCallback((id) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    /**
     * Clear all alerts
     */
    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    return (
        <AlertContext.Provider value={{ alerts, showAlert, dismissAlert, clearAlerts }}>
            {children}
            {/* Alert Container */}
            <AlertContainer alerts={alerts} dismissAlert={dismissAlert} />
        </AlertContext.Provider>
    );
};

/**
 * Alert Container Component
 * Renders alerts in fixed position
 */
const AlertContainer = ({ alerts, dismissAlert }) => {
    if (alerts.length === 0) return null;

    const getAlertStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-500 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-500 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-500 text-yellow-800';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-500 text-blue-800';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`flex items-center gap-3 px-4 py-3 border-l-4 rounded-lg shadow-lg animate-fade-in ${getAlertStyles(alert.type)}`}
                >
                    <span className="text-lg">{getIcon(alert.type)}</span>
                    <p className="flex-1 text-sm font-medium">{alert.message}</p>
                    <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

/**
 * Custom hook to use alert context
 */
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

export default AlertContext;
