"use client";

import { useState, useEffect } from "react";
import { useApiWithLoading } from "../../../lib/apiWithLoading";
import Spinner from "../../../components/ui/spinner";
import type {
  Interview,
  InterviewChain,
} from "../../types/interviewChain/interviewChain";
import { useInterviewChains } from "./hooks/useInterviewChains";
import InterviewChainHub from "./interviewChainHub";
import ChainExploration from "./chainExploration";
import AddInterviewDialog from "./addInterviewDialog";
import CreateInterviewChainForm from "./createInterviewChainForm";
import EditInterviewDialog from "./editInterviewDialog";
import EndInterviewDialog from "./endInterviewDialog";
import { getInterviewChain } from "../actions/interviewChainActions";

interface InterviewChainManagerProps {
  openAddDialog: boolean;
  setOpenAddDialog: (open: boolean) => void;
}

export default function InterviewChainManager({
  openAddDialog: openAddDialogFromParent,
  setOpenAddDialog: setOpenAddDialogFromParent,
}: InterviewChainManagerProps) {
  const {
    chains,
    stats,
    detailLoading,
    selectedChain,
    setSelectedChain,
    openChainExploration,
    setOpenChainExploration,
    fetchChains,
    addInterview,
    editInterview,
    endInterview,
    updateChainStatus,
    createNewChain,
    setSelectedChainDirect,
    fetchDetailedChain,
  } = useInterviewChains();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEndDialog, setOpenEndDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openAddInterviewDialog, setOpenAddInterviewDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<
    Interview | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<null | {
    type: "Next" | "Rescheduled";
    targetChainId: string;
  }>(null);
  // Auto-open the last chain when chains are loaded (only on initial navigation, not refresh)
  useEffect(() => {
    // Check if this is a page refresh using sessionStorage
    const hasVisited = sessionStorage.getItem("interviewChainsVisited");

    if (
      chains.length > 0 &&
      !selectedChain &&
      !openChainExploration &&
      !hasVisited
    ) {
      // Get the last chain (most recent)
      const lastChain = chains[chains.length - 1];
      if (lastChain) {
        onViewChain(lastChain);
        // Mark as visited for this session
        sessionStorage.setItem("interviewChainsVisited", "true");
      }
    }
  }, [chains, selectedChain, openChainExploration]);

  const handleEndInterview = (
    chain: InterviewChain,
    isEditing: boolean,
    interview?: Interview
  ) => {
    // Directly set the selected chain without triggering handleSelectChain
    // This prevents the fetchChains() call that causes page reload
    setSelectedChainDirect(chain);
    setSelectedInterview(interview);
    setOpenEndDialog(true);
  };

  const handleAddNewInterview = (chain: InterviewChain) => {
    setSelectedChainDirect(chain);
    setSelectedInterview(undefined);
    setOpenAddInterviewDialog(true);
  };

  const onViewChain = async (chain: InterviewChain) => {
    // Set the chain immediately to open the sidebar
    setSelectedChainDirect(chain);
    setOpenChainExploration(true);

    // Fetch detailed chain data in the background with spinner
    try {
      const chainId = Number.parseInt(chain.id);
      if (!isNaN(chainId)) {
        const detailedChain = await fetchDetailedChain(chainId);
        if (detailedChain) {
          setSelectedChainDirect(detailedChain);
        }
      }
    } catch (error) {
      console.error("Failed to fetch detailed chain:", error);
    }
  };

  const handleInterviewAction = async (
    interviewId: string,
    outcome:
      | "Next"
      | "Rejected"
      | "Offer"
      | "AddNew"
      | "Edit"
      | "Pending Update"
      | "Rescheduled",
    newInterview?: Partial<Interview> & {
      clientName?: string;
      position?: string;
      recruiterName?: string;
    }
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (outcome === "AddNew" && newInterview) {
        if (interviewId === "new") {
          await createNewChain(newInterview);
          setOpenCreateDialog(false);
          setOpenAddDialogFromParent(false);
        } else {
          const targetId = selectedInterview?.InterviewChainID
            ? selectedInterview.InterviewChainID.toString()
            : interviewId;
          await addInterview(targetId, newInterview);
          setOpenAddInterviewDialog(false);
          // If we were in a deferred flow (Next/Rescheduled), end the previous interview now
          if (pendingOutcome) {
            await endInterview(
              pendingOutcome.targetChainId,
              pendingOutcome.type
            );
            setPendingOutcome(null);
          }
        }
      } else if (outcome === "Edit" && newInterview && selectedInterview) {
        await editInterview(interviewId, selectedInterview, newInterview);
        setOpenEditDialog(false);
      } else {
        const targetId = selectedInterview?.InterviewChainID
          ? selectedInterview.InterviewChainID.toString()
          : interviewId;
        if (
          outcome === "Rejected" ||
          outcome === "Offer" ||
          outcome === "Pending Update"
        ) {
          await endInterview(targetId, outcome, newInterview);
          setOpenEndDialog(false);
        } else if (outcome === "Next") {
          // Defer status update until new interview is created
          setPendingOutcome({ type: "Next", targetChainId: targetId });
          setOpenEndDialog(false);
          setOpenAddInterviewDialog(true);
        } else if (outcome === "Rescheduled") {
          // Defer status update until new interview is created
          setPendingOutcome({ type: "Rescheduled", targetChainId: targetId });
          setOpenEndDialog(false);
          setOpenAddInterviewDialog(true);
        }
      }

      if (outcome !== "Next" && outcome !== "Rescheduled") {
        setSelectedInterview(undefined);
      }
    } catch (error) {
      console.error("Error handling interview action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {detailLoading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Spinner />
        </div>
      ) : (
        <InterviewChainHub
          chains={chains}
          onEndInterview={handleEndInterview}
          onAddNewInterview={handleAddNewInterview}
          onViewChain={onViewChain}
          onCreateNewChain={() => setOpenCreateDialog(true)}
        />
      )}

      <CreateInterviewChainForm
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setOpenAddDialogFromParent(false);
        }}
        onSubmit={handleInterviewAction}
      />

      {selectedChain && (
        <AddInterviewDialog
          chain={selectedChain}
          open={openAddInterviewDialog}
          onClose={() => {
            setOpenAddInterviewDialog(false);
            setSelectedInterview(undefined);
          }}
          onSubmit={handleInterviewAction}
          selectedInterview={selectedInterview}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedChain && selectedInterview && (
        <EditInterviewDialog
          chain={selectedChain}
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedInterview(undefined);
          }}
          onSubmit={handleInterviewAction}
          interviewToEdit={selectedInterview}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedChain && (
        <EndInterviewDialog
          chain={selectedChain}
          open={openEndDialog}
          onClose={() => {
            setOpenEndDialog(false);
            setSelectedInterview(undefined);
          }}
          onSubmit={handleInterviewAction}
          onOpenAddInterview={() => {
            setOpenEndDialog(false);
            setOpenAddInterviewDialog(true);
          }}
          selectedInterview={selectedInterview}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedChain && openChainExploration && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => {
              setOpenChainExploration(false);
              setSelectedInterview(undefined);
            }}
          />

          {/* Side Panel */}
          <div className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <ChainExploration
              chain={selectedChain}
              open={openChainExploration}
              onClose={() => {
                setOpenChainExploration(false);
                setSelectedInterview(undefined);
              }}
              onEndInterview={handleEndInterview}
              onAddNewInterview={(chain: InterviewChain) =>
                handleAddNewInterview(chain)
              }
              onUpdateChainStatus={updateChainStatus}
              onEditInterview={(interview: Interview) => {
                setSelectedInterview(interview);
                setOpenEditDialog(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
