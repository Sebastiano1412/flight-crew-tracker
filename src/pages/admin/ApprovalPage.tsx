
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

const ApprovalPage = () => {
  const { isAdmin, getPendingParticipations, getCallSignCode, approveEventParticipation, deleteEventParticipation } = useDatabase();

  const pendingParticipations = getPendingParticipations();

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
                              onClick={() => approveEventParticipation(event.id)}
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
    </div>
  );
};

export default ApprovalPage;
