// This script creates a test user in both Supabase Auth and your users table
// Run this in your browser console while on your app page

const createTestUser = async () => {
  // Replace with your actual Supabase URL and anon key
  const supabaseUrl = 'https://rbaxubhofbmplxpxqqdk.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYXh1YmhvZmJtcGx4cHhxcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODM5NzMsImV4cCI6MjA2MTg1OTk3M30.mQcAvzLQPq1vCygZ9LxgtjCe8_WSOB_rO8yGxZwjARI';
  
  // Create Supabase client
  const { createClient } = supabase;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Step 1: Create user in Supabase Auth
    const email = 'admin@cafe.com';
    const password = 'password123';
    
    console.log('Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Admin User'
        }
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    console.log('Auth user created:', authData.user);
    
    // Step 2: Create user in users table
    console.log('Creating user in users table...');
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          name: 'Admin User',
          role: 'admin',
          counter_type: null,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (userError) {
      throw userError;
    }
    
    console.log('Test user created successfully!');
    console.log('Email: admin@cafe.com');
    console.log('Password: password123');
    
    return { success: true };
  } catch (error) {
    console.error('Error creating test user:', error);
    return { success: false, error };
  }
};

// Execute the function
createTestUser().then(result => {
  console.log('Operation completed:', result);
});
