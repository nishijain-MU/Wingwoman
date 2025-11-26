
import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User, SubscriptionTier, WEEKLY_CREDITS, SavedIcebreaker, Icebreaker } from '../types';
import { supabase } from '../services/supabaseClient';

interface UserContextType {
  user: User | null;
  loading: boolean;
  savedIcebreakers: SavedIcebreaker[];
  spendCredits: (amount: number, activityType?: keyof User['stats']) => Promise<boolean>;
  upgradeTier: (tier: SubscriptionTier) => Promise<void>;
  resetCredits: () => Promise<void>;
  toggleSaveIcebreaker: (icebreaker: Icebreaker) => Promise<void>;
  isIcebreakerSaved: (text: string) => boolean;
  deleteSavedIcebreaker: (id: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedIcebreakers, setSavedIcebreakers] = useState<SavedIcebreaker[]>([]);

  // 1. Fetch User Profile
  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      console.error("Error fetching profile:", error);
      // Fallback or handle error
    } else {
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        tier: profile.tier as SubscriptionTier,
        credits: profile.credits,
        lastReset: profile.last_reset,
        stats: profile.stats || { assessments: 0, icebreakers: 0, prompts: 0, questions: 0 },
        onboardingCompleted: true
      });
    }

    // Load saved icebreakers
    const { data: saved } = await supabase
      .from('saved_icebreakers')
      .select('*')
      .eq('user_id', session.user.id)
      .order('saved_at', { ascending: false });
    
    if (saved) {
      setSavedIcebreakers(saved.map((item: any) => ({
        id: item.id, // DB ID
        tone: item.tone,
        emoji: item.emoji,
        message_text: item.message_text,
        why_it_works: item.why_it_works,
        follow_up: item.follow_up,
        interest_category: item.interest_category,
        character_count: item.message_text.length,
        copyable: true,
        saveable: true,
        savedAt: new Date(item.saved_at).getTime()
      })));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSavedIcebreakers([]);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const spendCredits = async (amount: number, activityType?: keyof User['stats']): Promise<boolean> => {
    if (!user) return false;
    if (user.credits >= amount) {
      const newCredits = user.credits - amount;
      const newStats = activityType ? {
        ...user.stats,
        [activityType]: (user.stats[activityType] || 0) + 1
      } : user.stats;

      // Optimistic Update
      setUser(prev => prev ? ({ ...prev, credits: newCredits, stats: newStats }) : null);

      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits, stats: newStats })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating credits:", error);
        fetchProfile(); // Revert on error
        return false;
      }
      return true;
    }
    return false;
  };

  const upgradeTier = async (tier: SubscriptionTier) => {
    if (!user) return;
    
    const newCredits = WEEKLY_CREDITS[tier];
    const { error } = await supabase
      .from('profiles')
      .update({ tier: tier, credits: newCredits })
      .eq('id', user.id);

    if (!error) {
      setUser(prev => prev ? ({ ...prev, tier, credits: newCredits }) : null);
    }
  };

  const resetCredits = async () => {
    if (!user) return;
    const newCredits = WEEKLY_CREDITS[user.tier];
    await supabase.from('profiles').update({ credits: newCredits, last_reset: new Date().toISOString() }).eq('id', user.id);
    setUser(prev => prev ? ({ ...prev, credits: newCredits, lastReset: new Date().toISOString() }) : null);
  };

  const toggleSaveIcebreaker = async (icebreaker: Icebreaker) => {
    if (!user) return;

    // Check if already saved (by message text content to allow re-saving generated ones)
    const existing = savedIcebreakers.find(i => i.message_text === icebreaker.message_text);

    if (existing) {
      // Unsave
      const { error } = await supabase.from('saved_icebreakers').delete().eq('id', existing.id);
      if (!error) {
        setSavedIcebreakers(prev => prev.filter(i => i.id !== existing.id));
      }
    } else {
      // Save
      const { data, error } = await supabase.from('saved_icebreakers').insert({
        user_id: user.id,
        tone: icebreaker.tone,
        emoji: icebreaker.emoji,
        message_text: icebreaker.message_text,
        why_it_works: icebreaker.why_it_works,
        follow_up: icebreaker.follow_up,
        interest_category: icebreaker.interest_category
      }).select().single();

      if (!error && data) {
        setSavedIcebreakers(prev => [{
          ...icebreaker,
          id: data.id, // Use DB ID
          savedAt: new Date(data.saved_at).getTime()
        }, ...prev]);
      }
    }
  };

  const deleteSavedIcebreaker = async (id: string) => {
    const { error } = await supabase.from('saved_icebreakers').delete().eq('id', id);
    if (!error) {
      setSavedIcebreakers(prev => prev.filter(i => i.id !== id));
    }
  };
  
  // Helper for generator view to check if text is saved
  // This matches generated content (which has no real DB ID yet) to saved items
  const isIcebreakerSaved = (text: string) => {
    return savedIcebreakers.some(saved => saved.message_text === text);
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      loading,
      savedIcebreakers, 
      spendCredits, 
      upgradeTier, 
      resetCredits,
      toggleSaveIcebreaker,
      isIcebreakerSaved, 
      deleteSavedIcebreaker,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
