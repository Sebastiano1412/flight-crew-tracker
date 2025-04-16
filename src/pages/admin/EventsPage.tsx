
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Pencil, Trash2, ListFilter, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDatabase } from "@/context/DatabaseContext";

const formSchema = z.object({
  callSignId: z.string({
    required_error: "Please select a callsign.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  departureAirport: z.string().min(3, {
    message: "Departure airport must be at least 3 characters.",
  }).max(4, {
    message: "Departure airport must not exceed 4 characters.",
  }),
  arrivalAirport: z.string().min(3, {
    message: "Arrival airport must be at least 3 characters.",
  }).max(4, {
    message: "Arrival airport must not exceed 4 characters.",
  }),
  isApproved: z.boolean().default(true),
});

const EventsPage = () => {
  const { 
    isAdmin, 
    database, 
    getCallSignCode, 
    getActiveCallSigns, 
    editEventParticipation, 
    deleteEventParticipation 
  } = useDatabase();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departureAirport: "",
      arrivalAirport: "",
      isApproved: true,
    },
  });

  const resetForm = () => {
    form.reset({
      callSignId: "",
      date: undefined,
      departureAirport: "",
      arrivalAirport: "",
      isApproved: true,
    });
    setEditingEvent(null);
  };

  function onOpenChange(open: boolean) {
    setOpenDialog(open);
    if (!open) {
      resetForm();
    }
  }

  const editEvent = (eventId: string) => {
    const event = database.eventParticipations.find(ep => ep.id === eventId);
    if (!event) return;
    
    setEditingEvent(eventId);
    form.reset({
      callSignId: event.callSignId,
      date: new Date(event.date),
      departureAirport: event.departureAirport,
      arrivalAirport: event.arrivalAirport,
      isApproved: event.isApproved,
    });
    setOpenDialog(true);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingEvent) {
      editEventParticipation(
        editingEvent,
        values.callSignId,
        values.date.toISOString().split('T')[0],
        values.departureAirport.toUpperCase(),
        values.arrivalAirport.toUpperCase(),
        values.isApproved
      );
    }
    setOpenDialog(false);
    resetForm();
  }

  const filteredEvents = database.eventParticipations.filter(event => {
    if (filterStatus === "approved") return event.isApproved;
    if (filterStatus === "pending") return !event.isApproved;
    return true;
  });

  if (!isAdmin) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airline-blue mb-2 flex items-center">
          <Plane className="mr-2 h-6 w-6" />
          Manage Event Participations
        </h1>
        <p className="text-gray-600">Edit or delete participation records</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <ListFilter className="mr-2 h-5 w-5" />
                Event Participation Records
              </CardTitle>
              <CardDescription>
                All event participation reports in the system
              </CardDescription>
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as "all" | "approved" | "pending")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="approved">Approved Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {filteredEvents.length === 0 
                ? "No event participation records found" 
                : `Showing ${filteredEvents.length} records`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Callsign</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{getCallSignCode(event.callSignId)}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      {event.departureAirport} <Plane className="mx-2 h-3 w-3" /> {event.arrivalAirport}
                    </span>
                  </TableCell>
                  <TableCell>
                    {event.isApproved ? (
                      <Badge className="bg-green-500">Approved</Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => editEvent(event.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event Participation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this participation record? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => deleteEventParticipation(event.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Plane className="h-12 w-12 text-gray-200" />
                      <p>No records found matching the current filter</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Participation</DialogTitle>
            <DialogDescription>
              Update the details for this participation record
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="callSignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Callsign</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a callsign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {database.callSigns.map(callSign => (
                          <SelectItem key={callSign.id} value={callSign.id}>
                            {callSign.code} {!callSign.isActive && "(Inactive)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departureAirport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Airport</FormLabel>
                      <FormControl>
                        <Input placeholder="ICAO code (e.g. KJFK)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arrivalAirport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Airport</FormLabel>
                      <FormControl>
                        <Input placeholder="ICAO code (e.g. EGLL)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isApproved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Approval Status</FormLabel>
                      <CardDescription>
                        Approved participations are counted in statistics
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsPage;
