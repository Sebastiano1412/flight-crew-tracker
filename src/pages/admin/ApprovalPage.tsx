
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
          Approve Event Participations
        </h1>
        <p className="text-gray-600">Review and approve pending event participation reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Pending Approvals
          </CardTitle>
          <CardDescription>
            Event participation reports waiting for staff approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {pendingParticipations.length === 0 
                ? "No pending approvals at this time" 
                : "Approve or reject these participation reports"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Callsign</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                            <CheckCircle className="mr-1 h-4 w-4" /> Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Participation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve this participation report?
                              It will be counted in the pilot's statistics.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() => approveEventParticipation(event.id)}
                            >
                              Approve
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <XCircle className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Participation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject and delete this participation report?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => deleteEventParticipation(event.id)}
                            >
                              Reject
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
                      <p>All caught up! No pending approvals.</p>
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
