
import { useState } from "react";
import { getDatabaseConfig, setDatabaseConfig } from "../config/dbConfig";
import { toast } from "sonner";
import { initializePool } from "../utils/mysqlClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

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
      // Validazione dei campi
      if (!host || !user || !database) {
        toast.error("I campi host, utente e database sono obbligatori");
        return;
      }

      // Salva la configurazione
      setDatabaseConfig({
        host,
        port: parseInt(port) || 3306,
        user,
        password,
        database,
      });

      // Prova a connettersi con la nuova configurazione
      await initializePool();
      
      toast.success("Configurazione salvata e connessione riuscita!");
      
      // Ricarica la pagina per applicare la nuova configurazione
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Errore durante il test della connessione:", error);
      toast.error("Errore di connessione al database. Verifica le credenziali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-airline-blue mb-4">
          Configurazione Database MySQL
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Inserisci i dettagli di connessione al tuo database MySQL
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Configurazione MySQL
          </CardTitle>
          <CardDescription>
            Inserisci le informazioni per connetterti al tuo database MySQL
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <Label htmlFor="port">Porta</Label>
                <Input 
                  id="port" 
                  value={port} 
                  onChange={(e) => setPort(e.target.value)} 
                  placeholder="3306"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="database">Nome Database</Label>
              <Input 
                id="database" 
                value={database} 
                onChange={(e) => setDatabase(e.target.value)} 
                placeholder="aerosachs_events"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">Utente</Label>
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
              {isLoading ? "Connessione..." : "Salva Configurazione"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseConfigPage;
