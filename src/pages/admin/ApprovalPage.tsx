
import { Navigate } from "react-router-dom";
import { CheckCircle, XCircle, Calendar, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDatabase } from "@/context/DatabaseContext";
import { useState, useEffect } from "react";
import MilestonePopup from "@/components/MilestonePopup";
import { useToast } from "@/hooks/use-toast";

const ApprovalPage = () => {
  const { toast } = useToast();
  const { 
    isAdmin, 
    getPendingParticipations, 
    getCallSignCode, 
    approveEventParticipation, 
    deleteEventParticipation, 
    getCallSignParticipationCount,
    getManualParticipationCount
  } = useDatabase();
  
  const [milestoneDetails, setMilestoneDetails] = useState<{ callSign: string; milestone: number; open: boolean }>({
    callSign: "",
    milestone: 0,
    open: false
  });

  const pendingParticipations = getPendingParticipations();

  // Define milestones including the new 10 participation milestone
  const milestones = [10, 20, 40, 60, 80, 100];

  // Add a debugging console log to check all callsigns and their current participation counts
  useEffect(() => {
    if (isAdmin) {
      console.log("Current participation counts for debugging:");
      pendingParticipations.forEach(participation => {
        const callSignId = participation.callSignId;
        const callSignCode = getCallSignCode(callSignId);
        const approvedCount = pendingParticipations.filter(
          p => p.callSignId === callSignId && p.isApproved
        ).length;
        const manualCount = getManualParticipationCount(callSignId);
        const totalCount = getCallSignParticipationCount(callSignId);
        console.log(`CallSign: ${callSignCode}, ID: ${callSignId}, Approved Events: ${approvedCount}, Manual Count: ${manualCount}, Total Count: ${totalCount}`);
      });
    }
  }, [isAdmin, pendingParticipations, getCallSignCode, getCallSignParticipationCount, getManualParticipationCount]);

  const handleApprove = async (eventId: string, callSignId: string) => {
    try {
      // Get the count BEFORE approval to check if approval will trigger a milestone
      const preApprovalCount = getCallSignParticipationCount(callSignId);
      const callSignCode = getCallSignCode(callSignId);
      console.log(`Before approval: CallSign ${callSignCode} has ${preApprovalCount} participations`);
      
      // Approve the participation
      await approveEventParticipation(eventId);
      
      // Now get the updated count AFTER approval
      const postApprovalCount = getCallSignParticipationCount(callSignId);
      console.log(`After approval: CallSign ${callSignCode} now has ${postApprovalCount} participations`);
      
      // Check if any milestone was reached with this approval
      for (const milestone of milestones) {
        // If we crossed a milestone threshold with this approval
        if (preApprovalCount < milestone && postApprovalCount >= milestone) {
          console.log(`MILESTONE REACHED: CallSign ${callSignCode} reached ${milestone} participations`);
          
          // Show a toast notification
          toast({
            title: "Traguardo raggiunto!",
            description: `${callSignCode} ha raggiunto ${milestone} partecipazioni!`,
          });
          
          // Force the milestone popup to open with a slight delay to ensure state updates properly
          setTimeout(() => {
            console.log(`Setting milestone popup to open with: callSign=${callSignCode}, milestone=${milestone}`);
            setMilestoneDetails({
              callSign: callSignCode,
              milestone: milestone,
              open: true
            });
          }, 100);
          
          break;  // Only show one milestone popup at a time
        }
      }
    } catch (error) {
      console.error("Error approving participation:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'approvazione",
        variant: "destructive"
      });
    }
  };

  const closeMilestonePopup = () => {
    console.log("Closing milestone popup");
    setMilestoneDetails(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    // Log whenever milestone details change
    console.log("Milestone details changed:", milestoneDetails);
  }, [milestoneDetails]);

  if (!isAdmin) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airline-blue mb-2 flex items-center">
          <CheckCircle className="mr-2 h-6 w-6" />
          Approva Partecipazioni Eventi
        </h1>
        <p className="text-gray-600">Rivedi e approva le segnalazioni di partecipazione in attesa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Approvazioni in Attesa
          </CardTitle>
          <CardDescription>
            Segnalazioni di partecipazione in attesa di approvazione staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {pendingParticipations.length === 0 
                ? "Nessuna approvazione in attesa al momento" 
                : "Approva o rifiuta queste segnalazioni di partecipazione"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Callsign</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Rotta</TableHead>
                <TableHead>Inviato il</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingParticipations.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{getCallSignCode(event.callSignId)}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      {event.departureAirport} <Plane className="mx-2 h-3 w-3" /> {event.arrivalAirport}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(event.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-green-600">
                            <CheckCircle className="mr-1 h-4 w-4" /> Approva
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approva Partecipazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler approvare questa segnalazione di partecipazione?
                              Sarà conteggiata nelle statistiche del pilota.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() => handleApprove(event.id, event.callSignId)}
                            >
                              Approva
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <XCircle className="mr-1 h-4 w-4" /> Rifiuta
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rifiuta Partecipazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler rifiutare ed eliminare questa segnalazione di partecipazione?
                              Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => deleteEventParticipation(event.id)}
                            >
                              Rifiuta
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendingParticipations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle className="h-12 w-12 text-green-200" />
                      <p>Tutto in ordine! Nessuna approvazione in attesa.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Milestone popup - Rendered conditionally based on milestone details */}
      {milestoneDetails.open && (
        <MilestonePopup 
          callSign={milestoneDetails.callSign}
          milestone={milestoneDetails.milestone}
          open={milestoneDetails.open}
          onClose={closeMilestonePopup}
        />
      )}
    </div>
  );
};

export default ApprovalPage;
