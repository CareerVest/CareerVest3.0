import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InactivityWarningProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
}

export const InactivityWarning: React.FC<InactivityWarningProps> = ({
  isOpen,
  onStayLoggedIn,
}) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-white border-[#682A53]/20">
        <DialogHeader>
          <DialogTitle className="text-[#682A53] text-xl font-bold">Session Timeout Warning</DialogTitle>
          <DialogDescription className="text-gray-600">
            Your session is about to expire due to inactivity. Please click
            "Stay Logged In" to continue your session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onStayLoggedIn}
            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
