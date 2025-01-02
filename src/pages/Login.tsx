import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { invoke } from '@tauri-apps/api/core';
import { Link, useNavigate } from 'react-router-dom';

import { Input } from '@Components/ui/input';
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

import Session from '@Services/Session';

import Logo from '@Assets/logo.png';

type Inputs = {
    password: string;
};

const Login: React.FC = () => {
    const navigate = useNavigate();

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

        const { password } = data;
        const response = await invoke('login', { password });

        if (response) {
            Session.set('password', password);
            return navigate('/manager');
        }

        alert('Invalid password');
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4 space-y-4">
                <div className="flex justify-center">
                    <img src={Logo} alt="Tauth" className="h-16 w-auto" />
                </div>
                <CardHeader className="text-center">
                    <CardDescription>
                        Your passphrase is used to decrypt your vault. It is
                        never stored or sent to any server.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <Input
                            type="password"
                            placeholder="Type your password"
                            {...register('password', {
                                required: true,
                                minLength: 8,
                                maxLength: 32,
                            })}
                        />
                        {errors.password &&
                            errors.password.type === 'maxLength' && (
                                <small className="text-red-500 text-center">
                                    The password cannot be longer than 32
                                    characters
                                </small>
                            )}
                        {errors.password &&
                            errors.password.type === 'minLength' && (
                                <small className="text-red-500 text-center">
                                    The password must be at least 8 characters
                                </small>
                            )}
                        {errors.password &&
                            errors.password.type === 'required' && (
                                <small className="text-red-500 text-center">
                                    This field is required
                                </small>
                            )}
                        <p className="text-center">Press enter to submit</p>
                    </form>
                </CardContent>
                <CardFooter className="text-center">
                    <p className="text-sm text-gray-500">
                        You forgot your password? Reset your container password{' '}
                        <Link to="/reset-container" className="text-blue-500">
                            here
                        </Link>
                    </p>
                </CardFooter>
            </div>
        </div>
    );
};

export default Login;
