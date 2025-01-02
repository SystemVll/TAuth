import { useForm } from 'react-hook-form';
import { invoke } from '@tauri-apps/api/core';
import { Input } from '@Components/ui/input';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Session from '@Services/Session';

type Inputs = {
    password: string;
    repeatPassword: string;
};

const Register: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    async function createContainer(password: string) {
        return await invoke('register', { password });
    }

    const onSubmit = async (data: Inputs) => {
        await createContainer(data.password);
        Session.set('password', data.password);
        return navigate('/manager');
    };

    return (
        <div className="w-full p-4 space-y-4 text-center">
            <CardHeader>
                <CardTitle>PC Auth</CardTitle>
                <CardDescription>
                    Your passphrase is used to decrypt your private key. It is
                    not stored anywhere and is not sent to any server.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Type your password"
                        {...register('password', {
                            required: true,
                            minLength: 8,
                            maxLength: 32,
                        })}
                    />
                    {errors.password && errors.password.type === 'required' && (
                        <p className="text-red-500">This field is required</p>
                    )}
                    <Input
                        type="password"
                        placeholder="Repeat your password"
                        {...register('repeatPassword', { required: true })}
                    />
                    {errors.password && (
                        <p className="text-red-500">This field is required</p>
                    )}
                    <Button type="submit">Register</Button>
                </form>
            </CardContent>
        </div>
    );
};

export default Register;
