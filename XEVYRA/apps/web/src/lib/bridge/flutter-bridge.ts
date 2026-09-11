export interface FlutterBridgeMessage {
  action: 'requestNativeAuth' | 'getAppVersion' | 'openExternalUrl' | 'shareContent' | 'notifyReady';
  payload?: Record<string, unknown>;
}

declare global {
  interface Window {
    flutterBridge?: {
      postMessage: (message: string) => void;
    };
    onNativeAuthSuccess?: (token: string) => void;
    onNativeAuthError?: (errorMessage: string) => void;
  }
}

export class FlutterBridgeClient {
  public static isRunningInFlutter(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof window.flutterBridge !== 'undefined' && typeof window.flutterBridge.postMessage === 'function';
  }

  public static postMessage(message: FlutterBridgeMessage): boolean {
    if (!this.isRunningInFlutter()) {
      return false;
    }

    try {
      window.flutterBridge?.postMessage(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to post message to Flutter Bridge:', error);
      return false;
    }
  }

  public static requestNativeAuth(): boolean {
    return this.postMessage({ action: 'requestNativeAuth' });
  }

  public static notifyAppReady(): boolean {
    return this.postMessage({ action: 'notifyReady' });
  }
}

export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(type === 'heavy' ? 25 : type === 'medium' ? 15 : 8);
    } catch {
      // Ignore vibration errors on unsupported devices
    }
  }
}

