import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

const DashboardLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
