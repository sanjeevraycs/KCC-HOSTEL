import { useState, useEffect } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineQueue {
  id: string;
  type: 'attendance';
  data: any;
  timestamp: number;
}

interface OfflineDB extends DBSchema {
  'attendance-queue': {
    key: string;
    value: OfflineQueue;
  };
}

let db: IDBPDatabase<OfflineDB> | null = null;

async function getDB() {
  if (!db) {
    db = await openDB<OfflineDB>('hosteltrack-offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('attendance-queue')) {
          db.createObjectStore('attendance-queue', { keyPath: 'id' });
        }
      },
    });
  }
  return db;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check queue size on mount
    updateQueueSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateQueueSize = async () => {
    const db = await getDB();
    const count = await db.count('attendance-queue');
    setQueueSize(count);
  };

  const addToQueue = async (data: any) => {
    const db = await getDB();
    const item: OfflineQueue = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'attendance',
      data,
      timestamp: Date.now(),
    };
    await db.add('attendance-queue', item);
    await updateQueueSize();
  };

  const syncOfflineQueue = async () => {
    if (!navigator.onLine) return;

    const db = await getDB();
    const items = await db.getAll('attendance-queue');

    for (const item of items) {
      try {
        // Process the queued item
        // This would be implemented based on your sync logic
        console.log('Syncing offline item:', item);
        await db.delete('attendance-queue', item.id);
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }

    await updateQueueSize();
  };

  return {
    isOnline,
    queueSize,
    addToQueue,
    syncOfflineQueue,
  };
}
