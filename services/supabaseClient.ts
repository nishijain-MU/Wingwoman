
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpewcihfzlndnaknwiqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZXdjaWhmemxuZG5ha253aXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjI2NjEsImV4cCI6MjA3OTYzODY2MX0.inuAdJqpF0IWw_k2OrvU5jNRLUirUB1nrBw4UAipxYU';

export const supabase = createClient(supabaseUrl, supabaseKey);
