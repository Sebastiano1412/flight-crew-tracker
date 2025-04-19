
import React, { useEffect } from "react";
import { Award } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MilestonePopupProps {
  callSign: string;
  milestone: number;
  open: boolean;
  onClose: () => void;
}

const MilestonePopup: React.FC<MilestonePopupProps> = ({ callSign, milestone, open, onClose }) => {
  console.log(`MilestonePopup render with open=${open}, callSign=${callSign}, milestone=${milestone}`);
  
  // Force focus when opened
  useEffect(() => {
    if (open) {
      console.log("MilestonePopup is now open!");
    }
  }, [open]);

  if (!open) {
    return null; // Don't render anything if not open
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log(`Dialog onOpenChange called with isOpen=${isOpen}`);
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-center">
            <Award className="h-6 w-6 mr-2 text-yellow-500" />
            Traguardo Raggiunto!
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 flex flex-col items-center">
          <div className="rounded-full bg-yellow-100 p-3 mb-4">
            <Award className="h-12 w-12 text-yellow-500" />
          </div>
          <DialogDescription className="text-center mb-4 text-lg">
            Il pilota <span className="font-bold">{callSign}</span> ha raggiunto{" "}
            <span className="font-bold text-yellow-600">{milestone}</span> partecipazioni agli eventi!
          </DialogDescription>
          <p className="text-center text-muted-foreground">
            Congratulazioni per questo importante traguardo nella carriera del pilota.
          </p>
        </div>
        <div className="flex justify-center">
          <Button 
            onClick={() => {
              console.log("Confirm button clicked");
              onClose();
            }} 
            className="px-8"
          >
            Conferma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestonePopup;
