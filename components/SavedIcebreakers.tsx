import React, { useState } from 'react';
import { ArrowLeft, Search, Heart, SlidersHorizontal } from 'lucide-react';
import { useUser } from '../context/UserContext';
import IcebreakerCard from './IcebreakerCard';

interface SavedIcebreakersProps {
  onBack: () => void;
}

const SavedIcebreakers: React.FC<SavedIcebreakersProps> = ({ onBack }) => {
  const { savedIcebreakers, deleteSavedIcebreaker, toggleSaveIcebreaker, isIcebreakerSaved } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Get unique categories from saved items + 'All'
  const categories = ['All', ...Array.from(new Set(savedIcebreakers.map(i => i.interest_category || 'Other')))];

  const filteredItems = savedIcebreakers.filter(item => {
    const matchesSearch = item.message_text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || (item.interest_category || 'Other') === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-md z-10 pb-4 pt-4 px-1 border-b border-dark-border mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-dark-text/5 text-dark-subtext hover:text-dark-text transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-dark-text flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-current" />
            Saved Icebreakers
            <span className="text-sm font-normal text-dark-subtext ml-2">({savedIcebreakers.length})</span>
          </h2>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-dark-subtext" />
            <input 
              type="text"
              placeholder="Search saved messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-12 pr-4 py-3 text-dark-text focus:border-primary outline-none placeholder-dark-subtext"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {categories.map(cat => (
               <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === cat 
                    ? 'bg-dark-surface text-dark-text border border-dark-border shadow-sm' 
                    : 'bg-dark-elevated text-dark-subtext border border-dark-border hover:border-dark-text/20'
                }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-dark-subtext">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No saved icebreakers found.</p>
            <p className="text-sm opacity-60">Try generating some new ones!</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <IcebreakerCard
              key={item.id}
              data={item}
              isSaved={true} // In this view, they are all saved
              onToggleSave={() => {}} // No-op for save button in this view, we use delete
              onDelete={() => deleteSavedIcebreaker(item.id)}
              showDelete={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SavedIcebreakers;