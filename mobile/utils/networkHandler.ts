import React from 'react';
import { Alert } from 'react-native';

export interface NetworkState {
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string;
    isWifiEnabled?: boolean;
}

export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
};

class NetworkHandler {
    private networkState: NetworkState = {
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown',
    };

    private listeners: Array<(state: NetworkState) => void> = [];
    private retryQueue: Map<string, () => Promise<any>> = new Map();

    constructor() {
        this.initialize();
    }

    private async initialize() {
        // Get initial network state using a simple fetch test
        const state = await this.fetchNetworkState();
        this.updateNetworkState(state);

        // Set up periodic network checks (since we don't have NetInfo)
        this.startNetworkPolling();
    }

    private async fetchNetworkState(): Promise<any> {
        try {
            // Try to fetch a small resource to test connectivity
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            return {
                isConnected: true,
                isInternetReachable: true,
                type: 'unknown', // We can't detect connection type without NetInfo
                isWifiEnabled: undefined
            };
        } catch (error) {
            return {
                isConnected: false,
                isInternetReachable: false,
                type: 'none',
                isWifiEnabled: undefined
            };
        }
    }

    private startNetworkPolling() {
        // Check network status every 30 seconds
        setInterval(async () => {
            const state = await this.fetchNetworkState();
            this.handleNetworkChange(state);
        }, 30000);
    }

    private handleNetworkChange = (state: any) => {
        this.updateNetworkState(state);

        // Process retry queue when connection is restored
        if (this.networkState.isConnected && this.networkState.isInternetReachable) {
            this.processRetryQueue();
        }
    };

    private updateNetworkState(state: any) {
        const newState: NetworkState = {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable ?? false,
            type: state.type ?? 'unknown',
            isWifiEnabled: state.isWifiEnabled,
        };

        const wasOffline = !this.networkState.isConnected;
        const isNowOnline = newState.isConnected;

        this.networkState = newState;

        // Notify listeners
        this.listeners.forEach(listener => listener(newState));

        // Show connection status alerts
        if (wasOffline && isNowOnline) {
            this.showConnectionRestoredAlert();
        } else if (!isNowOnline && wasOffline === false) {
            this.showConnectionLostAlert();
        }
    }

    private showConnectionLostAlert() {
        Alert.alert(
            'Connection Lost',
            'You appear to be offline. Some features may not work properly.',
            [{ text: 'OK' }]
        );
    }

    private showConnectionRestoredAlert() {
        Alert.alert(
            'Connection Restored',
            'Your internet connection has been restored.',
            [{ text: 'OK' }]
        );
    }

    private async processRetryQueue() {
        const entries = Array.from(this.retryQueue.entries());
        this.retryQueue.clear();

        for (const [key, retryFunction] of entries) {
            try {
                await retryFunction();
                console.log(`Successfully retried operation: ${key}`);
            } catch (error) {
                console.error(`Failed to retry operation ${key}:`, error);
            }
        }
    }

    public getNetworkState(): NetworkState {
        return { ...this.networkState };
    }

    public isOnline(): boolean {
        return this.networkState.isConnected && this.networkState.isInternetReachable;
    }

    public addListener(listener: (state: NetworkState) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    public async withRetry<T>(
        operation: () => Promise<T>,
        config: Partial<RetryConfig> = {},
        operationKey?: string
    ): Promise<T> {
        const finalConfig = { ...defaultRetryConfig, ...config };
        let lastError: Error;

        for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
            try {
                // Check network connectivity before attempting
                if (!this.isOnline()) {
                    throw new Error('No internet connection');
                }

                const result = await operation();

                // Remove from retry queue if successful
                if (operationKey) {
                    this.retryQueue.delete(operationKey);
                }

                return result;
            } catch (error) {
                lastError = error as Error;

                // If it's a network error and we have retries left
                if (this.isNetworkError(error) && attempt < finalConfig.maxRetries) {
                    const delay = Math.min(
                        finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt),
                        finalConfig.maxDelay
                    );

                    console.warn(`Network operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${finalConfig.maxRetries})`);
                    await this.delay(delay);
                    continue;
                }

                // If offline, add to retry queue
                if (!this.isOnline() && operationKey) {
                    this.retryQueue.set(operationKey, () => this.withRetry(operation, config, operationKey));
                }

                throw error;
            }
        }

        throw lastError!;
    }

    private isNetworkError(error: any): boolean {
        if (!error) return false;

        const networkErrorMessages = [
            'Network request failed',
            'Request timeout',
            'Connection error',
            'No internet connection',
            'Network Error',
            'ERR_NETWORK',
            'ERR_INTERNET_DISCONNECTED',
        ];

        const errorMessage = error.message || error.toString();
        return networkErrorMessages.some(msg => errorMessage.includes(msg));
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public addToRetryQueue(key: string, operation: () => Promise<any>) {
        this.retryQueue.set(key, operation);
    }

    public removeFromRetryQueue(key: string) {
        this.retryQueue.delete(key);
    }

    public getRetryQueueSize(): number {
        return this.retryQueue.size;
    }

    public clearRetryQueue() {
        this.retryQueue.clear();
    }
}

// Export singleton instance
export const networkHandler = new NetworkHandler();

// React hook for using network state
export function useNetworkState() {
    const [networkState, setNetworkState] = React.useState<NetworkState>(
        networkHandler.getNetworkState()
    );

    React.useEffect(() => {
        const unsubscribe = networkHandler.addListener(setNetworkState);
        return unsubscribe;
    }, []);

    return {
        ...networkState,
        isOnline: networkHandler.isOnline(),
        retryQueueSize: networkHandler.getRetryQueueSize(),
    };
}

// Utility functions
export function withNetworkRetry<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>,
    operationKey?: string
): Promise<T> {
    return networkHandler.withRetry(operation, config, operationKey);
}

export function isOnline(): boolean {
    return networkHandler.isOnline();
}

export function getNetworkState(): NetworkState {
    return networkHandler.getNetworkState();
}