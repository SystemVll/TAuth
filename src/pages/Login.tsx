import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import Logo from '@Assets/logo.png';
import { Input } from '@Components/ui/input';
import Session from '@Services/Session';
import { invoke } from '@tauri-apps/api/core';

type Inputs = {
    password: string;
};

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

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
                Session.set('password', password);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 px-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-10"
            >
                <img src={Logo} alt="Tauth" className="h-24 w-auto drop-shadow-md" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full max-w-md"
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