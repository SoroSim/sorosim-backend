import crypto from 'crypto';
import { SimulationResult } from '../types/simulation';

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache service for simulation results
 * Can be extended to use Redis in production
 */
export class CacheService {
  private cache: Map<string, CacheEntry<SimulationResult>>;
  private ttlMinutes: number;

  constructor(ttlMinutes = 60) {
    this.cache = new Map();
    this.ttlMinutes = ttlMinutes;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
  }

  /**
   * Generate cache key from request parameters
   * 
   * @param contractId - Contract ID
   * @param method - Method name
   * @param args - Method arguments
   * @param networkPassphrase - Network passphrase
   * @returns Cache key hash
   */
  generateKey(
    contractId: string,
    method: string,
    args: unknown[],
    networkPassphrase: string
  ): string {
    const data = JSON.stringify({
      contractId,
      method,
      args,
      networkPassphrase
    });
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get cached simulation result
   * 
   * @param key - Cache key
   * @returns Cached result or null if not found/expired
   */
  get(key: string): SimulationResult | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  /**
   * Store simulation result in cache
   * 
   * @param key - Cache key
   * @param value - Simulation result to cache
   */
  set(key: string, value: SimulationResult): void {
    const expiresAt = Date.now() + this.ttlMinutes * 60 * 1000;
    
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Check if a key exists and is not expired
   * 
   * @param key - Cache key
   * @returns True if cache hit
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache entry
   * 
   * @param key - Cache key
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * 
   * @returns Cache stats
   */
  getStats(): { size: number; ttlMinutes: number } {
    return {
      size: this.cache.size,
      ttlMinutes: this.ttlMinutes
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
let cacheInstance: CacheService | null = null;

/**
 * Get the singleton cache service instance
 * 
 * @returns Cache service instance
 */
export function getCacheService(): CacheService {
  if (!cacheInstance) {
    // Get TTL from environment variable or use default
    const ttl = process.env.CACHE_TTL_MINUTES 
      ? parseInt(process.env.CACHE_TTL_MINUTES, 10)
      : 60;
    
    cacheInstance = new CacheService(ttl);
  }
  
  return cacheInstance;
}

/**
 * Reset cache service (useful for testing)
 */
export function resetCacheService(): void {
  if (cacheInstance) {
    cacheInstance.clearAll();
  }
  cacheInstance = null;
}
