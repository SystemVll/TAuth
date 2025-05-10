import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import { useRef, useState } from 'react';

import { useVault } from '@/context/VaultContext';
import { Card, CardHeader } from '@Components/ui/card';
import { Input } from '@Components/ui/input';
import { ScrollArea } from '@Components/ui/scroll-area';
import CredentialCard from '@Features/manager/components/CredentialCard';
import Navbar from '@Features/shared/components/Navbar';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

const Manager: React.FC = () => {
    const [search, setSearch] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { password, updateActivity } = useVault();

    const { data: credentials } = useQuery({
        queryKey: ['credentials'],
        queryFn: async () => {
            updateActivity();

            if (!password) {
                throw new Error('Vault is locked');
            }

            return (await invoke('get_credentials', {
                password,
            })) as TCredential[];
        },
        enabled: !!password,
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

    const handleInteraction = () => {
        updateActivity();
    };

    return (
        <div
            className="flex flex-col min-h-screen"
            onClick={handleInteraction}
            onKeyDown={handleInteraction}
        >
            <Navbar />
            <div className="container mx-auto p-4 pt-20 flex-1 relative">
                <div className="sticky top-0 pt-2 pb-4 z-20 bg-background">
                    <Card>
                        <CardHeader className="p-3">
                            <Input
                                placeholder="Search here ..."
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </CardHeader>
                    </Card>
                    <div className="h-6 bg-gradient-to-b from-background to-transparent absolute bottom-0 left-0 right-0 translate-y-full pointer-events-none"></div>
                </div>
                <div className="relative" ref={scrollRef}>
                    <ScrollArea>
                        <div className="pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCredentials?.map((credential, index) => (
                                    <CredentialCard
                                        key={index}
                                        uid={credential.uid}
                                        type={credential.type}
                                        credentials={credential.credential}
                                    />
                                ))}
                                {filteredCredentials?.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 120, damping: 12 }}
                                        className="col-span-full flex justify-center"
                                    >
                                        <Card className="p-8 w-full max-w-md flex flex-col items-center justify-center border-2 border-dashed shadow-2xl relative overflow-hidden">
                                            {/* Existing animation code... */}
                                            <motion.div
                                                className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
                                                animate={{ scale: [1, 1.2, 1], rotate: [0, 30, 0] }}
                                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                            />
                                            <motion.div
                                                className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
                                                animate={{ scale: [1, 1.15, 1], rotate: [0, -20, 0] }}
                                                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                                            />
                                            <motion.div
                                                initial={{ scale: 0.8, rotate: -10 }}
                                                animate={{ scale: [0.8, 1.1, 1], rotate: [0, 10, 0] }}
                                                transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                            >
                                                <Boxes className="w-16 h-16 mb-5 drop-shadow-lg text-[#ffc233]" />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-xl font-bold mb-2"
                                            >
                                                No Credentials Found
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-base text-center max-w-xs"
                                            >
                                                We couldn't find any credentials matching your search.<br />
                                                <span className="italic text-primary">Try adjusting your search or add a new credential to get started!</span>
                                            </motion.div>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default Manager;