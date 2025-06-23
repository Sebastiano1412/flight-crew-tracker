
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Pencil, Trash2, Plus, Tag, Hash, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { useDatabase } from "@/context/DatabaseContext";

const formSchema = z.object({
  code: z.string().min(3, {
    message: "Il callsign deve essere di almeno 3 caratteri.",
  }).max(8, {
    message: "Il callsign non deve superare gli 8 caratteri.",
  }),
  isActive: z.boolean().default(true),
  manualParticipationCount: z.coerce.number().int().min(0, {
    message: "Il conteggio manuale deve essere un numero positivo.",
  }).default(0),
});

const CallSignsPage = () => {
  const { isAdmin, database, addCallSign, updateCallSign, deleteCallSign, getManualParticipationCount, updateManualParticipationCount } = useDatabase();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCallSign, setEditingCallSign] = useState<{ id: string; code: string; isActive: boolean; manualCount: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      isActive: true,
      manualParticipationCount: 0,
    },
  });

  const resetForm = () => {
    form.reset({
      code: "",
      isActive: true,
      manualParticipationCount: 0,
    });
    setEditingCallSign(null);
  };

  function onOpenChange(open: boolean) {
    setOpenDialog(open);
    if (!open) {
      resetForm();
    }
  }

  const editCallSign = (callSign: { id: string; code: string; isActive: boolean }) => {
    const manualCount = getManualParticipationCount(callSign.id);
    setEditingCallSign({
      ...callSign,
      manualCount
    });
    form.reset({
      code: callSign.code,
      isActive: callSign.isActive,
      manualParticipationCount: manualCount,
    });
    setOpenDialog(true);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingCallSign) {
      updateCallSign(editingCallSign.id, values.code, values.isActive);
      updateManualParticipationCount(editingCallSign.id, values.manualParticipationCount);
    } else {
      addCallSign(values.code);
    }
    setOpenDialog(false);
    resetForm();
  }

  // Filter callsigns based on search term
  const filteredCallSigns = database.callSigns.filter(callSign =>
    callSign.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-airline-blue mb-2 flex items-center">
            <Tag className="mr-2 h-6 w-6" />
            Gestione Callsign
          </h1>
          <p className="text-gray-600">Aggiungi, modifica o rimuovi callsign dei piloti</p>
        </div>
        
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Aggiungi Callsign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCallSign ? "Modifica Callsign" : "Aggiungi Nuovo Callsign"}</DialogTitle>
              <DialogDescription>
                {editingCallSign 
                  ? "Aggiorna i dettagli del callsign qui sotto." 
                  : "Inserisci i dettagli del nuovo callsign."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codice Callsign</FormLabel>
                      <FormControl>
                        <Input placeholder="es. VA001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {editingCallSign && (
                  <>
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Stato Attivo</FormLabel>
                            <FormDescription>
                              I callsign inattivi non appariranno nel menu a tendina per i piloti
                            </FormDescription>
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

                    <FormField
                      control={form.control}
                      name="manualParticipationCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteggio Partecipazioni Manuale</FormLabel>
                          <FormDescription>
                            Aggiungi partecipazioni manuali (si aggiungeranno alle partecipazioni approvate)
                          </FormDescription>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <DialogFooter>
                  <Button type="submit">
                    {editingCallSign ? "Salva Modifiche" : "Aggiungi Callsign"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Lista Callsign</CardTitle>
              <CardDescription>
                Tutti i callsign registrati nel sistema
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Cerca callsign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista di tutti i callsign disponibili</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Callsign</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Partecipazioni totali</TableHead>
                <TableHead>Part. manuali</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCallSigns
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((callSign) => {
                const approvedCount = database.eventParticipations.filter(
                  ep => ep.callSignId === callSign.id && ep.isApproved
                ).length;
                
                const manualCount = getManualParticipationCount(callSign.id);
                const totalCount = approvedCount + manualCount;
                
                return (
                  <TableRow key={callSign.id}>
                    <TableCell className="font-medium">{callSign.code}</TableCell>
                    <TableCell>
                      {callSign.isActive ? (
                        <Badge className="bg-green-500">Attivo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">Inattivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>{totalCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-1 text-gray-500" />
                        {manualCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => editCallSign(callSign)}
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
                              <AlertDialogTitle>Elimina Callsign</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare il callsign "{callSign.code}"? 
                                Questa azione non può essere annullata.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => deleteCallSign(callSign.id)}
                              >
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCallSigns.length === 0 && searchTerm && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nessun callsign trovato per "{searchTerm}"
                  </TableCell>
                </TableRow>
              )}
              {database.callSigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nessun callsign aggiunto ancora
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

export default CallSignsPage;
