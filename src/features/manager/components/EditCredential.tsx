import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import { useVault } from '@/context/VaultContext';
import { cn } from '@/lib/utils';
import { Button } from '@Components/ui/button';
import { CardContent, CardDescription, CardHeader } from '@Components/ui/card';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@Components/ui/command';
import {
    Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle
} from '@Components/ui/drawer';
import { Input } from '@Components/ui/input';
import { Label } from '@Components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@Components/ui/popover';
import { Textarea } from '@Components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

type EditCredentialProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    uid: string;
    type: 'account' | 'keypair';
    credentials: {
        website?: string;
        username?: string;
        password?: string;
        twoFactor?: string;
        privateKey?: string;
        publicKey?: string;
        host?: string;
    };
}

const EditCredential: React.FC<EditCredentialProps> = ({
    isOpen,
    onOpenChange,
    uid,
    type,
    credentials
}) => {
    const queryClient = useQueryClient();
    const { password: vaultPassword, updateActivity } = useVault();
    const [open, setOpen] = useState(false);
    const [schemeValue, setSchemeValue] = useState('ssh://');

    const {
        register: registerAccount,
        handleSubmit: handleSubmitAccount,
        formState: { errors: errorsAccount },
        reset: resetAccountForm
    } = useForm();

    const {
        register: registerKeyPair,
        handleSubmit: handleSubmitKeyPair,
        formState: { errors: errorsKeyPair },
        reset: resetKeyPairForm
    } = useForm();

    useEffect(() => {
        if (isOpen) {
            updateActivity();

            if (type === 'account') {
                resetAccountForm({
                    website: credentials.website || '',
                    username: credentials.username || '',
                    password: credentials.password || '',
                    twoFactor: credentials.twoFactor || ''
                });
            } else if (type === 'keypair') {
                if (credentials.host) {
                    const hostParts = credentials.host.split('://');
                    if (hostParts.length > 1) {
                        setSchemeValue(`${hostParts[0]}://`);
                    }
                    resetKeyPairForm({
                        host: hostParts.length > 1 ? hostParts[1] : credentials.host,
                        publicKey: credentials.publicKey || '',
                        privateKey: credentials.privateKey || ''
                    });
                }
            }
        }
    }, [isOpen, credentials, type, resetAccountForm, resetKeyPairForm, updateActivity]);

    const onSubmitAccount: SubmitHandler<FieldValues> = async (data) => {
        updateActivity();

        const { website, username, password, twoFactor } = data;

        const credential: {
            website: string;
            username: string;
            password: string;
            twoFactor?: string;
        } = {
            website: website,
            username: username,
            password: password,
        };

        if (twoFactor !== '') {
            credential.twoFactor = twoFactor.toUpperCase();
        }

        await invoke('update_credential', {
            password: vaultPassword,
            uid: uid,
            credentialType: 'account',
            credential,
        });

        await queryClient.invalidateQueries({
            queryKey: ['credentials'],
        });

        onOpenChange(false);
    };

    const onSubmitKeyPair: SubmitHandler<FieldValues> = async (data) => {
        updateActivity();

        const { publicKey, privateKey, host } = data;
        await invoke('update_credential', {
            password: vaultPassword,
            uid: uid,
            credentialType: 'keypair',
            credential: {
                publicKey: publicKey,
                privateKey: privateKey,
                host: `${schemeValue}${host}`,
            },
        });

        await queryClient.invalidateQueries({
            queryKey: ['credentials'],
        });

        onOpenChange(false);
    };

    const schemes = [
        {
            value: 'ssh://',
            label: 'ssh://',
            placeholder: 'Enter your the SSH host here',
        },
        {
            value: 'https://',
            label: 'https://',
            placeholder: 'Enter your the TLS/SSL host here',
        },
        {
            value: 'serial://',
            label: 'serial://',
            placeholder: 'Enter your the serial COM here',
        },
        {
            value: 'wallet://',
            label: 'wallet://',
            placeholder: 'Enter the name of your wallet here',
        },
    ];

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Edit Credential</DrawerTitle>
                        <DrawerDescription>
                            Update your credential details.
                        </DrawerDescription>
                    </DrawerHeader>

                    {type === 'account' ? (
                        <form onSubmit={handleSubmitAccount(onSubmitAccount)}>
                            <CardHeader className="p-0">
                                <CardDescription>
                                    Make changes to your account here. Click
                                    save when you're done.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 p-0">
                                <div className="space-y-1">
                                    <Label>Website</Label>
                                    <Input
                                        type="text"
                                        {...registerAccount('website', {
                                            required: true,
                                        })}
                                    />

                                    {errorsAccount.website?.type ===
                                        'required' && (
                                            <small className="text-gray-500">
                                                Website is required.
                                            </small>
                                        )}
                                </div>
                                <div className="space-y-1">
                                    <Label>Username/Email</Label>
                                    <Input
                                        type="text"
                                        {...registerAccount('username', {
                                            required: true,
                                        })}
                                    />
                                    {errorsAccount.username?.type ===
                                        'required' && (
                                            <small className="text-gray-500">
                                                Username/Email is required.
                                            </small>
                                        )}
                                </div>
                                <div className="space-y-1">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        {...registerAccount('password', {
                                            required: true,
                                        })}
                                    />
                                    {errorsAccount.password?.type ===
                                        'required' && (
                                            <small className="text-gray-500">
                                                Password is required.
                                            </small>
                                        )}
                                </div>
                                <div className="space-y-1">
                                    <Label>2FA - Optional</Label>
                                    <Input
                                        type="password"
                                        {...registerAccount('twoFactor')}
                                    />
                                    <small className="text-gray-500">
                                        Leave empty if you don't have 2FA
                                        enabled. You can enable it later.
                                    </small>
                                </div>
                            </CardContent>
                            <DrawerFooter>
                                <div className="pt-3 flex justify-center">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </DrawerFooter>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitKeyPair(onSubmitKeyPair)}>
                            <CardHeader className="p-0">
                                <CardDescription>
                                    Update your public and private key here.
                                    Click save when you're done.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 p-0">
                                <div className="space-y-1">
                                    <Label>Host</Label>
                                    <div className="grid grid-cols-12">
                                        <div className="col-span-4">
                                            <Popover
                                                open={open}
                                                onOpenChange={setOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className="w-full rounded-r-none justify-between"
                                                    >
                                                        {schemeValue
                                                            ? schemes.find(
                                                                (scheme) =>
                                                                    scheme.value ===
                                                                    schemeValue,
                                                            )?.label
                                                            : 'Scheme...'}
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[200px] p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search scheme..."
                                                            className="h-9"
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No framework
                                                                found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {schemes.map(
                                                                    (scheme) => (
                                                                        <CommandItem
                                                                            key={
                                                                                scheme.value
                                                                            }
                                                                            value={
                                                                                scheme.value
                                                                            }
                                                                            onSelect={(
                                                                                currentValue,
                                                                            ) => {
                                                                                setSchemeValue(
                                                                                    currentValue ===
                                                                                        schemeValue
                                                                                        ? ''
                                                                                        : currentValue,
                                                                                );
                                                                                setOpen(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                scheme.label
                                                                            }
                                                                            <Check
                                                                                className={cn(
                                                                                    'ml-auto',
                                                                                    schemeValue ===
                                                                                        scheme.value
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0',
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                className="rounded-l-none"
                                                placeholder={
                                                    schemes.find(
                                                        (scheme) =>
                                                            scheme.value ===
                                                            schemeValue,
                                                    )?.placeholder
                                                }
                                                {...registerKeyPair(
                                                    'host',
                                                    {
                                                        required: true,
                                                    },
                                                )}
                                            />
                                            {errorsKeyPair.host?.type ===
                                                'required' && (
                                                    <small className="text-gray-500">
                                                        Host is required.
                                                    </small>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label>Public Key</Label>
                                    <Textarea
                                        {...registerKeyPair('publicKey', {
                                            required: true,
                                        })}
                                    />
                                    {errorsKeyPair.publicKey?.type ===
                                        'required' && (
                                            <small className="text-gray-500">
                                                Public key is required.
                                            </small>
                                        )}
                                </div>
                                <div className="space-y-1">
                                    <Label>Private Key</Label>
                                    <Textarea
                                        {...registerKeyPair('privateKey', {
                                            required: true,
                                        })}
                                    />
                                    {errorsKeyPair.privateKey?.type ===
                                        'required' && (
                                            <small className="text-gray-500">
                                                Private key is required.
                                            </small>
                                        )}
                                </div>
                            </CardContent>
                            <DrawerFooter>
                                <div className="pt-3 flex justify-center">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </DrawerFooter>
                        </form>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default EditCredential;