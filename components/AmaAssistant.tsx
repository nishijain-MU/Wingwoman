import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, HelpCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../context/UserContext';
import { askAma } from '../services/geminiService';
import { ChatMessage, CREDIT_COSTS } from '../types';

const AmaAssistant = ({ openUpgrade }: { openUpgrade: () => void }) => {
  const { spendCredits } = useUser();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hey! I'm your Wingwoman. Ask me anything about your dating profile, awkward conversations, or why you're getting ghosted. I'll give it to you straight.",
      timestamp: Date.now()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!spendCredits(CREDIT_COSTS.AMA_QUESTION)) {
      openUpgrade();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await askAma(userMsg.text, messages);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I ran into an issue processing that. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-dark-surface ml-3 border border-dark-border' : 'bg-primary mr-3'
              }`}>
                {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-dark-text" /> : <HelpCircle className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-dark-surface text-dark-text rounded-tr-sm border border-dark-border' 
                  : 'bg-dark-elevated text-dark-text rounded-tl-sm border border-dark-border'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-dark-text">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-dark-elevated px-4 py-3 rounded-2xl rounded-tl-sm border border-dark-border ml-11">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about a specific situation..."
          className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-6 pr-14 py-4 text-dark-text focus:border-primary outline-none shadow-lg placeholder-dark-subtext"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
        <div className="text-center mt-2">
            <span className="text-xs text-dark-subtext">Cost: {CREDIT_COSTS.AMA_QUESTION} credits per question</span>
        </div>
      </div>
    </div>
  );
};

export default AmaAssistant;