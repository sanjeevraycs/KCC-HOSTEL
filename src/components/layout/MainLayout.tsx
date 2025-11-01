import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  showProfile?: boolean;
}

export function MainLayout({ children, title, showProfile = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title={title} showProfile={showProfile} />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNavigation />
    </div>
  );
}
