import { AlertTriangle, Bomb } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@Components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@Components/ui/dialog';

type DeleteConfirmDialogProps = {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    onClick: () => void;
}

const DeleteConfirmDialog = ({ deleteDialogOpen, setDeleteDialogOpen, onClick }: DeleteConfirmDialogProps) => {
    const [delay, setDelay] = useState(0);


    useEffect(() => {
        if (deleteDialogOpen) {
            setDelay(3);
            const interval = setInterval(() => {
                setDelay((prev) => prev - 1);
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        } else {
            setDelay(0);
        }
    }, [deleteDialogOpen]);

    return (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-sm p-0 overflow-hidden rounded">
                <div className="bg-[#2d1a1a] px-6 py-5 flex flex-col items-center border-b border-[#ff4d4f]">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-[#ff4d4f] w-7 h-7" />
                        <DialogTitle className="text-[#ff4d4f] text-lg font-bold">
                            Danger Zone
                        </DialogTitle>
                    </div>
                    <p className="mt-2 text-[#ffbaba] text-center text-sm">
                        You are about to <span className="font-semibold text-[#ff4d4f]">permanently delete</span> this credential.<br />
                        This action <span className="font-semibold">cannot be undone</span>.
                    </p>
                </div>
                <div>
                    <p className="text-center text-sm mt-4 px-6">
                        Are you sure you want to proceed?<br />
                        This action <span className="font-semibold">cannot be undone</span>.
                    </p>
                </div>
                <DialogFooter className="flex justify-between px-6 py-4 bg-[#1a1a1a]">
                    <Button
                        variant="destructive"
                        className={cn(
                            "bg-[#ff4d4f] hover:bg-[#ff7875] text-white font-semibold px-6",
                            delay > 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                        )}
                        onClick={onClick}
                    >
                        {
                            delay > 0 ? (
                                delay
                            ) : (
                                <>
                                    <Bomb className="w-4 h-4 mr-2" /> Delete
                                </>
                            )
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteConfirmDialog