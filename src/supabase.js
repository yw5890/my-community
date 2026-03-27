import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vqmvhyuzxhjpuimkfcuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbXZoeXV6eGhqcHVpbWtmY3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzgxMjQsImV4cCI6MjA5MDE1NDEyNH0.Dteit_XyZN3jgbkj5Q9zm-2kmSlH-5PN_Dqu25ZgV78';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
