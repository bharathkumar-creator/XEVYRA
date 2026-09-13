import { logWorkoutSet, startWorkoutSession, completeWorkoutSession } from '../api/endpoints.js';

export interface PendingMutation {
  id: string; // idk_...
  type: 'LOG_SET' | 'START_SESSION' | 'COMPLETE_SESSION';
  payload: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'xevyra_offline_mutation_queue_v1';

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private queue: PendingMutation[] = [];
  private isProcessing = false;

  private constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  private loadQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private persistQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // quota or localstorage error
    }
  }

  public async enqueue(type: PendingMutation['type'], payload: any): Promise<void> {
    const mutation: PendingMutation = {
      id: `idk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(mutation);
    this.persistQueue();

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await this.processQueue();
    }
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        try {
          if (item.type === 'START_SESSION') {
            await startWorkoutSession(item.payload);
          } else if (item.type === 'LOG_SET') {
            await logWorkoutSet(item.payload.sessionId, item.payload.data);
          } else if (item.type === 'COMPLETE_SESSION') {
            await completeWorkoutSession(item.payload.sessionId, item.payload.data);
          }
          // Success: pop item
          this.queue.shift();
          this.persistQueue();
        } catch (err: any) {
          item.retryCount += 1;
          if (item.retryCount >= 5) {
            // Drop persistently failing item
            this.queue.shift();
            this.persistQueue();
          } else {
            // Stop processing until next network event
            break;
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }
}

export const syncManager = OfflineSyncManager.getInstance();
