import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

import { Popover } from '@Components/ui/popover';

import { Button } from '@Components/ui/button';
import { Input } from '@Components/ui/input';
import { Label } from '@Components/ui/label';
import { Textarea } from '@Components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@Components/ui/tabs';
import { CardHeader, CardDescription, CardContent } from '@Components/ui/card';
import { PopoverContent, PopoverTrigger } from '@Components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@Components/ui/command';

import Icon from '@Components/features/Icon';

import { cn } from '@/lib/utils';

import Session from '@Services/Session';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '../ui/drawer';

const AddCredential: React.FC = () => {
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [schemeValue, setSchemeValue] = useState('ssh://');

    const {
        register: registerAccount,
        handleSubmit: handleSubmitAccount,
        formState: { errors: errorsAccount },
    } = useForm();

    const {
        register: registerKeyPair,
        handleSubmit: handleSubmitKeyPair,
        formState: { errors: errorsKeyPair },
    } = useForm();

    const onSubmitAccount: SubmitHandler<FieldValues> = async (data) => {
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

        if (twoFactor != '') {
            credential['twoFactor'] = twoFactor;
        }

        console.log(credential);

        await invoke('add_credential', {
            password: Session.get('password'),
            credentialType: 'account',
            credential,
        });

        await queryClient.invalidateQueries({
            queryKey: ['credentials'],
        });
    };

    const onSubmitKeyPair: SubmitHandler<FieldValues> = async (data) => {
        const { publicKey, privateKey, host } = data;
        await invoke('add_credential', {
            password: Session.get('password'),
            credentialType: 'keypair',
            credential: {
                publicKey: publicKey,
                privateKey: privateKey,
                host: host,
            },
        });

        await queryClient.invalidateQueries({
            queryKey: ['credentials'],
        });
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
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="default">
                    <Icon type="solid" icon="plus" />
                    Add New
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Add Credential</DrawerTitle>
                        <DrawerDescription>
                            Add a new credential to your container.
                        </DrawerDescription>
                    </DrawerHeader>
                    <Tabs defaultValue="account">
                        <TabsList className="grid w-full grid-cols-2 mb-4 gap-2">
                            <TabsTrigger value="account">
                                <Icon
                                    type="solid"
                                    icon="user"
                                    className="mr-2"
                                />{' '}
                                Account
                            </TabsTrigger>
                            <TabsTrigger value="password">
                                <Icon
                                    type="solid"
                                    icon="key"
                                    className="mr-2"
                                />{' '}
                                Key Pair
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <form
                                onSubmit={handleSubmitAccount(onSubmitAccount)}
                            >
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
                                        <Button type="submit">Save</Button>
                                    </div>
                                </DrawerFooter>
                            </form>
                        </TabsContent>
                        <TabsContent value="password">
                            <form
                                onSubmit={handleSubmitKeyPair(onSubmitKeyPair)}
                            >
                                <CardHeader className="p-0">
                                    <CardDescription>
                                        Add your public and private key here to
                                        you container. Click save when you're
                                        done.
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
                                                                      (
                                                                          scheme,
                                                                      ) =>
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
                                                                        (
                                                                            scheme,
                                                                        ) => (
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
                                        <Button type="submit">Save</Button>
                                    </div>
                                </DrawerFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default AddCredential;
