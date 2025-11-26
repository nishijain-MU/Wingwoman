import React from 'react';
import { Zap, Stethoscope, Sparkles, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  // Navigation structure based on feedback:
  // 1. Icebreaker (Zap/Lightning)
  // 2. Prompt Dr (Stethoscope)
  // 3. Assess (Sparkles/Star - Main feature)
  // 4. AMA (Chat)
  // 5. Profile (User Settings)
  
  const navItems = [
    { id: 'icebreaker', label: 'Icebreaker', icon: Zap },
    { id: 'prompts', label: 'Prompt Dr.', icon: Stethoscope },
    { id: 'assess', label: 'Assess', icon: Sparkles, highlight: true },
    { id: 'ama', label: 'AMA', icon: MessageSquare },
    { id: 'settings', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-elevated border-t border-dark-border pb-safe z-50 transition-colors duration-200">
      <div className="flex justify-between items-end px-2 h-20 pb-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full pb-2 transition-all duration-200 group ${
                isActive ? 'text-primary' : 'text-dark-subtext hover:text-dark-text'
              }`}
            >
              <div className={`relative flex items-center justify-center transition-all duration-200 ${
                item.highlight && isActive ? '-translate-y-2' : ''
              }`}>
                {/* Highlight circle for Assess button */}
                {item.highlight && (
                  <div className={`absolute inset-0 bg-primary/20 blur-xl rounded-full transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                )}
                
                <item.icon 
                  className={`w-6 h-6 z-10 ${isActive ? 'scale-110' : 'scale-100'} ${item.highlight ? (isActive ? 'w-7 h-7' : 'w-6 h-6') : ''}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive && !item.highlight ? "currentColor" : "none"}
                />
              </div>
              
              <span className={`text-[10px] font-medium tracking-wide mt-1 ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;