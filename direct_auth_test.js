// Direct authentication test
// Copy and paste this into your browser console

async function testDirectAuth() {
  try {
    // Replace with your actual Supabase URL and anon key
    const supabaseUrl = 'https://rbaxubhofbmplxpxqqdk.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYXh1YmhvZmJtcGx4cHhxcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODM5NzMsImV4cCI6MjA2MTg1OTk3M30.mQcAvzLQPq1vCygZ9LxgtjCe8_WSOB_rO8yGxZwjARI';
    
    // Create Supabase client
    const { createClient } = supabase;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test credentials
    const email = 'test@cafe.com';
    const password = 'password123';
    
    // Step 1: Try to sign in directly (this will fail if user doesn't exist)
    console.log('Attempting to sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.log('Sign-in failed, user might not exist. Creating new user...');
      
      // Step 2: Create a new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: 'Test User'
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      console.log('User created successfully:', signUpData.user);
      
      // Step 3: Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: signUpData.user.id,
            email,
            name: 'Test User',
            role: 'admin',
            counter_type: null
          }
        ]);
      
      if (insertError) {
        console.error('Error inserting user into users table:', insertError);
      } else {
        console.log('User added to users table successfully');
      }
      
      // Step 4: Try signing in again
      console.log('Attempting to sign in with new user...');
      const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (newSignInError) {
        throw newSignInError;
      }
      
      console.log('Sign in successful!', newSignInData);
      return { success: true, user: newSignInData.user };
    } else {
      console.log('Sign in successful!', signInData);
      return { success: true, user: signInData.user };
    }
  } catch (error) {
    console.error('Authentication test failed:', error);
    return { success: false, error };
  }
}

// Run the test
testDirectAuth().then(result => {
  if (result.success) {
    console.log('TEST PASSED: Authentication is working correctly');
    console.log('You can log in with:');
    console.log('Email: test@cafe.com');
    console.log('Password: password123');
  } else {
    console.log('TEST FAILED: Authentication is not working correctly');
  }
});
