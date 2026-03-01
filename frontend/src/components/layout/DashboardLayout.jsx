import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:pl-0 min-w-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
