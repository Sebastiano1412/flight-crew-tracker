
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wmaqszzpybecijfdxkce.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtYXFzenpweWJlY2lqZmR4a2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MjIwNTEsImV4cCI6MjA2MDM5ODA1MX0.K8XJEAq_5MhlqDa0litJdOrr6xmIA_2T3Hw4gMHUok8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
