
import React from "react";
import { Award, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MilestonePopupProps {
  callSign: string;
  milestone: number;
  open: boolean;
  onClose: () => void;
}

const MilestonePopup: React.FC<MilestonePopupProps> = ({ callSign, milestone, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-center">
            <Award className="h-6 w-6 mr-2 text-yellow-500" />
            Traguardo Raggiunto!
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Chiudi</span>
          </Button>
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
          <Button onClick={onClose} className="px-8">
            Conferma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestonePopup;
