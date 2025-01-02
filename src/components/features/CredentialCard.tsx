import { useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@Components/ui/button';
import { Card, CardHeader } from '@Components/ui/card';
import { Textarea } from '@Components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@Components/ui/dropdown-menu';

import Session from '@Services/Session';

type CredentialCardProps = {
    id: number;
    type: 'account' | 'keypair';
    credentials: {
        website?: string;
        username?: string;
        password?: string;
        twoFactor?: boolean;
        privateKey?: string;
        publicKey?: string;
        host?: string;
    };
};

const CredentialCard: React.FC<CredentialCardProps> = ({
    id,
    type,
    credentials: {
        website,
        username,
        password,
        twoFactor,
        privateKey,
        publicKey,
        host,
    },
}) => {
    const queryClient = useQueryClient();
    const [twoFactorCode, setTwoFactorCode] = useState(' - - - - - - ');

    const removeCredential = async () => {
        await invoke('remove_credentials', {
            password: Session.get('password'),
            index: id,
        });

        queryClient.invalidateQueries({
            queryKey: ['credentials'],
        });
    };

    const showTwoFactor = async () => {
        const element = document.getElementById(`show-${id}`);

        if (element!.innerText !== 'Show') {
            return;
        }

        const { code } = (await invoke('resolve_twofactor', {
            password: Session.get('password'),
            index: id,
        })) as { code: string };

        setTwoFactorCode(code);

        element!.innerText = '6';
        const interval = setInterval(() => {
            console.log(element!.innerText);
            element!.innerText = (Number(element!.innerText) - 1).toString();
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            document.getElementById(`show-${id}`)!.innerText = 'Show';

            setTwoFactorCode(' - - - - - - ');
        }, 6000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Card className="rounded-md">
            <CardHeader className="p-3">
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">
                            {website || host}
                        </h1>
                    </div>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {type === 'account' && (
                                    <DropdownMenuItem className="cursor-pointer">
                                        Two Factor
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100 cursor-pointer"
                                    onClick={removeCredential}
                                >
                                    Delete
                                    <DropdownMenuShortcut>
                                        ⌘⌫
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="mt-2 space-y-2">
                    {type === 'account' && (
                        <>
                            <div className="rounded-md p-1.5 text-center text-[#d6deeb] bg-[#272727] border border-[#383838]">
                                <p
                                    className="cursor-pointer copy-animation"
                                    onClick={() =>
                                        copyToClipboard(username || '')
                                    }
                                >
                                    {username}
                                </p>
                            </div>
                            <div className="rounded-md p-1.5 text-center text-[#d6deeb] bg-[#272727] border border-[#383838]">
                                <p
                                    className="cursor-pointer copy-animation blur-sm hover:blur-none transition-all"
                                    onClick={() =>
                                        copyToClipboard(password || '')
                                    }
                                >
                                    {password}
                                </p>
                            </div>
                            {twoFactor && (
                                <div className="grid grid-cols-12">
                                    <div className="col-span-4">
                                        <Button
                                            className="rounded-r-none w-full bg-[#4d3600] hover:bg-[#4d3600] border-[#ffc233] hover:text-[#c2c2c2]"
                                            variant="outline"
                                            id={`show-${id}`}
                                            onClick={showTwoFactor}
                                        >
                                            Show
                                        </Button>
                                    </div>
                                    <div className="col-span-8">
                                        <div className="rounded-e-md p-1.5 text-center text-[#d6deeb] bg-[#272727] border border-[#383838]">
                                            <p
                                                className="cursor-pointer copy-animation"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        twoFactorCode,
                                                    )
                                                }
                                            >
                                                {twoFactorCode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {type === 'keypair' && (
                        <>
                            <p className="text-[#d6deeb]">
                                <Textarea
                                    defaultValue={publicKey}
                                    readOnly
                                    onClick={() =>
                                        copyToClipboard(publicKey || '')
                                    }
                                />
                            </p>
                            <p className="text-[#d6deeb]">
                                <Textarea
                                    defaultValue={privateKey}
                                    readOnly
                                    onClick={() =>
                                        copyToClipboard(privateKey || '')
                                    }
                                />
                            </p>
                        </>
                    )}
                </div>
            </CardHeader>
        </Card>
    );
};

export default CredentialCard;
