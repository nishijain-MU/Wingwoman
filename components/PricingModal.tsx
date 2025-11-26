import React from 'react';
import { X, Check } from 'lucide-react';
import { SubscriptionTier, WEEKLY_CREDITS } from '../types';
import { useUser } from '../context/UserContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { upgradeTier, user } = useUser();

  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    upgradeTier(tier);
    onClose();
  };

  const plans = [
    {
      name: SubscriptionTier.BASIC,
      price: '₹129',
      period: '/week',
      credits: WEEKLY_CREDITS[SubscriptionTier.BASIC],
      features: ['5 Credits/Week', 'Weekly Reset', 'Access to all tools'],
      popular: false,
    },
    {
      name: SubscriptionTier.PREMIUM,
      price: '₹199',
      period: '/week',
      credits: 'Unlimited',
      features: ['Unlimited Credits', 'Priority Support', 'Advanced Analysis'],
      popular: true,
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-surface w-full max-w-3xl rounded-2xl border border-dark-border shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-dark-subtext hover:text-dark-text">
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-dark-text mb-2">Upgrade Your Wingwoman</h2>
          <p className="text-dark-subtext">Choose a plan that fits your dating goals.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-8 pt-0">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative p-6 rounded-xl border ${plan.popular ? 'border-primary bg-primary/5' : 'border-dark-border bg-dark-elevated'} flex flex-col`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-dark-text mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold text-dark-text">{plan.price}</span>
                <span className="text-dark-subtext ml-1">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center text-sm text-dark-subtext">
                    <Check className="w-4 h-4 text-primary mr-2" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={user.tier === plan.name}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white' 
                    : 'bg-dark-surface border border-dark-border text-dark-text hover:bg-dark-text/5'
                } ${user.tier === plan.name ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {user.tier === plan.name ? 'Current Plan' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;