import React, { useState } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../context/UserContext';
import { analyzeProfile } from '../services/geminiService';
import { CREDIT_COSTS } from '../types';

const ProfileAssessment = ({ openUpgrade }: { openUpgrade: () => void }) => {
  const { user, spendCredits } = useUser();
  const [files, setFiles] = useState<File[]>([]);
  const [platform, setPlatform] = useState('Tinder');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const cost = result ? CREDIT_COSTS.ASSESSMENT_RETRY : CREDIT_COSTS.ASSESSMENT_FIRST;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 6)); // Max 6 images
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    
    // For free/first time user it might be 0, otherwise check credits
    if (cost > 0 && !spendCredits(cost)) {
      openUpgrade();
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeProfile(files, platform);
      setResult(response);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze profile. Please ensure you have a valid API Key.");
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-dark-text">Profile Audit</h2>
        <p className="text-dark-subtext">Upload 2-6 screenshots of your profile for a brutal but loving analysis.</p>
      </div>

      {!result ? (
        <div className="bg-dark-elevated p-8 rounded-2xl border border-dark-border space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-dark-subtext">1. Select Platform</label>
            <div className="flex gap-4">
              {['Tinder', 'Bumble', 'Hinge'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    platform === p 
                      ? 'bg-primary text-white' 
                      : 'bg-dark-surface text-dark-subtext hover:text-dark-text border border-dark-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-dark-subtext">2. Upload Screenshots</label>
            <div className="border-2 border-dashed border-dark-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-dark-surface/50">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-10 h-10 text-primary mb-4" />
                <span className="text-dark-text font-medium">Click to upload screenshots</span>
                <span className="text-xs text-dark-subtext mt-2">Max 6 files (JPG, PNG)</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <span key={i} className="text-xs bg-dark-surface px-2 py-1 rounded text-dark-subtext border border-dark-border">{f.name}</span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={files.length === 0 || loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Analyze Profile'}
            {!loading && <span className="ml-2 text-xs opacity-75">({cost === 0 ? 'FREE' : `${cost} Credits`})</span>}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-dark-elevated p-8 rounded-2xl border border-dark-border prose prose-invert max-w-none prose-p:text-dark-text prose-li:text-dark-text">
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
               {formatAnalysisResult(result)}
             </ReactMarkdown>
          </div>
          <button 
            onClick={() => { setResult(null); setFiles([]); }}
            className="w-full bg-dark-surface border border-dark-border text-dark-text py-3 rounded-xl hover:bg-dark-text/5"
          >
            Analyze Another Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileAssessment;