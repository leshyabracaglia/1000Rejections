import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
const supabaseUrl = 'https://uslpgjjbmueosmbvmhuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbHBnampibXVlb3NtYnZtaHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njk2NjYsImV4cCI6MjA4NTU0NTY2Nn0.Jkzxql2M7GFSojxlIa_VfZOWLEvJ3HFdUrUpNoNLSpI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
