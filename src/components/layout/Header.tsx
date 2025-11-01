import { User } from 'lucide-react';

interface HeaderProps {
  title: string;
  showProfile?: boolean;
}

export function Header({ title, showProfile = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-primary">{title}</h1>
        </div>
        {showProfile && (
          <button className="flex items-center justify-center rounded-full bg-secondary p-2 touch-target">
            <User className="h-5 w-5 text-primary" />
          </button>
        )}
      </div>
    </header>
  );
}
