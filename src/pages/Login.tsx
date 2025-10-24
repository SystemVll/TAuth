import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useVault } from '@/context/VaultContext';
import Logo from '@Assets/logo.png';
import { Input } from '@Components/ui/input';
import { invoke } from '@tauri-apps/api/core';

type Inputs = {
    password: string;
};

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shakeKey, setShakeKey] = useState(0);
    const { setPassword } = useVault();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<Inputs>();

    const passwordValue = watch('password');

    useEffect(() => {
        if (passwordValue) {
            setShakeKey(prev => prev + 1);
        }
    }, [passwordValue]);

    useEffect(() => {
        (async () => {
            const exists = await invoke('exists');
            if (!exists) {
                navigate('/register');
            }
        })();
    }, []);

    const onSubmit = async (data: Inputs) => {
        if (errors.password) return;

        setIsLoading(true);
        setError(null);

        try {
            const { password } = data;
            const response = await invoke('login', { password });

            if (response) {
                setPassword(password);
                return navigate('/manager');
            }

            setError('Invalid password');
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-background/80 px-6 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.03, 0.05, 0.03],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.03, 0.05, 0.03],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-3xl"
                />
            </div>

            {/* Logo with enhanced size and animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center mb-12 relative z-10"
            >
                <motion.div
                    key={shakeKey}
                    animate={{
                        rotate: [0, 5, -5, 0],
                        x: [0, -10, 10, -10, 10, 0],
                    }}
                    transition={{
                        rotate: {
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        },
                        x: {
                            duration: 0.4,
                            ease: "easeInOut"
                        }
                    }}
                >
                    <img src={Logo} alt="Tauth" className="h-40 w-auto drop-shadow-2xl" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4 text-center"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        TAuth
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Secure Credential Manager</p>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                    <p className="text-muted-foreground text-sm">
                        Your passphrase is used to decrypt your vault. It is
                        never stored or sent to any server.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            className={`transition-all duration-200 ${errors.password || error ? 'border-red-400 focus-visible:ring-red-400' : 'focus-visible:ring-primary'}`}
                            disabled={isLoading}
                            aria-invalid={errors.password ? "true" : "false"}
                            {...register('password', {
                                required: true,
                                minLength: 8,
                                maxLength: 32,
                            })}
                        />

                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-500 text-sm"
                            >
                                {errors.password.type === 'required' && 'Password is required'}
                                {errors.password.type === 'minLength' && 'Password must be at least 8 characters'}
                                {errors.password.type === 'maxLength' && 'Password cannot exceed 32 characters'}
                            </motion.p>
                        )}

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-sm"
                            >
                                {error}
                            </motion.p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full transition-all h-12 text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Unlocking...' : 'Unlock Vault'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Forgot your password?{' '}
                        <Link
                            to="/reset-container"
                            className="text-primary hover:underline font-medium transition-colors"
                        >
                            Reset your container
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;