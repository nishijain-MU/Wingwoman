import React from 'react';
import { Zap, Stethoscope, Sparkles, MessageSquare, User, Award } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useUser();

  if (!user) return null;

  const menuItems = [
    { id: 'icebreaker', label: 'Icebreakers', icon: Zap },
    { id: 'prompts', label: 'Prompt Dr.', icon: Stethoscope },
    { id: 'assess', label: 'Assess Profile', icon: Sparkles },
    { id: 'ama', label: 'Ask Wingwoman', icon: MessageSquare },
    { id: 'settings', label: 'Profile & Settings', icon: User },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-dark-elevated h-screen border-r border-dark-border fixed left-0 top-0 z-20 transition-colors duration-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Wingwoman
        </h1>
        <p className="text-xs text-dark-subtext mt-1">AI Dating Assistant</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-primary/20 text-primary border border-primary/20'
                : 'text-dark-subtext hover:bg-dark-text/5 hover:text-dark-text'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{user.tier} Plan</span>
            <Award className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-end space-x-1">
            <span className="text-2xl font-bold text-dark-text">{user.credits.toFixed(2)}</span>
            <span className="text-xs text-dark-subtext mb-1.5">credits left</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;