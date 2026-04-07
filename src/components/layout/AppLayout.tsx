import { Sidebar } from './Sidebar';
import { ContextBar } from './ContextBar';

interface AppLayoutProps {
  children: React.ReactNode;
  hideContextBar?: boolean;
}

export function AppLayout({ children, hideContextBar }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {!hideContextBar && <ContextBar />}
        {children}
      </main>
    </div>
  );
}
