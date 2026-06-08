import { createClient } from '@supabase/supabase-js';

// Te dane znajdziesz w panelu swojego projektu Supabase 
// w zakładce Project Settings (ikona zębatki) -> API
const supabaseUrl = 'https://wfqpdnqqvxzxecfdqeac.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcXBkbnFxdnh6eGVjZmRxZWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTUxNDgsImV4cCI6MjA5NjE3MTE0OH0.M2jtDOx7lGXEsqsU1n-fLTNt8ae1TcSjkZ2knapCn3U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);