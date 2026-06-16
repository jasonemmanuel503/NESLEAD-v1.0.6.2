import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (((import.meta as any).env?.VITE_SUPABASE_URL || '') as string).trim();
const supabaseAnonKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '') as string).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ error?: string; needsConfirmation?: boolean; token?: string; email?: string; session?: any }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.session) {
      return { needsConfirmation: true, email };
    }
    return {
      token: data.session.access_token,
      email: data.session.user?.email || email,
      session: data.session
    };
  } catch (err: any) {
    return { error: err.message || 'Error executing signup' };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error?: string; session?: any; token?: string; email?: string }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {
      session: data.session,
      token: data.session?.access_token || '',
      email: data.session?.user?.email || email
    };
  } catch (err: any) {
    return { error: err.message || 'Error executing signin' };
  }
}

export async function handleOAuthCallback(): Promise<{ token?: string; email?: string; session?: any; error?: string }> {
  if (!supabase) {
    return {};
  }
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return { error: error.message };
    if (!session) {
      // Fallback check parameter hashes
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        const token = params.get('access_token');
        const email = params.get('email') || 'user@example.com';
        if (token) {
          return { token, email };
        }
      }
      return {};
    }
    return {
      session,
      token: session.access_token,
      email: session.user?.email || 'user@example.com'
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export function onAuthStateChange(callback: (session: any) => void): { data: { subscription: { unsubscribe: () => void } } } {
  if (!supabase) {
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return {
    data: {
      subscription
    }
  };
}

export async function getCurrentSession(): Promise<any | null> {
  if (!supabase) {
    return null;
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
