import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plane, Check, ChevronsUpDown } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useDatabase } from "@/context/DatabaseContext";
const formSchema = z.object({
  callSignId: z.string({
    required_error: "Seleziona un callsign."
  }),
  date: z.date({
    required_error: "Seleziona una data."
  }),
  departureAirport: z.string().min(3, {
    message: "L'aeroporto di partenza deve avere almeno 3 caratteri."
  }).max(4, {
    message: "L'aeroporto di partenza non deve superare i 4 caratteri."
  }),
  arrivalAirport: z.string().min(3, {
    message: "L'aeroporto di arrivo deve avere almeno 3 caratteri."
  }).max(4, {
    message: "L'aeroporto di arrivo non deve superare i 4 caratteri."
  })
});
const ReportPage = () => {
  const {
    addEventParticipation,
    getActiveCallSigns
  } = useDatabase();
  const navigate = useNavigate();
  const activeCallSigns = getActiveCallSigns().sort((a, b) => a.code.localeCompare(b.code));
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isCallsignPopoverOpen, setIsCallsignPopoverOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departureAirport: "",
      arrivalAirport: ""
    }
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    const localDateString = values.date.getFullYear() + '-' + 
      String(values.date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(values.date.getDate()).padStart(2, '0');
    addEventParticipation(values.callSignId, localDateString, values.departureAirport.toUpperCase(), values.arrivalAirport.toUpperCase());
    navigate("/statistics");
  }
  return <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center">
            <Plane className="mr-2 h-5 w-5" />
            Segnala Partecipazione ad Evento
          </CardTitle>
          <CardDescription>Compila il modulo qui sotto per segnalare la tua partecipazione a un evento di Aerosachs</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="callSignId" render={({
              field
            }) => <FormItem className="flex flex-col">
                    <FormLabel>Callsign</FormLabel>
                    <Popover open={isCallsignPopoverOpen} onOpenChange={setIsCallsignPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                            {field.value ? activeCallSigns.find(callSign => callSign.id === field.value)?.code : "Seleziona un callsign"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Cerca callsign..." />
                          <CommandList>
                            <CommandEmpty>Nessun callsign trovato.</CommandEmpty>
                            <CommandGroup>
                              {activeCallSigns.length > 0 ? activeCallSigns.map(callSign => <CommandItem value={callSign.code} key={callSign.id} onSelect={() => {
                          form.setValue("callSignId", callSign.id);
                          setIsCallsignPopoverOpen(false);
                        }}>
                                    <Check className={cn("mr-2 h-4 w-4", callSign.id === field.value ? "opacity-100" : "opacity-0")} />
                                    {callSign.code}
                                  </CommandItem>) : <CommandItem disabled>
                                  Nessun callsign attivo disponibile
                                </CommandItem>}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="date" render={({
              field
            }) => <FormItem className="flex flex-col">
                    <FormLabel>Data Evento</FormLabel>
                    <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} onClick={() => setIsDatePopoverOpen(true)}>
                            {field.value ? format(field.value, "PPP") : <span>Seleziona una data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={date => {
                    field.onChange(date);
                    if (date) setIsDatePopoverOpen(false);
                  }} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="departureAirport" render={({
                field
              }) => <FormItem>
                      <FormLabel>Aeroporto di Partenza</FormLabel>
                      <FormControl>
                        <Input placeholder="Codice ICAO (es. KJFK)" {...field} />
                      </FormControl>
                      <FormDescription>Inserisci il codice ICAO</FormDescription>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="arrivalAirport" render={({
                field
              }) => <FormItem>
                      <FormLabel>Aeroporto di Arrivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Codice ICAO (es. EGLL)" {...field} />
                      </FormControl>
                      <FormDescription>Inserisci il codice ICAO</FormDescription>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <Button type="submit" className="w-full">Invia Partecipazione</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
};
export default ReportPage;