import React, { useState } from 'react';
import { Copy, Check, Heart, Trash2 } from 'lucide-react';
import { Icebreaker } from '../types';

interface IcebreakerCardProps {
  data: Icebreaker;
  isSaved: boolean;
  onToggleSave: () => void;
  onDelete?: () => void; // Optional delete for Saved view
  showDelete?: boolean;
}

const IcebreakerCard: React.FC<IcebreakerCardProps> = ({ 
  data, 
  isSaved, 
  onToggleSave, 
  onDelete, 
  showDelete = false 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.message_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 mb-4 shadow-sm hover:border-dark-text/20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          {data.emoji} {data.tone}
        </span>
        {data.interest_category && (
          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
             {data.interest_category}
          </span>
        )}
      </div>

      {/* Message Block - Prominent */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-l-4 border-primary rounded-r-lg p-4 mb-4">
        <p className="text-dark-text text-base leading-relaxed font-medium">
          "{data.message_text}"
        </p>
      </div>

      {/* Why it works */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-dark-subtext uppercase tracking-wide mb-1 flex items-center gap-1">
          💡 Why this works
        </h4>
        <p className="text-sm text-dark-subtext leading-relaxed">
          {data.why_it_works}
        </p>
      </div>

      {/* Follow up (Optional/Subtle) */}
      {data.follow_up && (
        <div className="mb-5 bg-dark-elevated rounded-lg p-3 border border-dark-border">
           <p className="text-xs text-dark-subtext">
             <span className="font-bold text-primary">If they respond:</span> {data.follow_up}
           </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            copied 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>

        {showDelete && onDelete ? (
           <button
           onClick={onDelete}
           className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-dark-elevated text-dark-subtext border border-dark-border hover:border-red-500/50 hover:text-red-400 transition-all"
         >
           <Trash2 className="w-4 h-4" />
           Delete
         </button>
        ) : (
          <button
            onClick={onToggleSave}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all duration-200 ${
              isSaved 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-transparent border-dark-border text-dark-text hover:border-primary/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
};

export default IcebreakerCard;