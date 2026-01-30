import { SITEMAP_CONFIG } from './config';

export interface PartitionInfo {
  partition: number;
  totalPartitions: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Calculates partition information for large datasets
 */
export function calculatePartitions(totalCount: number): {
  totalPartitions: number;
  urlsPerPartition: number;
} {
  const totalPartitions = Math.ceil(totalCount / SITEMAP_CONFIG.MAX_URLS_PER_SITEMAP);
  const urlsPerPartition = SITEMAP_CONFIG.MAX_URLS_PER_SITEMAP;
  
  return { totalPartitions, urlsPerPartition };
}

/**
 * Gets partition info for a specific partition number
 */
export function getPartitionInfo(partition: number, totalCount: number): PartitionInfo {
  const { totalPartitions, urlsPerPartition } = calculatePartitions(totalCount);
  
  if (partition < 0 || partition >= totalPartitions) {
    throw new Error(`Invalid partition ${partition}. Must be between 0 and ${totalPartitions - 1}`);
  }
  
  const startIndex = partition * urlsPerPartition;
  const endIndex = Math.min(startIndex + urlsPerPartition, totalCount);
  
  return {
    partition,
    totalPartitions,
    startIndex,
    endIndex,
  };
}

/**
 * Generates all partition numbers for a total count
 */
export function getAllPartitionNumbers(totalCount: number): number[] {
  const { totalPartitions } = calculatePartitions(totalCount);
  return Array.from({ length: totalPartitions }, (_, i) => i);
}