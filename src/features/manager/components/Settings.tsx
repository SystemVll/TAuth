import { Cog, DownloadCloud } from 'lucide-react';
import { useState } from 'react';
import { FieldValues, FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { useVault } from '@/context/VaultContext';
import { Button } from '@Components/ui/button';
import {
    CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@Components/ui/card';
import {
    Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger
} from '@Components/ui/drawer';
import { Input } from '@Components/ui/input';
import { Label } from '@Components/ui/label';
import { Separator } from '@Components/ui/separator';
import { invoke } from '@tauri-apps/api/core';

const Settings: React.FC = () => {
    const { password, updateActivity, setPassword } = useVault()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const methods = useForm<{
        oldPassword: string
        newPassword: string
        confirmPassword: string
    }>()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<{
        oldPassword: string
        newPassword: string
        confirmPassword: string
    }>()

    const handleExport = async () => {
        updateActivity()
        const res: any = await invoke('export_credentials', { password })
        if (res.success) {
            const blob = new Blob([JSON.stringify(res.data, null, 2)], {
                type: 'application/json',
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'tauth_backup.json'
            a.click()
            URL.revokeObjectURL(url)
        } else {
            alert(res.message || 'Export failed')
        }
    }

    const onChangePassword: SubmitHandler<FieldValues> = async (data) => {
        updateActivity()
        const { oldPassword, newPassword, confirmPassword } = data as any
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match')
            return
        }
        const ok: boolean = await invoke('change_password', {
            oldPassword,
            newPassword,
        })

        if (ok) {
            setPassword('')
            setDrawerOpen(false)
        } else {
            alert('Old password incorrect')
        }
    }

    return (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
                <Button variant="default" size="icon" onClick={() => { updateActivity(); setDrawerOpen(true) }}>
                    <Cog size={20} />
                </Button>
            </DrawerTrigger>

            <DrawerContent className="space-y-6">
                <DrawerHeader>
                    <DrawerTitle>Settings</DrawerTitle>
                    <DrawerDescription>
                        Export your data or change your vault password.
                    </DrawerDescription>
                </DrawerHeader>
                <CardHeader>
                    <CardTitle>Export Data</CardTitle>
                    <CardDescription>Download a JSON backup of your vault.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center"
                        onClick={handleExport}
                    >
                        <DownloadCloud className="mr-2 h-5 w-5" />
                        Download Backup
                    </Button>
                </CardContent>

                <Separator />

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onChangePassword)}>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Choose a strong password (min. 8 characters).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="oldPassword">Current Password</Label>
                                    <Input
                                        id="oldPassword"
                                        type="password"
                                        {...register('oldPassword', { required: true })}
                                    />
                                    {errors.oldPassword && (
                                        <p className="text-destructive text-sm">Required</p>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...register('newPassword', {
                                            required: true,
                                            minLength: 8,
                                        })}
                                    />
                                    {errors.newPassword && (
                                        <p className="text-destructive text-sm">
                                            Minimum 8 characters
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="confirmPassword">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...register('confirmPassword', { required: true })}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-destructive text-sm">Required</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full">
                                Change Password
                            </Button>
                        </CardFooter>
                    </form>
                </FormProvider>
            </DrawerContent>
        </Drawer>
    )
}

export default Settings