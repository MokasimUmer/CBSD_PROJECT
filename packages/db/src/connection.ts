import mongoose from 'mongoose';

/**
 * Database Connection Manager
 *
 * Manages the MongoDB connection lifecycle with retry logic
 * and graceful shutdown handling.
 *
 * Design Pattern: Singleton (single connection instance)
 */

let isConnected = false;

export interface DatabaseConfig {
  uri: string;
  dbName?: string;
  maxRetries?: number;
  retryDelay?: number;
}

const DEFAULT_CONFIG: Partial<DatabaseConfig> = {
  dbName: 'creator-platform',
  maxRetries: 3,
  retryDelay: 5000,
};

/**
 * Connect to MongoDB with retry logic.
 * Ensures only one active connection exists (Singleton behavior).
 */
export async function connectDatabase(config: DatabaseConfig): Promise<typeof mongoose> {
  if (isConnected) {
    console.log('[DB] Already connected to database');
    return mongoose;
  }

  const { uri, dbName, maxRetries, retryDelay } = { ...DEFAULT_CONFIG, ...config };

  let attempts = 0;

  while (attempts < (maxRetries ?? 3)) {
    try {
      attempts++;
      console.log(`[DB] Connection attempt ${attempts}/${maxRetries}...`);

      const connection = await mongoose.connect(uri, {
        dbName,
      });

      isConnected = true;
      console.log(`[DB] ✅ Connected to MongoDB (database: ${dbName})`);

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('[DB] ❌ Connection error:', error.message);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[DB] ⚠️  Disconnected from MongoDB');
        isConnected = false;
      });

      return connection;
    } catch (error) {
      console.error(
        `[DB] ❌ Connection attempt ${attempts} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempts >= (maxRetries ?? 3)) {
        throw new Error(`[DB] Failed to connect after ${maxRetries} attempts`);
      }

      console.log(`[DB] Retrying in ${(retryDelay ?? 5000) / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('[DB] Unexpected error in connection logic');
}

/**
 * Gracefully disconnect from MongoDB.
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    console.log('[DB] No active connection to disconnect');
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  console.log('[DB] 🔌 Disconnected from MongoDB');
}

/**
 * Check if the database is currently connected.
 */
export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
