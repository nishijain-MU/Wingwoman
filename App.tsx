import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ProfileAssessment from './components/ProfileAssessment';
import IcebreakerGenerator from './components/IcebreakerGenerator';
import PromptAnalyzer from './components/PromptAnalyzer';
import AmaAssistant from './components/AmaAssistant';
import UserProfile from './components/UserProfile';
import PricingModal from './components/PricingModal';
import Auth from './components/Auth';
import { Award, Loader2 } from 'lucide-react';

const HeaderMobile = ({ openUpgrade, credits }: { openUpgrade: () => void, credits: number }) => {
  return (
    <div className="md:hidden fixed top-0 w-full z-30 bg-dark-elevated/95 backdrop-blur-md p-4 flex justify-between items-center border-b border-dark-border shadow-sm transition-colors duration-200">
      <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Wingwoman
      </h1>
      <button 
        onClick={openUpgrade}
        className="flex items-center space-x-2 bg-dark-surface px-3 py-1.5 rounded-full border border-dark-border shadow-sm"
      >
        <span className="text-sm font-bold text-dark-text">{credits.toFixed(1)}</span>
        <Award className="w-4 h-4 text-secondary" />
      </button>
    </div>
  );
};

const MainContent = () => {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState('icebreaker');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toggle Dark Mode Class on Body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'icebreaker': return <IcebreakerGenerator openUpgrade={() => setIsPricingOpen(true)} />;
      case 'prompts': return <PromptAnalyzer openUpgrade={() => setIsPricingOpen(true)} />;
      case 'assess': return <ProfileAssessment openUpgrade={() => setIsPricingOpen(true)} />; 
      case 'ama': return <AmaAssistant openUpgrade={() => setIsPricingOpen(true)} />;
      case 'settings': return <UserProfile isDarkMode={isDarkMode} toggleTheme={toggleTheme} openUpgrade={() => setIsPricingOpen(true)} />;
      default: return <IcebreakerGenerator openUpgrade={() => setIsPricingOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex font-body transition-colors duration-200">
      {/* Mobile Top Header (Credits & Logo only) */}
      <HeaderMobile openUpgrade={() => setIsPricingOpen(true)} credits={user.credits} />

      {/* Sidebar - Desktop Only */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-12 mt-20 md:mt-0 mb-24 md:mb-0 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <MainContent />
    </UserProvider>
  );
};

export default App;