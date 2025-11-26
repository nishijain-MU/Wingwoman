import React, { useState } from 'react';
import { MessageCircle, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { generateIcebreakers } from '../services/geminiService';
import { CREDIT_COSTS, Icebreaker } from '../types';
import IcebreakerCard from './IcebreakerCard';

const IcebreakerGenerator = ({ openUpgrade }: { openUpgrade: () => void }) => {
  const { spendCredits, toggleSaveIcebreaker, isIcebreakerSaved } = useUser();
  const [interest, setInterest] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<{ icebreakers: Icebreaker[], pro_tip: string } | null>(null);

  const interests = ['Travel', 'Food', 'Dogs', 'Music', 'Fitness', 'Tech', 'Art', 'Coffee'];

  const handleGenerate = async () => {
    if (!interest) return;
    
    if (!spendCredits(CREDIT_COSTS.ICEBREAKER, 'icebreakers')) {
      openUpgrade();
      return;
    }

    setLoading(true);
    setGeneratedData(null);
    try {
      const response = await generateIcebreakers(interest, context);
      // Inject category if missing from response
      const enhancedIcebreakers = response.icebreakers.map((ib: any) => ({
          ...ib,
          interest_category: interest
      }));
      setGeneratedData({ ...response, icebreakers: enhancedIcebreakers });
    } catch (e) {
      console.error(e);
      alert("Oops! AI had a hiccup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedData(null);
    setInterest('');
    setContext('');
  };

  if (generatedData) {
    return (
      <div className="max-w-2xl mx-auto pb-24">
        <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-md z-10 py-4 flex items-center justify-between border-b border-dark-border mb-6">
          <button onClick={handleReset} className="flex items-center text-dark-subtext hover:text-dark-text transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-dark-text flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent" />
              Generated Options
            </h2>
          </div>
          <div className="w-12"></div> {/* Spacer for center alignment */}
        </div>

        <div className="space-y-6">
          <div className="grid gap-6">
            {generatedData.icebreakers.map((ib) => (
              <IcebreakerCard
                key={ib.id}
                data={ib}
                isSaved={isIcebreakerSaved(ib.message_text)}
                onToggleSave={() => toggleSaveIcebreaker(ib)}
              />
            ))}
          </div>

          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20 rounded-2xl p-6">
            <h3 className="text-secondary font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Pro Tip
            </h3>
            <p className="text-dark-text text-sm leading-relaxed">
              {generatedData.pro_tip}
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-dark-elevated border border-dark-border text-dark-text py-4 rounded-xl font-bold hover:bg-dark-text/5 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate New Set ({CREDIT_COSTS.ICEBREAKER} Credits)
              </>
            )}
          </button>
          
          <div className="text-center text-xs text-dark-subtext">
            Credits remaining: {useUser().user?.credits.toFixed(2)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-dark-text mb-2">Icebreaker Generator</h2>
        <p className="text-dark-subtext">Select an interest, get 5 perfect openers.</p>
      </div>

      <div className="space-y-6 bg-dark-elevated p-6 md:p-8 rounded-3xl border border-dark-border shadow-2xl">
        <div>
          <label className="block text-sm font-medium text-dark-subtext mb-3 uppercase tracking-wide">Select Interest</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.map(i => (
              <button
                key={i}
                onClick={() => setInterest(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  interest === i 
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/25 scale-105' 
                    : 'bg-dark-surface text-dark-subtext border border-dark-border hover:border-dark-text/20 hover:text-dark-text'
                }`}
              >
                {i === 'Travel' ? '✈️ ' : i === 'Food' ? '🍕 ' : i === 'Dogs' ? '🐕 ' : ''}{i}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Or type custom (e.g. Hiking, Anime)..."
            className="w-full bg-dark-surface border border-dark-border rounded-xl px-5 py-4 text-dark-text focus:border-primary outline-none transition-colors placeholder-dark-subtext"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-subtext mb-3 uppercase tracking-wide">Optional Context</label>
          <div className="bg-dark-surface rounded-xl p-4 border border-dark-border focus-within:border-primary transition-colors">
            <textarea 
              rows={3}
              placeholder="E.g., They have a golden retriever named Max..."
              className="w-full bg-transparent border-none text-dark-text focus:ring-0 outline-none text-sm resize-none placeholder-dark-subtext"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <p className="text-xs text-dark-subtext mt-2 ml-1">Helps AI personalize the message to their specific profile details.</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!interest || loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Icebreakers
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default IcebreakerGenerator;