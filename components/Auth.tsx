import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';

type AuthView = 'signin' | 'signup' | 'forgot';

const Auth = () => {
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Success State
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || 'User' },
          },
        });
        if (error) throw error;
        
        // Show success popup/message instead of immediate login expectation
        setSuccessMessage("Account created successfully! Please check your email to confirm your account before logging in.");
        
      } else if (view === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirect back to app after click
      });
      if (error) throw error;
      setSuccessMessage("Password reset link sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDismiss = () => {
    setSuccessMessage(null);
    setView('signin'); // Nudge to login page
    setError(null);
  };

  // 1. Success Popup View
  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
        <div className="w-full max-w-md bg-dark-elevated border border-dark-border rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-dark-text mb-4">Success!</h2>
          <p className="text-dark-subtext mb-8 text-sm leading-relaxed">
            {successMessage}
          </p>
          <button
            onClick={handleSuccessDismiss}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 2. Main Auth Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-dark-elevated border border-dark-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Wingwoman
          </h1>
          <p className="text-dark-subtext">Your AI Dating Consultant</p>
        </div>

        {/* FORGOT PASSWORD FORM */}
        {view === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
             <div className="mb-6">
                <button 
                  type="button" 
                  onClick={() => { setView('signin'); setError(null); }}
                  className="flex items-center text-sm text-dark-subtext hover:text-dark-text transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2">Reset Password</h3>
                <p className="text-sm text-dark-subtext">Enter your email and we'll send you a link to reset your password.</p>
             </div>

             <div>
              <label className="block text-xs font-bold text-dark-subtext uppercase mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-dark-subtext" />
                <input
                  type="email"
                  required
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl pl-10 pr-4 py-3 text-dark-text focus:border-primary outline-none transition-colors placeholder-dark-subtext"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary to-primary text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          /* SIGN IN / SIGN UP FORM */
          <form onSubmit={handleAuth} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-dark-subtext uppercase mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-dark-subtext" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl pl-10 pr-4 py-3 text-dark-text focus:border-primary outline-none transition-colors placeholder-dark-subtext"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-dark-subtext uppercase mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-dark-subtext" />
                <input
                  type="email"
                  required
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl pl-10 pr-4 py-3 text-dark-text focus:border-primary outline-none transition-colors placeholder-dark-subtext"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-xs font-bold text-dark-subtext uppercase">Password</label>
                 {view === 'signin' && (
                   <button 
                    type="button"
                    onClick={() => { setView('forgot'); setError(null); }}
                    className="text-xs text-primary hover:text-primary-hover font-medium"
                   >
                     Forgot?
                   </button>
                 )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-dark-subtext" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl pl-10 pr-4 py-3 text-dark-text focus:border-primary outline-none transition-colors placeholder-dark-subtext"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {view === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {view !== 'forgot' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                 setView(view === 'signin' ? 'signup' : 'signin');
                 setError(null);
              }}
              className="text-sm text-dark-subtext hover:text-dark-text transition-colors"
            >
              {view === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;