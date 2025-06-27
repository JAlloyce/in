import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { errorHandler, ErrorUtils } from '../services/error-handler';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state changed:', event, session?.user?.email);
          
          try {
            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user);
              await loadUserProfile(session.user.id);
              setSessionExpired(false);
              setError(null);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              setSessionExpired(false);
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('🔄 Token refreshed successfully');
            } else if (event === 'PASSWORD_RECOVERY') {
              console.log('🔑 Password recovery initiated');
            }
          } catch (err) {
            const message = errorHandler.handleError(err, {
              component: 'AuthProvider',
              action: `auth_state_change_${event}`
            });
            setError(message);
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (err) {
      const message = errorHandler.handleError(err, {
        component: 'AuthProvider',
        action: 'initialize_auth'
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      console.log('👤 Loading user profile for:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          console.log('👤 Creating new profile for user:', userId);
          await createUserProfile(userId);
          return;
        }
        throw profileError;
      }

      setProfile(profileData);
      console.log('✅ Profile loaded successfully');
    } catch (err) {
      const message = errorHandler.handleError(err, {
        component: 'AuthProvider',
        action: 'load_user_profile',
        userId
      });
      console.warn('Profile loading failed:', message);
      // Don't set error state for profile issues, as it's not critical
    }
  };

  const createUserProfile = async (userId) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        throw new Error('No user data available');
      }

      const profileData = {
        id: userId,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || null,
        headline: 'Professional',
        location: null,
        about: null,
        website: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setProfile(newProfile);
      console.log('✅ Profile created successfully');
    } catch (err) {
      errorHandler.handleError(err, {
        component: 'AuthProvider',
        action: 'create_user_profile',
        userId
      });
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Signing in user:', email);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      console.log('✅ Sign in successful');
      return { data, error: null };
    } catch (err) {
      const message = ErrorUtils.handleSupabaseError(err, {
        component: 'AuthProvider',
        action: 'sign_in'
      });
      setError(message);
      return { data: null, error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Signing up user:', email);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      console.log('✅ Sign up successful');
      return { data, error: null };
    } catch (err) {
      const message = ErrorUtils.handleSupabaseError(err, {
        component: 'AuthProvider',
        action: 'sign_up'
      });
      setError(message);
      return { data: null, error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔗 Signing in with provider:', provider);

      const { data, error: providerError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (providerError) {
        throw providerError;
      }

      return { data, error: null };
    } catch (err) {
      const message = ErrorUtils.handleSupabaseError(err, {
        component: 'AuthProvider',
        action: 'sign_in_with_provider',
        provider
      });
      setError(message);
      return { data: null, error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('👋 Signing out user');

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      console.log('✅ Sign out successful');
      return { error: null };
    } catch (err) {
      const message = ErrorUtils.handleSupabaseError(err, {
        component: 'AuthProvider',
        action: 'sign_out'
      });
      setError(message);
      return { error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      console.log('👤 Updating profile for:', user.id);

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(updatedProfile);
      console.log('✅ Profile updated successfully');
      return { data: updatedProfile, error: null };
    } catch (err) {
      const message = ErrorUtils.handleSupabaseError(err, {
        component: 'AuthProvider',
        action: 'update_profile'
      });
      setError(message);
      return { data: null, error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Resetting password for:', email);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`
      });

      if (resetError) {
        throw resetError;
      }

      console.log('✅ Password reset email sent');
      return { error: null };
    } catch (err) {
      const message = ErrorUtils.handleSupabaseError(err, {
        component: 'AuthProvider',
        action: 'reset_password'
      });
      setError(message);
      return { error: { message } };
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      return { data, error: null };
    } catch (err) {
      const message = ErrorUtils.handleSupabaseError(err, {
        component: 'AuthProvider',
        action: 'refresh_session'
      });
      setError(message);
      setSessionExpired(true);
      return { data: null, error: { message } };
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Helper utility functions
  const getUserDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (user?.user_metadata?.picture) return user.user_metadata.picture;
    return null;
  };

  const value = {
    // State
    user,
    profile,
    loading,
    error,
    sessionExpired,
    
    // Methods
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    updateProfile,
    resetPassword,
    refreshSession,
    clearError,
    
    // Helper methods
    isAuthenticated: !!user,
    isLoading: loading,
    hasError: !!error,
    getUserDisplayName,
    getUserAvatarUrl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};