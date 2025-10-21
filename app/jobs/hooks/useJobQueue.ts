import { useState, useMemo } from 'react';
import { JobBatchItem } from '../types/jobs';

export function useJobQueue(batchItems: JobBatchItem[]) {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);

  // Filter to only show pending jobs
  const pendingJobs = useMemo(() => {
    return batchItems.filter((item) => item.itemStatus === 'Pending');
  }, [batchItems]);

  const currentJob = pendingJobs[currentJobIndex] || null;
  const hasNext = currentJobIndex < pendingJobs.length - 1;
  const hasPrevious = currentJobIndex > 0;

  const goToNext = () => {
    if (hasNext) {
      setCurrentJobIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (hasPrevious) {
      setCurrentJobIndex((prev) => prev - 1);
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < pendingJobs.length) {
      setCurrentJobIndex(index);
    }
  };

  return {
    currentJobIndex,
    currentJob,
    pendingJobs,
    totalPendingJobs: pendingJobs.length,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
    goToIndex,
  };
}
