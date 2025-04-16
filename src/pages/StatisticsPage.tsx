
import { LineChart, Users, Plane } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useDatabase } from "@/context/DatabaseContext";

const StatisticsPage = () => {
  const { database, getCallSignCode, getCallSignParticipationCount } = useDatabase();
  const activeCallSigns = database.callSigns.filter(cs => cs.isActive);
  const approvedParticipations = database.eventParticipations.filter(ep => ep.isApproved);
  const pendingParticipations = database.eventParticipations.filter(ep => !ep.isApproved);

  // Sort callsigns by participation count (descending)
  const sortedCallSigns = [...activeCallSigns].sort((a, b) => {
    const countA = getCallSignParticipationCount(a.id);
    const countB = getCallSignParticipationCount(b.id);
    return countB - countA;
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-airline-blue mb-2 flex items-center justify-center">
          <LineChart className="mr-2 h-8 w-8" />
          Pilot Participation Statistics
        </h1>
        <p className="text-gray-600">
          View all pilot participation data and event statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Active Pilots</CardTitle>
            <Users className="h-5 w-5 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCallSigns.length}</div>
            <CardDescription>Registered callsigns</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Total Events</CardTitle>
            <Plane className="h-5 w-5 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedParticipations.length}</div>
            <CardDescription>Approved participations</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Pending</CardTitle>
            <Badge variant="outline" className="text-yellow-600">Awaiting Approval</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingParticipations.length}</div>
            <CardDescription>Participations pending approval</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pilot Participation Leaderboard</CardTitle>
          <CardDescription>
            Ranking of pilots by number of approved event participations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Sorted by total approved participations</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Callsign</TableHead>
                <TableHead className="text-right">Participation Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCallSigns.map((callSign, index) => {
                const participationCount = getCallSignParticipationCount(callSign.id);
                return (
                  <TableRow key={callSign.id}>
                    <TableCell className="font-medium">
                      {index === 0 ? (
                        <Badge className="bg-yellow-500">1st</Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-gray-400">2nd</Badge>
                      ) : index === 2 ? (
                        <Badge className="bg-amber-600">3rd</Badge>
                      ) : (
                        `${index + 1}th`
                      )}
                    </TableCell>
                    <TableCell>{callSign.code}</TableCell>
                    <TableCell className="text-right">{participationCount}</TableCell>
                  </TableRow>
                );
              })}
              {sortedCallSigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No participation data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Approved Participations</CardTitle>
          <CardDescription>
            Latest event participations that have been approved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Callsign</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Route</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedParticipations.slice(0, 5).map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{getCallSignCode(event.callSignId)}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.departureAirport} → {event.arrivalAirport}</TableCell>
                </TableRow>
              ))}
              {approvedParticipations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No approved participations yet
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

export default StatisticsPage;
