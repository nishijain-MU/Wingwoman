import React, { useState } from 'react';
import { User, CreditCard, Moon, Sun, LogOut, ChevronRight, Shield, Award, Camera, MessageSquare, Sparkles, HelpCircle, Heart, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { SubscriptionTier, WEEKLY_CREDITS } from '../types';
import SavedIcebreakers from './SavedIcebreakers';

interface UserProfileProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  openUpgrade: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isDarkMode, toggleTheme, openUpgrade }) => {
  const { user, savedIcebreakers, upgradeTier, logout } = useUser();
  const [view, setView] = useState<'profile' | 'saved'>('profile');

  if (!user) return null;

  if (view === 'saved') {
    return <SavedIcebreakers onBack={() => setView('profile')} />;
  }

  return (
    <div className="max-w-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display font-bold text-dark-text">Profile</h2>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-dark-elevated text-dark-text border border-dark-border">
           {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* 1. Header Card */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-dark-surface border-2 border-primary p-1">
           <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
             {user.name.charAt(0)}
           </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-dark-text">{user.name}</h3>
          <p className="text-sm text-dark-subtext">{user.email}</p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
             {user.credits.toFixed(1)} Credits
          </div>
        </div>
      </div>

      {/* 2. Stats */}
      <div className="mb-8">
        <h4 className="text-sm font-bold text-dark-subtext uppercase tracking-wider mb-3">My Profile Stats</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-elevated p-4 rounded-2xl border border-dark-border flex items-center gap-3">
             <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400"><Camera className="w-5 h-5"/></div>
             <div>
               <div className="text-xl font-bold text-dark-text">{user.stats.assessments}</div>
               <div className="text-xs text-dark-subtext">Assessments</div>
             </div>
          </div>
          <div className="bg-dark-elevated p-4 rounded-2xl border border-dark-border flex items-center gap-3">
             <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400"><MessageSquare className="w-5 h-5"/></div>
             <div>
               <div className="text-xl font-bold text-dark-text">{user.stats.icebreakers}</div>
               <div className="text-xs text-dark-subtext">Icebreakers</div>
             </div>
          </div>
          <div className="bg-dark-elevated p-4 rounded-2xl border border-dark-border flex items-center gap-3">
             <div className="bg-pink-500/10 p-2 rounded-lg text-pink-400"><Sparkles className="w-5 h-5"/></div>
             <div>
               <div className="text-xl font-bold text-dark-text">{user.stats.prompts}</div>
               <div className="text-xs text-dark-subtext">Prompts</div>
             </div>
          </div>
          <div className="bg-dark-elevated p-4 rounded-2xl border border-dark-border flex items-center gap-3">
             <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-400"><HelpCircle className="w-5 h-5"/></div>
             <div>
               <div className="text-xl font-bold text-dark-text">{user.stats.questions}</div>
               <div className="text-xs text-dark-subtext">Asked</div>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Saved Icebreakers Preview */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
           <h4 className="text-sm font-bold text-dark-subtext uppercase tracking-wider">Saved Icebreakers ({savedIcebreakers.length})</h4>
           <button onClick={() => setView('saved')} className="text-primary text-xs font-bold flex items-center hover:underline">
             View All <ArrowRight className="w-3 h-3 ml-1" />
           </button>
        </div>
        
        {savedIcebreakers.length > 0 ? (
          <div className="space-y-3">
             {savedIcebreakers.slice(0, 2).map((item) => (
                <div key={item.id} className="bg-dark-elevated p-4 rounded-xl border border-dark-border flex items-start gap-3">
                   <span className="text-lg">{item.emoji}</span>
                   <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-dark-text font-medium truncate">{item.message_text}</p>
                      <div className="flex gap-2 mt-1">
                         <span className="text-[10px] bg-dark-surface px-1.5 py-0.5 rounded text-dark-subtext border border-dark-border">{item.tone}</span>
                         <span className="text-[10px] text-dark-subtext">{new Date(item.savedAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="bg-dark-elevated p-6 rounded-xl border border-dark-border text-center">
            <p className="text-sm text-dark-subtext">No saved icebreakers yet.</p>
          </div>
        )}
      </div>

      {/* 4. Subscription Plans */}
      <div className="mb-8">
        <h4 className="text-sm font-bold text-dark-subtext uppercase tracking-wider mb-3">Subscription Plans</h4>
        <div className="space-y-3">
          {/* Free Tier */}
          <div 
             onClick={() => upgradeTier(SubscriptionTier.FREE)}
             className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${user.tier === SubscriptionTier.FREE ? 'border-primary bg-primary/5' : 'border-dark-border bg-dark-elevated'}`}
          >
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${user.tier === SubscriptionTier.FREE ? 'border-primary' : 'border-dark-subtext'}`}>
                      {user.tier === SubscriptionTier.FREE && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                   </div>
                   <div>
                      <h5 className="font-bold text-dark-text">Free Trial</h5>
                      <p className="text-xs text-dark-subtext">{WEEKLY_CREDITS[SubscriptionTier.FREE]} Credits / one-time</p>
                   </div>
                </div>
                <span className="font-bold text-dark-text">₹0</span>
             </div>
          </div>

          {/* Basic Tier */}
          <div 
             onClick={() => upgradeTier(SubscriptionTier.BASIC)}
             className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${user.tier === SubscriptionTier.BASIC ? 'border-primary bg-primary/5' : 'border-dark-border bg-dark-elevated'}`}
          >
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${user.tier === SubscriptionTier.BASIC ? 'border-primary' : 'border-dark-subtext'}`}>
                      {user.tier === SubscriptionTier.BASIC && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                   </div>
                   <div>
                      <h5 className="font-bold text-dark-text">Basic</h5>
                      <p className="text-xs text-dark-subtext">{WEEKLY_CREDITS[SubscriptionTier.BASIC]} Credits / week</p>
                   </div>
                </div>
                <span className="font-bold text-dark-text">₹129<span className="text-xs font-normal text-dark-subtext">/week</span></span>
             </div>
          </div>

          {/* Premium Tier */}
          <div 
             onClick={() => upgradeTier(SubscriptionTier.PREMIUM)}
             className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${user.tier === SubscriptionTier.PREMIUM ? 'border-primary bg-primary/5' : 'border-dark-border bg-dark-elevated'}`}
          >
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${user.tier === SubscriptionTier.PREMIUM ? 'border-primary' : 'border-dark-subtext'}`}>
                      {user.tier === SubscriptionTier.PREMIUM && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                   </div>
                   <div>
                      <h5 className="font-bold text-dark-text">Premium</h5>
                      <p className="text-xs text-dark-subtext">Unlimited Credits</p>
                   </div>
                </div>
                <span className="font-bold text-dark-text">₹199<span className="text-xs font-normal text-dark-subtext">/week</span></span>
             </div>
          </div>
        </div>
      </div>

      {/* 5. Settings */}
      <div className="mb-8">
        <h4 className="text-sm font-bold text-dark-subtext uppercase tracking-wider mb-3">Settings</h4>
        <div className="bg-dark-elevated rounded-2xl border border-dark-border overflow-hidden divide-y divide-dark-border">
          <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-dark-text/5">
             <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-dark-subtext" />
                <span className="text-dark-text">Dark Mode</span>
             </div>
             <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-400'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
             </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-dark-text/5">
             <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-dark-subtext" />
                <span className="text-dark-text">Billing Methods</span>
             </div>
             <ChevronRight className="w-4 h-4 text-dark-subtext" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-dark-text/5">
             <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-dark-subtext" />
                <span className="text-dark-text">Privacy Policy</span>
             </div>
             <ChevronRight className="w-4 h-4 text-dark-subtext" />
          </button>

           <button onClick={logout} className="w-full flex items-center justify-between p-4 hover:bg-dark-text/5">
             <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Log Out</span>
             </div>
          </button>
        </div>
      </div>
      
      <div className="text-center text-xs text-dark-subtext">
        Wingwoman v1.0.3
      </div>
    </div>
  );
};

export default UserProfile;