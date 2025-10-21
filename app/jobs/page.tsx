'use client';

import { useState, useEffect } from 'react';
import { JobsHeader } from './components/JobsHeader';
import { BatchPerformanceBar } from './components/BatchPerformanceBar';
import { JobCard } from './components/JobCard';
import { ApplyConfirmationModal } from './components/ApplyConfirmationModal';
import { SkipFeedbackModal } from './components/SkipFeedbackModal';
import { useJobQueue } from './hooks/useJobQueue';
import { useBatchStats } from './hooks/useBatchStats';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  getClientsWithBatches,
  getClientBatch,
  getBatchItems,
  recordApply,
  recordSkip,
  updateBatchStatus,
  calculateBatchStats,
} from './actions/jobsActions';
import {
  JobBatch,
  JobBatchItem,
  SkipReason,
  ClientWithBatch,
} from './types/jobs';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/authContext';
import { mapAzureRoleToAppRole } from '../utils/roleMapping';

export default function JobsPage() {
  const { roles } = useAuth();
  const [userRole, setUserRole] = useState('default');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientWithBatch[]>([]);

  // Extract role from Azure AD
  useEffect(() => {
    if (roles && roles.length > 0) {
      const mappedRole = mapAzureRoleToAppRole(roles);
      setUserRole(mappedRole);
    }
  }, [roles]);

  // Client selection
  const [selectedClientID, setSelectedClientID] = useState<number | null>(null);
  const [currentBatch, setCurrentBatch] = useState<JobBatch | null>(null);
  const [batchItems, setBatchItems] = useState<JobBatchItem[]>([]);

  // Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'apply' | 'skip' | null>(
    null
  );

  // Job queue navigation
  const {
    currentJobIndex,
    currentJob,
    pendingJobs,
    totalPendingJobs,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
  } = useJobQueue(batchItems);

  // Batch stats
  const batchStats = useBatchStats(currentBatch);

  // Load clients and initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch clients with batches
        const fetchedClients = await getClientsWithBatches();
        setClients(fetchedClients);

        // Select first client by default
        if (fetchedClients.length > 0) {
          const firstClient = fetchedClients[0];
          setSelectedClientID(firstClient.clientID);

          // Load batch for first client if they have one
          if (firstClient.activeBatchID) {
            await loadClientBatch(firstClient.clientID);
          }
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('Failed to load jobs data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load batch for a client
  const loadClientBatch = async (clientID: number) => {
    try {
      const batch = await getClientBatch(clientID);
      setCurrentBatch(batch);

      // Load batch items
      const items = await getBatchItems(batch.batchID);
      setBatchItems(items);
    } catch (error: any) {
      console.error('Error loading client batch:', error);
      toast.error('Failed to load job batch');
    }
  };

  // Handle client change
  const handleClientChange = async (clientID: number) => {
    setSelectedClientID(clientID);
    const client = clients.find((c) => c.clientID === clientID);

    if (client) {
      toast.info(`Switched to ${client.clientName}`);

      if (client.activeBatchID) {
        await loadClientBatch(clientID);
      } else {
        setCurrentBatch(null);
        setBatchItems([]);
        toast.info('No active batch for this client');
      }
    }
  };

  // Handle Apply
  const handleApply = () => {
    if (!currentJob) return;
    setPendingAction('apply');
    // Open job URL in new tab
    window.open(currentJob.job.sourceURL, '_blank');
    // Show confirmation modal after a short delay
    setTimeout(() => {
      setShowApplyModal(true);
    }, 500);
  };

  // Handle Apply Confirmation
  const handleApplyConfirm = async (didApply: boolean, comments: string) => {
    if (!currentJob || !currentBatch) return;

    try {
      // Record action in backend
      await recordApply({
        batchItemID: currentJob.batchItemID,
        clientID: currentBatch.clientID,
        jobID: currentJob.jobID,
        didApply,
        comments,
      });

      // Update batch item status locally
      setBatchItems((prev) =>
        prev.map((item) =>
          item.batchItemID === currentJob.batchItemID
            ? { ...item, itemStatus: didApply ? 'Applied' : 'Viewed' }
            : item
        )
      );

      // Update batch stats locally
      setCurrentBatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          processedJobs: prev.processedJobs + 1,
          appliedJobs: didApply ? prev.appliedJobs + 1 : prev.appliedJobs,
          viewedJobs: !didApply ? prev.viewedJobs + 1 : prev.viewedJobs,
        };
      });

      setShowApplyModal(false);
      setPendingAction(null);

      // Show toast
      toast.success(
        didApply
          ? `Application tracked for ${currentJob.job.company}`
          : `Job viewed: ${currentJob.job.company}`,
        {
          description: comments || undefined,
        }
      );

      // Move to next job
      if (hasNext) {
        setTimeout(goToNext, 300);
      }
    } catch (error: any) {
      console.error('Error recording apply action:', error);
      toast.error('Failed to record action');
    }
  };

  // Handle Skip
  const handleSkip = () => {
    if (!currentJob) return;
    setPendingAction('skip');
    setShowSkipModal(true);
  };

  // Handle Skip Confirmation
  const handleSkipConfirm = async (skipReason: SkipReason, customReason: string) => {
    if (!currentJob || !currentBatch) return;

    try {
      // Record action in backend
      await recordSkip({
        batchItemID: currentJob.batchItemID,
        clientID: currentBatch.clientID,
        jobID: currentJob.jobID,
        skipReason,
        customReason,
      });

      // Update batch item status locally
      setBatchItems((prev) =>
        prev.map((item) =>
          item.batchItemID === currentJob.batchItemID
            ? { ...item, itemStatus: 'Skipped' }
            : item
        )
      );

      // Update batch stats locally
      setCurrentBatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          processedJobs: prev.processedJobs + 1,
          skippedJobs: prev.skippedJobs + 1,
        };
      });

      setShowSkipModal(false);
      setPendingAction(null);

      // Show toast
      toast.info(`Job skipped: ${currentJob.job.company}`, {
        description: customReason || skipReason.replace(/_/g, ' '),
      });

      // Move to next job
      if (hasNext) {
        setTimeout(goToNext, 300);
      }
    } catch (error: any) {
      console.error('Error recording skip action:', error);
      toast.error('Failed to record skip action');
    }
  };

  // Handle View (no tracking)
  const handleView = () => {
    if (!currentJob) return;
    window.open(currentJob.job.sourceURL, '_blank');
    toast.info('Job posting opened in new tab');
  };

  // Handle Complete Batch
  const handleCompleteBatch = async () => {
    if (!currentBatch) return;

    try {
      await updateBatchStatus(currentBatch.batchID, 'Completed');
      toast.success('Batch completed successfully!', {
        description: `Applied to ${batchStats.appliedJobs} jobs, Skipped ${batchStats.skippedJobs}`,
      });

      // Reload client batch
      if (selectedClientID) {
        await loadClientBatch(selectedClientID);
      }
    } catch (error: any) {
      console.error('Error completing batch:', error);
      toast.error('Failed to complete batch');
    }
  };

  // Handle Save & Exit
  const handleSaveAndExit = async () => {
    if (!currentBatch) return;

    try {
      await updateBatchStatus(currentBatch.batchID, 'Paused');
      toast.success('Progress saved!', {
        description: 'You can resume this batch anytime',
      });
    } catch (error: any) {
      console.error('Error saving batch:', error);
      toast.error('Failed to save batch');
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: hasNext ? goToNext : () => {},
    onPrevious: hasPrevious ? goToPrevious : () => {},
    onApply: handleApply,
    onSkip: handleSkip,
    onView: handleView,
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  // No clients message - still show header for admins to access admin panel
  if (clients.length === 0 || !selectedClientID) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobsHeader
          clients={[]}
          selectedClientID={null}
          onClientChange={() => {}}
          currentJobIndex={0}
          totalJobs={0}
          batchNumber="N/A"
          userRole={userRole}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Clients Available
            </h2>
            <p className="text-gray-600 mb-4">
              No clients are currently assigned to you.
            </p>
            {userRole === 'Admin' && (
              <p className="text-sm text-gray-500">
                Use the Admin Console button above to manage job configurations.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No batch message
  if (!currentBatch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobsHeader
          clients={clients}
          selectedClientID={selectedClientID}
          onClientChange={handleClientChange}
          currentJobIndex={0}
          totalJobs={0}
          batchNumber="N/A"
          userRole={userRole}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Active Batch
            </h2>
            <p className="text-gray-600">
              This client doesn't have an active job batch yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No jobs message
  if (!currentJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobsHeader
          clients={clients}
          selectedClientID={selectedClientID}
          onClientChange={handleClientChange}
          currentJobIndex={0}
          totalJobs={currentBatch.totalJobs}
          batchNumber={currentBatch.batchGUID}
          userRole={userRole}
        />
        <BatchPerformanceBar
          stats={batchStats}
          onComplete={handleCompleteBatch}
          onSaveAndExit={handleSaveAndExit}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              All Done!
            </h2>
            <p className="text-gray-600">
              No more jobs to review in this batch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <JobsHeader
        clients={clients}
        selectedClientID={selectedClientID}
        onClientChange={handleClientChange}
        currentJobIndex={currentJobIndex}
        totalJobs={totalPendingJobs}
        batchNumber={currentBatch.batchGUID}
        userRole={userRole}
      />

      {/* Batch Performance Bar */}
      <BatchPerformanceBar
        stats={batchStats}
        onComplete={handleCompleteBatch}
        onSaveAndExit={handleSaveAndExit}
      />

      {/* Main Content */}
      <main className="px-6 py-4">
        <JobCard
          job={currentJob.job}
          onSkip={handleSkip}
          onView={handleView}
          onApply={handleApply}
        />
      </main>

      {/* Modals */}
      <ApplyConfirmationModal
        open={showApplyModal}
        onOpenChange={setShowApplyModal}
        job={currentJob?.job || null}
        onConfirm={handleApplyConfirm}
      />

      <SkipFeedbackModal
        open={showSkipModal}
        onOpenChange={setShowSkipModal}
        job={currentJob?.job || null}
        onConfirm={handleSkipConfirm}
      />
    </div>
  );
}
