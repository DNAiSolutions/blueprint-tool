import { Sidebar } from './Sidebar';
import { ContextBar } from './ContextBar';

interface AppLayoutProps {
  children: React.ReactNode;
  hideContextBar?: boolean;
}

export function AppLayout({ children, hideContextBar }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {!hideContextBar && <ContextBar />}
        {children}
      </main>
    </div>
  );
}
