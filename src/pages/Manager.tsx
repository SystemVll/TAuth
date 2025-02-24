import { useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import CredentialCard from '@Components/features/CredentialCard';
import Navbar from '@Components/features/Navbar';
import { Card, CardHeader } from '@Components/ui/card';
import { Input } from '@Components/ui/input';
import Session from '@Services/Session';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

const Manager: React.FC = () => {
    const [search, setSearch] = useState('');

    const { data: credentials } = useQuery({
        queryKey: ['credentials'],
        queryFn: async () => {
            return (await invoke('get_credentials', {
                password: Session.get('password'),
            })) as TCredential[];
        },
    });

    const filteredCredentials = credentials?.filter((credential) => {
        const searchLower = search.toLowerCase();

        if (credential.type === 'account') {
            return (
                credential.credential.website
                    ?.toLowerCase()
                    .includes(searchLower) ||
                credential.credential.username
                    ?.toLowerCase()
                    .includes(searchLower)
            );
        } else if (credential.type === 'keypair') {
            return (
                credential.credential.host
                    ?.toLowerCase()
                    .includes(searchLower) ||
                credential.credential.privateKey
                    ?.toLowerCase()
                    .includes(searchLower)
            );
        }

        return false;
    });

    return (
        <div className="flex flex-colflex">
            <Navbar />
            <div className="container mx-auto p-4 pt-20 flex-1">
                <Card className="sticky top-20 z-10">
                    <CardHeader className="p-3">
                        <Input
                            placeholder="Search here ..."
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </CardHeader>
                </Card>
                <ScrollArea
                    /* style={{ height: 'calc(100vh - 11rem)' }} */
                    className="mt-4"
                >
                    <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCredentials?.map((credential, index) => (
                                <CredentialCard
                                    key={index}
                                    uid={credential.uid}
                                    type={credential.type}
                                    credentials={credential.credential}
                                />
                            ))}
                        </div>
                    </div>
                </ScrollArea>
                {filteredCredentials?.length === 0 && (
                    <Card className="p-3 w-full text-center text-gray-500">
                        No credentials found
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Manager;
