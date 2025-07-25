import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { useVault } from '@/context/VaultContext';
import { Button } from '@Components/ui/button';
import { Card, CardHeader } from '@Components/ui/card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut,
    DropdownMenuTrigger
} from '@Components/ui/dropdown-menu';
import { Textarea } from '@Components/ui/textarea';
import EditCredential from '@Features/manager/components/EditCredential';
import { useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

import DeleteConfirmDialog from './DeleteConfirmDialog';

type CredentialCardProps = {
    uid: string;
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
    uid,
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
    const { password: vaultPassword, updateActivity } = useVault();
    const [twoFactorCode, setTwoFactorCode] = useState(' - - - - - - ');
    const [editOpen, setEditOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const removeCredential = async () => {
        updateActivity();

        await invoke('remove_credentials', {
            password: vaultPassword,
            uid: uid,
        });

        queryClient.invalidateQueries({
            queryKey: ['credentials'],
        });
        setDeleteDialogOpen(false);
    };

    const showTwoFactor = async () => {
        updateActivity();

        const element = document.getElementById(`show-${uid}`);

        if (element!.innerText !== 'Show') {
            return;
        }

        const { code } = (await invoke('resolve_twofactor', {
            password: vaultPassword,
            uid: uid,
        })) as { code: string };

        setTwoFactorCode(code);

        element!.innerText = '6';
        const interval = setInterval(() => {
            element!.innerText = (Number(element!.innerText) - 1).toString();
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            document.getElementById(`show-${uid}`)!.innerText = 'Show';

            setTwoFactorCode(' - - - - - - ');
        }, 6000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleEdit = () => {
        updateActivity();
        setEditOpen(true);
    };

    return (
        <>
            <Card>
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
                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent active:border-none hover:text-[#d6deeb]">
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={handleEdit}
                                    >
                                        Edit
                                        <DropdownMenuShortcut>
                                            ⌘E
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-500 hover:bg-red-100 cursor-pointer"
                                        onClick={() => {
                                            updateActivity();
                                            setDeleteDialogOpen(true);
                                        }}
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
                                                id={`show-${uid}`}
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
                <EditCredential
                    isOpen={editOpen}
                    onOpenChange={setEditOpen}
                    uid={uid}
                    type={type}
                    credentials={{
                        website,
                        username,
                        password,
                        twoFactor: twoFactor ? 'true' : '',
                        privateKey,
                        publicKey,
                        host
                    }}
                />
            </Card>
            <DeleteConfirmDialog
                deleteDialogOpen={deleteDialogOpen}
                setDeleteDialogOpen={setDeleteDialogOpen}
                onClick={removeCredential}
            />
        </>
    );
};

export default CredentialCard;