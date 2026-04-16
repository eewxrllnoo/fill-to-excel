// Main application entry point
import { MainController } from './controllers/MainController.js';

// Supabase Configuration
// REPLACE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'postgresql://postgres:nX7m-!Wq3S@%mzy@db.untbrwccnzkvdriqbeca.supabase.co:5432/postgres';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize the application
const app = new MainController(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional: Make app available globally for debugging
window.app = app;


