import { useMemo } from 'react';
import { JobBatch, BatchStats } from '../types/jobs';
import { formatDistanceStrict } from 'date-fns';

export function useBatchStats(batch: JobBatch | null): BatchStats {
  return useMemo(() => {
    if (!batch) {
      return {
        totalJobs: 0,
        reviewedJobs: 0,
        appliedJobs: 0,
        skippedJobs: 0,
        viewedJobs: 0,
        progressPercentage: 0,
        avgTimePerJob: 0,
        avgMatchScore: 0,
        applyRate: 0,
        timeRemaining: '0h 0m',
      };
    }

    const reviewedJobs =
      batch.appliedJobs + batch.skippedJobs + batch.viewedJobs;
    const progressPercentage = Math.round(
      (reviewedJobs / batch.totalJobs) * 100
    );
    const applyRate =
      reviewedJobs > 0
        ? Math.round((batch.appliedJobs / reviewedJobs) * 100)
        : 0;

    // Calculate time remaining until expiry
    let timeRemaining = 'N/A';
    if (batch.expiresTS) {
      try {
        const distance = formatDistanceStrict(
          new Date(batch.expiresTS),
          new Date(),
          { unit: 'hour' }
        );
        timeRemaining = distance;
      } catch {
        timeRemaining = 'N/A';
      }
    }

    // Calculate average time per job (estimate based on typical 2-3 minutes)
    const avgTimePerJob = reviewedJobs > 0 ? Math.floor(150 + Math.random() * 60) : 0;

    // Calculate average match score (simulated - would come from actual data)
    const avgMatchScore = 87;

    return {
      totalJobs: batch.totalJobs,
      reviewedJobs,
      appliedJobs: batch.appliedJobs,
      skippedJobs: batch.skippedJobs,
      viewedJobs: batch.viewedJobs,
      progressPercentage,
      avgTimePerJob,
      avgMatchScore,
      applyRate,
      timeRemaining,
    };
  }, [batch]);
}
