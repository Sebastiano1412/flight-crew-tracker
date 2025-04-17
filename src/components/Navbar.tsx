
import { Link } from "react-router-dom";
import { Plane, LineChart, ShieldAlert, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDatabase } from "@/context/DatabaseContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { isAdmin, logout } = useDatabase();

  return (
    <nav className="bg-airline-blue text-white py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Plane className="h-6 w-6" />
          <Link to="/" className="text-xl font-bold">Report Eventi Aerosachs</Link>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-blue-800">
                <User className="mr-2 h-4 w-4" />
                Area Piloti
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/report" className="flex items-center">
                  <Plane className="mr-2 h-4 w-4" />
                  Riporta Partecipazione
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/statistics" className="flex items-center">
                  <LineChart className="mr-2 h-4 w-4" />
                  Visualizza Statistiche
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAdmin ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-blue-800">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/callsigns" className="flex items-center">
                      Gestisci Callsign
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/approve" className="flex items-center">
                      Approva Partecipazioni
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/events" className="flex items-center">
                      Gestisci Eventi
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" className="text-white hover:bg-blue-800" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Esci
              </Button>
            </>
          ) : (
            <Link to="/admin">
              <Button variant="ghost" className="text-white hover:bg-blue-800">
                <LogIn className="mr-2 h-4 w-4" />
                Accesso Admin
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
