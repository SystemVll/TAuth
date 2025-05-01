import { motion } from 'framer-motion';

import Logo from '@Assets/logo.png';
import AddCredential from '@Features/manager/components/AddCredential';

const Navbar: React.FC = () => {
    return (
        <nav className="fixed w-full top-0 border-b border-[#383838] bg-background z-50">
            <div className="mx-auto max-w-7xl px-2 px-6">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="flex justify-start">
                        <motion.div
                            className="flex shrink-0 items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <img
                                className="h-8 w-auto"
                                src={Logo}
                                alt="Tauth"
                            />
                        </motion.div>
                    </div>
                    <motion.div
                        className="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <AddCredential />
                    </motion.div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;