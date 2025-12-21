// Migration Script: Upload mock providers to Firestore
// Run this once to seed the database with initial data

import { generateMockProviders } from '@/data/providers';
import { batchSaveProviders, hasProviders } from '@/services/firestoreProviderService';

/**
 * Migrate mock providers to Firestore
 * This should be run once to populate the database
 */
export async function migrateProvidersToFirestore(count: number = 50): Promise<{
  success: boolean;
  message: string;
  count: number;
}> {
  try {
    // Check if providers already exist
    const existingProviders = await hasProviders();
    
    if (existingProviders) {
      return {
        success: true,
        message: 'Providers already exist in Firestore. Skipping migration.',
        count: 0,
      };
    }
    
    // Generate mock providers
    console.log(`Generating ${count} mock providers...`);
    const mockProviders = generateMockProviders(count);
    
    // Upload to Firestore
    console.log('Uploading to Firestore...');
    const uploadedCount = await batchSaveProviders(mockProviders);
    
    console.log(`Successfully migrated ${uploadedCount} providers to Firestore`);
    
    return {
      success: true,
      message: `Successfully migrated ${uploadedCount} providers to Firestore`,
      count: uploadedCount,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0,
    };
  }
}

/**
 * Force re-migration (delete existing and re-upload)
 * Use with caution - this will overwrite existing data
 */
export async function forceMigrateProviders(count: number = 50): Promise<{
  success: boolean;
  message: string;
  count: number;
}> {
  try {
    console.log(`Force migrating ${count} providers...`);
    const mockProviders = generateMockProviders(count);
    const uploadedCount = await batchSaveProviders(mockProviders);
    
    return {
      success: true,
      message: `Force migrated ${uploadedCount} providers to Firestore`,
      count: uploadedCount,
    };
  } catch (error) {
    console.error('Force migration failed:', error);
    return {
      success: false,
      message: `Force migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0,
    };
  }
}
