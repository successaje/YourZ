import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get current authenticated user
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return null;

      // Get or create user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Create user profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            address: user.user_metadata?.address || '',
            username: `user_${user.id.slice(0, 6)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        return newProfile;
      }

      return { ...user, ...profile };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with wallet
  const signInWithWallet = async (address: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'wallet',
        options: {
          address: address.toLowerCase(),
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in with wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signInWithWallet,
    signOut,
    getCurrentUser,
  };
};
