import AddCredential from '@Components/features/AddCredential';

import Logo from '@Assets/logo.png';

const Navbar: React.FC = () => {
    return (
        <nav className="fixed w-full top-0 border-b border-[#383838]">
            <div className="mx-auto max-w-7xl px-2 px-6">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="flex justify-start">
                        <div className="flex shrink-0 items-center">
                            <img
                                className="h-8 w-auto"
                                src={Logo}
                                alt="Tauth"
                            />
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <AddCredential />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
