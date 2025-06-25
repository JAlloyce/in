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
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthContext: Getting initial session...');
        const { session: initialSession, error } = await auth.getSession();
        
        if (!isMounted) return; // Prevent state updates if unmounted
        
        if (error) {
          console.error('❌ AuthContext: Error getting session:', error);
          setLoading(false);
        } else {
          console.log('✅ AuthContext: Session loaded:', initialSession?.user?.email || 'No user');
          setSession(initialSession);
          setUser(initialSession?.user || null);
          
          // Load user profile if session exists - but don't block on it
          if (initialSession?.user) {
            console.log('👤 AuthContext: Loading user profile...');
            loadUserProfile(initialSession.user.id).finally(() => {
              if (isMounted) {
                console.log('✅ AuthContext: Profile loading complete');
              }
            });
          }
          
          // Set loading to false immediately after setting user/session
          console.log('✅ AuthContext: Loading complete, setting loading = false');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ AuthContext: Error in getInitialSession:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Fallback timeout to prevent infinite loading (reduced to 3 seconds)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('⚠️ AuthContext: Timeout reached, forcing loading = false');
        setLoading(false);
      }
    }, 3000);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('🔄 AuthContext: Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 AuthContext: User signed in, loading profile...');
          // Load profile in background, don't block
          loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 AuthContext: User signed out');
          setProfile(null);
        }
        
        console.log('✅ AuthContext: Auth state change complete, setting loading = false');
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      console.log('📋 AuthContext: Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('❌ AuthContext: Error loading profile:', error);
      } else {
        console.log('✅ AuthContext: Profile loaded:', data?.name || 'No name');
        setProfile(data);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error in loadUserProfile:', error);
    }
    // Note: Don't set loading = false here, let the parent handle it
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