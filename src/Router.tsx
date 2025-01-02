import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Login from './pages/Login';
import Register from './pages/Register';
import Manager from './pages/Manager';

const Router: React.FC = () => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/manager" element={<Manager />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default Router;
