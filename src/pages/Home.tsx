
import { Plane, Users, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDatabase } from "@/context/DatabaseContext";
import { useEffect, useState } from "react";

const Home = () => {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  
  // Add default values in case database is not yet loaded
  const totalPilots = database?.callSigns?.filter(cs => cs.isActive)?.length || 0;
  const totalEvents = database?.eventParticipations?.filter(ep => ep.isApproved)?.length || 0;
  const pendingApprovals = database?.eventParticipations?.filter(ep => !ep.isApproved)?.length || 0;

  useEffect(() => {
    if (database) {
      setIsLoading(false);
    }
  }, [database]);

  if (isLoading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-8">
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
            <CardTitle className="text-xl font-bold">Eventi Totali</CardTitle>
            <Calendar className="h-6 w-6 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEvents}</div>
            <CardDescription>Partecipazioni approvate</CardDescription>
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
          <CardHeader>
            <CardTitle>Area Staff</CardTitle>
            <CardDescription>Gestisci callsign e approvazioni eventi</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link to="/admin">
              <Button className="w-full bg-airline-blue hover:bg-blue-800">
                <Shield className="mr-2 h-4 w-4" /> Accedi Area Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
