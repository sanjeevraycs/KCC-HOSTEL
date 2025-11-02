import { useOfflineSync } from '@/hooks/useOfflineSync';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, queueSize } = useOfflineSync();

  if (isOnline && queueSize === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50 rounded-lg p-3 shadow-lg transition-smooth',
        isOnline ? 'bg-accent text-accent-foreground' : 'bg-warning text-warning-foreground'
      )}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-5 w-5" />
        ) : (
          <WifiOff className="h-5 w-5" />
        )}
        <div>
          <p className="font-medium">
            {isOnline ? 'Back Online' : 'You are offline'}
          </p>
          {queueSize > 0 && (
            <p className="text-sm opacity-90">
              {queueSize} pending {queueSize === 1 ? 'item' : 'items'} to sync
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
