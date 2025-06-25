import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session: initialSession, error } = await auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          
          // Load user profile if session exists
          if (initialSession?.user) {
            await loadUserProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await auth.signInWithGoogle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    try {
      setLoading(true);
      const { data, error } = await auth.signInWithGitHub();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { data: null, error: new Error('No user logged in') };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  // Get user display name from various sources
  const getUserDisplayName = () => {
    return (
      profile?.name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'User'
    );
  };

  // Get user avatar URL from various sources
  const getUserAvatarUrl = () => {
    return (
      profile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      null
    );
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    
    // Auth methods
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    
    // Profile methods
    updateProfile,
    loadUserProfile,
    
    // Helper methods
    getUserDisplayName,
    getUserAvatarUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};