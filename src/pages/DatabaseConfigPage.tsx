
import { useState } from "react";
import { getDatabaseConfig, setDatabaseConfig } from "../config/dbConfig";
import { toast } from "sonner";
import { initializePool } from "../utils/mysqlClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

const DatabaseConfigPage = () => {
  const config = getDatabaseConfig();
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());
  const [user, setUser] = useState(config.user);
  const [password, setPassword] = useState(config.password);
  const [database, setDatabase] = useState(config.database);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate fields
      if (!host || !user || !database) {
        toast.error("Host, user, and database fields are required");
        setIsLoading(false);
        return;
      }

      // Save configuration
      setDatabaseConfig({
        host,
        port: parseInt(port) || 3306,
        user,
        password,
        database,
      });

      // Attempt to connect with new configuration
      await initializePool();
      
      toast.success("Configuration saved and connection successful!");
      
      // Reload the page to apply the new configuration
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Error connecting to database. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-airline-blue mb-4">
          MySQL Database Configuration
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Enter your MySQL database connection details
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            MySQL Configuration
          </CardTitle>
          <CardDescription>
            Enter information to connect to your MySQL database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Note: This app is using a browser-compatible mock implementation of MySQL. 
                Your data will be stored in the browser's localStorage instead of an actual MySQL server.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input 
                  id="host" 
                  value={host} 
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input 
                  id="port" 
                  value={port} 
                  onChange={(e) => setPort(e.target.value)} 
                  placeholder="3306"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="database">Database Name</Label>
              <Input 
                id="database" 
                value={database} 
                onChange={(e) => setDatabase(e.target.value)} 
                placeholder="aerosachs_events"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input 
                id="user" 
                value={user} 
                onChange={(e) => setUser(e.target.value)} 
                placeholder="root"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password"
              />
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleSave} 
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseConfigPage;
