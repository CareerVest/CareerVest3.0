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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            Your session is about to expire due to inactivity. Please click
            "Stay Logged In" to continue your session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onStayLoggedIn}>Stay Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
