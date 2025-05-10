import { Eye, EyeOff, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useVault } from '@/context/VaultContext';
import { Input } from '@Components/ui/input';
import { invoke } from '@tauri-apps/api/core';

type Inputs = {
    password: string;
    repeatPassword: string;
};

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setPassword } = useVault();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setError: setFormError,
    } = useForm<Inputs>();

    const password = watch('password', '');

    async function createContainer(password: string) {
        return await invoke('register', { password });
    }

    const onSubmit = async (data: Inputs) => {
        setError(null);

        if (data.password !== data.repeatPassword) {
            setFormError('repeatPassword', {
                type: 'manual',
                message: 'Passwords do not match'
            });
            return;
        }

        try {
            setIsLoading(true);
            await createContainer(data.password);

            setPassword(data.password);

            navigate('/manager');
        } catch (error) {
            console.error('Registration failed:', error);
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background p-4">
            <div className="flex flex-col items-center mb-6 mt-8">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h1 className="text-2xl font-bold text-center">Secure Registration</h1>
                <p className="text-muted-foreground text-center mt-2 px-4">
                    Create a strong password to protect your credentials.
                    It's not stored anywhere and never sent to any server.
                </p>
            </div>
            <div className="w-full px-2">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                className="pr-10 w-full"
                                {...register('password', {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    },
                                    maxLength: {
                                        value: 32,
                                        message: "Password cannot exceed 32 characters"
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/,
                                        message: "Password must include uppercase, lowercase, and numbers"
                                    }
                                })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                            Password must:
                            <ul className="list-disc pl-5 mt-1">
                                <li className={password.length >= 8 ? "text-green-500" : ""}>
                                    Be at least 8 characters long
                                </li>
                                <li className={password.length <= 32 ? "text-green-500" : ""}>
                                    Not exceed 32 characters
                                </li>
                                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                                    Include at least one uppercase letter
                                </li>
                                <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>
                                    Include at least one number
                                </li>
                            </ul>
                        </div>

                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="repeatPassword" className="text-sm font-medium">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="repeatPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Repeat your password"
                                className="pr-10 w-full"
                                {...register('repeatPassword', {
                                    required: "Please confirm your password",
                                    validate: value => value === password || "Passwords do not match"
                                })}
                            />
                        </div>
                        {errors.repeatPassword && (
                            <p className="text-red-500 text-sm">{errors.repeatPassword.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full py-6 text-lg font-medium mt-8"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : (
                            "Register"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Register;