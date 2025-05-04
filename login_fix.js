// This script will help diagnose and fix login issues
// Copy and paste this into your browser console while on your app page

async function fixLoginIssues() {
  try {
    console.log('Starting login diagnosis...');
    
    // Get Supabase credentials from environment
    const supabaseUrl = 'https://rbaxubhofbmplxpxqqdk.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYXh1YmhvZmJtcGx4cHhxcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODM5NzMsImV4cCI6MjA2MTg1OTk3M30.mQcAvzLQPq1vCygZ9LxgtjCe8_WSOB_rO8yGxZwjARI';
    
    // Initialize Supabase client
    const { createClient } = supabase;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Test credentials
    const testEmail = 'admin@cafe.com';
    const testPassword = 'password123';
    
    // Step 1: Try to sign in
    console.log(`Attempting to sign in with ${testEmail}...`);
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('Sign-in failed:', signInError);
      
      // Check if user exists in auth
      console.log('Checking if user exists in auth...');
      const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
      
      if (userError) {
        console.error('Cannot check users (requires admin privileges):', userError);
      } else {
        const user = userData.users.find(u => u.email === testEmail);
        if (user) {
          console.log('User exists in auth, but password may be incorrect');
        } else {
          console.log('User does not exist in auth, creating...');
          
          // Create user in auth
          const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
            email: testEmail,
            password: testPassword
          });
          
          if (signUpError) {
            console.error('Failed to create user in auth:', signUpError);
          } else {
            console.log('User created in auth:', signUpData);
          }
        }
      }
      
      return { success: false, error: signInError };
    }
    
    console.log('Sign in successful!', signInData);
    
    // Step 2: Check if user exists in users table
    console.log('Checking if user exists in users table...');
    const { data: profileData, error: profileError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // Create user in users table
      console.log('Creating user in users table...');
      const { error: insertError } = await supabaseClient
        .from('users')
        .insert([
          {
            id: signInData.user.id,
            email: testEmail,
            name: 'Admin User',
            role: 'admin',
            counter_type: null,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (insertError) {
        console.error('Failed to create user in users table:', insertError);
        return { success: false, error: insertError };
      }
      
      console.log('User created in users table');
    } else {
      console.log('User exists in users table:', profileData);
    }
    
    return { success: true, user: signInData.user };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}

// Run the fix
fixLoginIssues().then(result => {
  console.log('Login diagnosis complete:', result);
  
  if (result.success) {
    console.log('Login should now work. Please try logging in again with:');
    console.log('Email: admin@cafe.com');
    console.log('Password: password123');
  } else {
    console.log('Login issues could not be automatically fixed. Please check the console for more details.');
  }
});
