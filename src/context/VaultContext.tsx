import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface VaultContextType {
    password: string | null;
    setPassword: (password: string) => void;
    clearPassword: () => void;
    isUnlocked: boolean;
    lastActivity: number;
    updateActivity: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000;

export const VaultProvider = ({ children }: { children: ReactNode }) => {
    const [password, setPasswordState] = useState<string | null>(null);
    const [lastActivity, setLastActivity] = useState(Date.now());

    const setPassword = (newPassword: string) => {
        setPasswordState(newPassword);
        updateActivity();
    };

    const clearPassword = () => {
        setPasswordState(null);
    };

    const updateActivity = useCallback(() => {
        setLastActivity(prevTime => {
            const now = Date.now();
            if (now - prevTime > 500) {
                return now;
            }
            return prevTime;
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (password && Date.now() - lastActivity > AUTO_LOCK_TIMEOUT) {
                clearPassword();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [password, lastActivity]);

    useEffect(() => {
        if (password) {
            const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
            const handleActivity = () => updateActivity();

            activityEvents.forEach(event => {
                window.addEventListener(event, handleActivity);
            });

            return () => {
                activityEvents.forEach(event => {
                    window.removeEventListener(event, handleActivity);
                });
            };
        }
    }, [password]);

    return (
        <VaultContext.Provider
            value={{
                password,
                setPassword,
                clearPassword,
                isUnlocked: !!password,
                lastActivity,
                updateActivity
            }}
        >
            {children}
        </VaultContext.Provider>
    );
};

export const useVault = () => {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};