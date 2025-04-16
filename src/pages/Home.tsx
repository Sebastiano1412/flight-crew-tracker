
import { Plane, Users, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDatabase } from "@/context/DatabaseContext";

const Home = () => {
  const { database } = useDatabase();
  const totalPilots = database.callSigns.filter(cs => cs.isActive).length;
  const totalEvents = database.eventParticipations.filter(ep => ep.isApproved).length;
  const pendingApprovals = database.eventParticipations.filter(ep => !ep.isApproved).length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-airline-blue mb-4">Welcome to Flight Crew Tracker</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track virtual airline pilot participation in events, manage callsigns, and view statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Active Pilots</CardTitle>
            <Users className="h-6 w-6 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPilots}</div>
            <CardDescription>Registered call signs</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Total Events</CardTitle>
            <Calendar className="h-6 w-6 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEvents}</div>
            <CardDescription>Approved participations</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Pending Approvals</CardTitle>
            <Shield className="h-6 w-6 text-airline-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingApprovals}</div>
            <CardDescription>Waiting for staff approval</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Pilot Area</CardTitle>
            <CardDescription>Report your participation in events and view statistics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link to="/report">
              <Button className="w-full">
                <Plane className="mr-2 h-4 w-4" /> Report Event Participation
              </Button>
            </Link>
            <Link to="/statistics">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" /> View Pilot Statistics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Area</CardTitle>
            <CardDescription>Manage call signs and event approvals</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link to="/admin">
              <Button className="w-full bg-airline-blue hover:bg-blue-800">
                <Shield className="mr-2 h-4 w-4" /> Access Admin Area
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
