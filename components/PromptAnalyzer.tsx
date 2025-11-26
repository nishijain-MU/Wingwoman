import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../context/UserContext';
import { analyzePrompt } from '../services/geminiService';
import { CREDIT_COSTS } from '../types';

const PromptAnalyzer = ({ openUpgrade }: { openUpgrade: () => void }) => {
  const { spendCredits } = useUser();
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  
  // Input states
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  
  // Separate result states to keep sections independent
  const [textResult, setTextResult] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if ((inputType === 'text' && !textInput) || (inputType === 'image' && !fileInput)) return;

    if (!spendCredits(CREDIT_COSTS.PROMPT_ANALYZER)) {
      openUpgrade();
      return;
    }

    setLoading(true);
    try {
      // Only send the data relevant to the current tab
      const textPayload = inputType === 'text' ? textInput : '';
      const filePayload = inputType === 'image' ? fileInput : null;

      const response = await analyzePrompt(textPayload, filePayload);
      
      if (inputType === 'text') {
        setTextResult(response);
      } else {
        setImageResult(response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (inputType === 'text') {
      setTextResult(null);
      // We keep textInput so user can edit their previous text easily
    } else {
      setImageResult(null);
      setFileInput(null); // Clear file for new upload
    }
  };

  // Helper to transform AI's HTML span output into Markdown headers we can style
  const formatAnalysisResult = (text: string) => {
    if (!text) return '';
    // Replaces <span style="color:#FF4F79"><b>Title</b></span> with ### Title
    let formatted = text.replace(/<span style="color:\s*#FF4F79">\s*<b>(.*?)<\/b>\s*<\/span>/gi, '### $1');
    
    // Ensure bullets • get their own lines by forcing double newlines if needed
    // This handles cases where markdown renders distinct lines as a single paragraph
    formatted = formatted.replace(/([^\n])\n•/g, '$1\n\n•');
    
    return formatted;
  };

  // Determine which result to show based on active tab
  const currentResult = inputType === 'text' ? textResult : imageResult;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-dark-text">Prompt Doctor</h2>
        <p className="text-dark-subtext">Fix generic answers. Get more conversation hooks.</p>
      </div>

      <div className="bg-dark-elevated p-1 rounded-xl flex max-w-md mx-auto mb-8 border border-dark-border">
        <button
          onClick={() => setInputType('text')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            inputType === 'text' ? 'bg-dark-surface text-dark-text shadow' : 'text-dark-subtext hover:text-dark-text'
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setInputType('image')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            inputType === 'image' ? 'bg-dark-surface text-dark-text shadow' : 'text-dark-subtext hover:text-dark-text'
          }`}
        >
          Upload Screenshot
        </button>
      </div>

      {!currentResult ? (
        <div className="bg-dark-elevated p-8 rounded-2xl border border-dark-border space-y-6">
          {inputType === 'text' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-dark-subtext uppercase mb-2">The Prompt Question</label>
                <input 
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-dark-text focus:border-secondary outline-none placeholder-dark-subtext"
                  placeholder="e.g. Two truths and a lie"
                  value={textInput.split('||')[0]}
                  onChange={(e) => setTextInput(e.target.value + '||' + (textInput.split('||')[1] || ''))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-subtext uppercase mb-2">Your Answer</label>
                <textarea 
                  rows={3}
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-dark-text focus:border-secondary outline-none placeholder-dark-subtext"
                  placeholder="Your current answer..."
                  value={textInput.split('||')[1] || ''}
                  onChange={(e) => setTextInput((textInput.split('||')[0] || '') + '||' + e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-dark-border rounded-xl p-12 text-center hover:border-dark-text/30 transition-colors">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                className="hidden" 
                id="prompt-upload"
              />
              <label htmlFor="prompt-upload" className="cursor-pointer flex flex-col items-center">
                <ImageIcon className="w-12 h-12 text-secondary mb-4" />
                <span className="text-dark-text font-medium">Upload Prompt Screenshot</span>
                {fileInput && <span className="text-primary mt-2 text-sm">{fileInput.name}</span>}
              </label>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary-hover text-white py-3 rounded-xl font-bold transition-colors flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : `Analyze (${CREDIT_COSTS.PROMPT_ANALYZER} Credit)`}
          </button>
        </div>
      ) : (
        <div className="bg-dark-elevated p-8 rounded-2xl border border-dark-border">
          <div className="prose prose-invert max-w-none prose-p:text-dark-text prose-li:text-dark-text">
            <ReactMarkdown
               components={{
                 h3: ({node, ...props}) => (
                   <h3 style={{ color: '#FF4F79' }} className="text-xl font-bold mt-6 mb-3 font-display" {...props} />
                 ),
                 strong: ({node, ...props}) => (
                   <strong className="text-dark-text font-bold" {...props} />
                 ),
                 p: ({node, ...props}) => (
                   <p className="text-dark-text" {...props} />
                 ),
                 li: ({node, ...props}) => (
                   <li className="text-dark-text" {...props} />
                 )
               }}
            >
              {formatAnalysisResult(currentResult)}
            </ReactMarkdown>
          </div>
          <button 
            onClick={handleReset}
            className="mt-6 w-full py-3 border border-dark-border rounded-lg text-dark-text hover:bg-dark-text/5"
          >
            Check Another
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptAnalyzer;