import { LineChart, Users, Plane, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDatabase } from "@/context/DatabaseContext";
import { useState } from "react";
const StatisticsPage = () => {
  const {
    database,
    getCallSignCode,
    getCallSignParticipationCount
  } = useDatabase();
  const [searchTerm, setSearchTerm] = useState("");
  const activeCallSigns = database.callSigns.filter(cs => cs.isActive);
  const approvedParticipations = database.eventParticipations.filter(ep => ep.isApproved);
  const pendingParticipations = database.eventParticipations.filter(ep => !ep.isApproved);

  // Calculate total manual participations
  const totalManualParticipations = database.manualParticipationCounts.reduce((sum, mpc) => sum + mpc.count, 0);

  // Total approved participations including manual counts
  const totalParticipations = approvedParticipations.length + totalManualParticipations;

  // Sort callsigns by participation count (descending)
  const sortedCallSigns = [...activeCallSigns].sort((a, b) => {
    const countA = getCallSignParticipationCount(a.id);
    const countB = getCallSignParticipationCount(b.id);
    return countB - countA;
  });

  // Filter callsigns based on search term
  const filteredCallSigns = sortedCallSigns.filter(callSign => callSign.code.toLowerCase().includes(searchTerm.toLowerCase()));

  // Sort approved participations by approval date (most recent first)
  const recentApprovedParticipations = [...approvedParticipations].sort((a, b) => {
    const dateA = new Date(a.approvedAt || a.submittedAt).getTime();
    const dateB = new Date(b.approvedAt || b.submittedAt).getTime();
    return dateB - dateA; // Most recent first
  }).slice(0, 5);
  return <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-airline-blue mb-2 flex items-center justify-center">
          <LineChart className="mr-2 h-8 w-8" />
          Statistiche Partecipazioni Piloti
        </h1>
        <p className="text-gray-600">
          Visualizza tutti i dati di partecipazione dei piloti e le statistiche degli eventi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Piloti Attivi</CardTitle>
            <Users className="h-5 w-5 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCallSigns.length}</div>
            <CardDescription>Callsign registrati</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Partecipazioni Inviate</CardTitle>
            <Plane className="h-5 w-5 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalParticipations}</div>
            <CardDescription>Partecipazioni inviate in totale</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">In Attesa</CardTitle>
            <Badge variant="outline" className="text-yellow-600">In Attesa di Approvazione</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingParticipations.length}</div>
            <CardDescription>Partecipazioni in attesa di approvazione</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Classifica Partecipazioni Piloti</CardTitle>
              <CardDescription>
                Classifica dei piloti per numero di partecipazioni approvate agli eventi
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input placeholder="Cerca callsign..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-7 h-8 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Ordinata per numero totale di partecipazioni approvate</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Posizione</TableHead>
                <TableHead>Callsign</TableHead>
                <TableHead className="text-right">Numero Partecipazioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCallSigns.map((callSign, index) => {
              const participationCount = getCallSignParticipationCount(callSign.id);
              // Find original position in unfiltered list
              const originalIndex = sortedCallSigns.findIndex(cs => cs.id === callSign.id);
              return <TableRow key={callSign.id}>
                    <TableCell className="font-medium">
                      {originalIndex === 0 ? <Badge className="bg-yellow-500">1°</Badge> : originalIndex === 1 ? <Badge className="bg-gray-400">2°</Badge> : originalIndex === 2 ? <Badge className="bg-amber-600">3°</Badge> : `${originalIndex + 1}°`}
                    </TableCell>
                    <TableCell>{callSign.code}</TableCell>
                    <TableCell className="text-right">{participationCount}</TableCell>
                  </TableRow>;
            })}
              {filteredCallSigns.length === 0 && searchTerm && <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nessun callsign trovato per "{searchTerm}"
                  </TableCell>
                </TableRow>}
              {filteredCallSigns.length === 0 && !searchTerm && <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nessun dato di partecipazione disponibile
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Partecipazioni Recenti Approvate</CardTitle>
          <CardDescription>Ultime partecipazioni approvate</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Callsign</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Rotta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApprovedParticipations.map(event => <TableRow key={event.id}>
                  <TableCell className="font-medium">{getCallSignCode(event.callSignId)}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.departureAirport} → {event.arrivalAirport}</TableCell>
                </TableRow>)}
              {recentApprovedParticipations.length === 0 && <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nessuna partecipazione approvata ancora
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>;
};
export default StatisticsPage;