import { Plane, Users, Calendar, Shield, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDatabase } from "@/context/DatabaseContext";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
const Home = () => {
  const {
    database,
    getCallSignCode,
    getCallSignParticipationCount
  } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total manual participations
  const totalManualParticipations = database?.manualParticipationCounts?.reduce((sum, mpc) => sum + mpc.count, 0) || 0;

  // Add default values in case database is not yet loaded
  const totalPilots = database?.callSigns?.filter(cs => cs.isActive)?.length || 0;
  const totalEvents = database?.eventParticipations?.filter(ep => ep.isApproved)?.length || 0;
  // Include manual participations in total events count
  const totalReports = totalEvents + totalManualParticipations;
  const pendingApprovals = database?.eventParticipations?.filter(ep => !ep.isApproved)?.length || 0;

  // Get top 5 pilots by participation count
  const topPilots = database?.callSigns?.filter(cs => cs.isActive)?.map(callSign => ({
    id: callSign.id,
    code: callSign.code,
    participationCount: getCallSignParticipationCount(callSign.id)
  }))?.sort((a, b) => b.participationCount - a.participationCount)?.slice(0, 5) || [];
  useEffect(() => {
    if (database) {
      setIsLoading(false);
    }
  }, [database]);
  if (isLoading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }
  return <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-airline-blue mb-4">Report Eventi Aerosachs</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Invia qui i tuoi report dopo aver partecipato ad un evento di Aerosachs e vedi la classifica generale delle partecipazioni
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Piloti Attivi</CardTitle>
            <Users className="h-6 w-6 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPilots}</div>
            <CardDescription>Callsign registrati</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Report Totali</CardTitle>
            <Calendar className="h-6 w-6 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReports}</div>
            <CardDescription>Partecipazioni totali</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Approvazioni in Attesa</CardTitle>
            <Shield className="h-6 w-6 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingApprovals}</div>
            <CardDescription>In attesa di approvazione</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Area Piloti</CardTitle>
            <CardDescription>Riporta la tua partecipazione agli eventi e visualizza le statistiche</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link to="/report">
              <Button className="w-full">
                <Plane className="mr-2 h-4 w-4" /> Riporta Partecipazione ad Eventi
              </Button>
            </Link>
            <Link to="/statistics">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" /> Visualizza Statistiche Piloti
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Classifica Piloti</CardTitle>
              <CardDescription>Top 5 piloti per partecipazioni</CardDescription>
            </div>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Posizione</TableHead>
                  <TableHead>Callsign</TableHead>
                  <TableHead className="text-right">Partecipazioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPilots.map((pilot, index) => <TableRow key={pilot.id}>
                    <TableCell>
                      {index === 0 ? <Badge className="bg-yellow-500">1°</Badge> : index === 1 ? <Badge className="bg-gray-400">2°</Badge> : index === 2 ? <Badge className="bg-amber-600">3°</Badge> : `${index + 1}°`}
                    </TableCell>
                    <TableCell className="font-medium">{pilot.code}</TableCell>
                    <TableCell className="text-right">{pilot.participationCount}</TableCell>
                  </TableRow>)}
                {topPilots.length === 0 && <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Nessun dato di partecipazione disponibile
                    </TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
            <div className="mt-4 text-right">
              <Link to="/statistics" className="text-airline-blue text-sm hover:underline">
                Vedi classifica completa →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Home;