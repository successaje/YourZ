const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Create posts table
    const { error: createTableError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (createTableError && createTableError.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('create_posts_table');
      if (createError) {
        throw createError;
      }
      console.log('Created posts table');
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('create_posts_indexes');
    if (indexError) {
      throw indexError;
    }
    console.log('Created indexes');

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('enable_posts_rls');
    if (rlsError) {
      throw rlsError;
    }
    console.log('Enabled RLS');

    // Create policies
    const { error: policiesError } = await supabase.rpc('create_posts_policies');
    if (policiesError) {
      throw policiesError;
    }
    console.log('Created policies');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 