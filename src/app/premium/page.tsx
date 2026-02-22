'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { Check, Sparkles, Crown, Zap, Shield, ArrowRight } from 'lucide-react';

const FREE_FEATURES = [
  'Browse all 100+ Austin camps',
  'Filter by age, price & category',
  'Interactive map view',
  'Drag-and-drop calendar planner',
  'Registration date alerts',
];

const PREMIUM_FEATURES = [
  'Everything in Free, plus:',
  'AI-powered summer plan generator',
  'Personalized camp recommendations',
  'Priority registration alerts (48h early)',
  'Export calendar to Google/iCal',
  'Compare camps side-by-side',
  'Exclusive partner discounts',
];

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_demo',
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // Stripe not configured - show demo message
        alert('Stripe checkout is not configured yet. This is a demo.');
      }
    } catch {
      alert('Unable to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Plan the Perfect Summer
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Unlock AI-powered planning, early alerts, and exclusive deals to give your kids the best summer ever.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Free</h3>
                <p className="text-xs text-gray-400">Always free</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">$0</span>
              <span className="text-gray-400 text-sm"> / forever</span>
            </div>

            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="/#browse"
              className="block w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Start Browsing
            </a>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border-2 border-sky-500 p-6 relative"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Premium</h3>
                <p className="text-xs text-gray-400">One-time purchase</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">$19</span>
              <span className="text-gray-400 text-sm"> / summer season</span>
            </div>

            <ul className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Upgrade Now
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            Secure checkout
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Check className="w-3.5 h-3.5" />
            30-day money-back guarantee
          </div>
        </div>
      </div>
    </div>
  );
}
