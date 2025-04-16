
import { ReactNode } from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-airline-blue text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Virtual Airline Flight Crew Tracker</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
